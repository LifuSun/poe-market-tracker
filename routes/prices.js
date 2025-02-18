const express = require('express');
const https = require('https');
const mysql = require('mysql2/promise');
const router = express.Router();
require('dotenv').config();

// Database configuration
const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
};

// Define the Path of Exile Trade API endpoints
const TRADE_API_URL = 'https://www.pathofexile.com/api/trade/search/';
const FETCH_ITEM_URL = 'https://www.pathofexile.com/api/trade/fetch/';

// Helper function to make HTTPS requests
const makeHttpsRequest = (url, method = 'GET', payload = null) => {
    return new Promise((resolve, reject) => {
        const options = {
            method: method,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3',
                'Accept': 'application/json',
                'Accept-Language': 'en-US,en;q=0.9',
                'Connection': 'keep-alive',
                'Content-Type': 'application/json'
            }
        };

        const req = https.request(url, options, (res) => {
            let data = '';

            // A chunk of data has been received.
            res.on('data', (chunk) => {
                data += chunk;
            });

            // The whole response has been received.
            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    try {
                        const parsedData = JSON.parse(data);
                        resolve(parsedData);
                    } catch (error) {
                        reject(new Error(`Failed to parse JSON: ${error.message}`));
                    }
                } else {
                    reject(new Error(`HTTP error! Status: ${res.statusCode}`));
                }
            });
        });

        req.on('error', (e) => {
            reject(new Error(`Request failed for URL: ${url}. Error: ${e.message}`));
        });

        if (payload) {
            req.write(JSON.stringify(payload));
        }

        req.end();
    });
};

// Helper functions to calculate statistical values
const calculateStatistics = (prices) => {
    prices.sort((a, b) => a - b);

    const mean = prices.reduce((sum, price) => sum + price, 0) / prices.length;
    const median = prices.length % 2 === 0 ? (prices[prices.length / 2 - 1] + prices[prices.length / 2]) / 2 : prices[Math.floor(prices.length / 2)];
    const mode = prices.sort((a, b) =>
        prices.filter(v => v === a).length - prices.filter(v => v === b).length
    ).pop();
    const lowerQuartile = prices[Math.floor(prices.length / 4)];
    const upperQuartile = prices[Math.floor(3 * prices.length / 4)];
    const interQuartileRange = upperQuartile - lowerQuartile;

    // Calculate IQR statistics
    const iqrPrices = prices.filter(price => price >= lowerQuartile && price <= upperQuartile);
    const iqtMean = iqrPrices.reduce((sum, price) => sum + price, 0) / iqrPrices.length;
    const iqtMedian = iqrPrices.length % 2 === 0 ? (iqrPrices[iqrPrices.length / 2 - 1] + iqrPrices[iqrPrices.length / 2]) / 2 : iqrPrices[Math.floor(iqrPrices.length / 2)];
    const iqtMode = iqrPrices.sort((a, b) =>
        iqrPrices.filter(v => v === a).length - iqrPrices.filter(v => v === b).length
    ).pop();

    return {
        mean,
        median,
        mode,
        lowerQuartile,
        upperQuartile,
        interQuartileRange,
        iqtMean,
        iqtMedian,
        iqtMode
    };
};

// Route to get the price of an item relative to chaos orbs
router.get('/prices/:shortName', async (req, res) => {
    const { shortName } = req.params;
    const { league_id } = req.query;

    if (!/^[a-zA-Z0-9]+$/.test(shortName)) {
        return res.status(400).json({ error: 'Invalid currency short name' });
    }

    if (league_id && !Number.isInteger(Number(league_id))) {
        return res.status(400).json({ error: 'Invalid league ID' });
    }

    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);

        const [currencyRows] = await connection.execute(
            `SELECT id, name FROM currencies WHERE shortName = ?`,
            [shortName]
        );

        if (currencyRows.length === 0) {
            return res.status(404).json({ error: 'Currency not found' });
        }

        const currencyId = currencyRows[0].id;
        const currencyName = currencyRows[0].name;

        let leagueToSearch = 'Standard';
        if (league_id) {
            const [leagueRows] = await connection.execute(
                `SELECT id, name FROM leagues WHERE id = ?`,
                [league_id]
            );

            if (leagueRows.length === 0) {
                return res.status(404).json({ error: 'League not found' });
            }

            leagueToSearch = leagueRows[0].name;
        }

        const searchPayload = {
            query: {
                status: { option: 'online' },
                type: currencyName,
                stats: [{ type: 'and', filters: [] }],
                filters: {
                    type_filters: {
                        filters: {
                            category: { option: 'currency' }, // Ensure the item is a currency
                        },
                    },
                    trade_filters: {
                        disabled: false,
                        filters: {
                            price: {
                                option: 'chaos',
                            },
                        },
                    },
                },
            },
            sort: { price: 'asc' },
        };

        console.log('Search Payload:', JSON.stringify(searchPayload, null, 2));

        const searchData = await makeHttpsRequest(`${TRADE_API_URL}${leagueToSearch}`, 'POST', searchPayload);
        console.log('Search Data:', JSON.stringify(searchData, null, 2));

        if (!searchData.result || searchData.result.length === 0) {
            return res.status(404).json({ error: 'No results found for the specified currency and league' });
        }

        const batchSize = 10;
        let prices = [];
        let lowest = Infinity;
        let highest = -Infinity;
        for (let i = 0; i < searchData.result.length; i += batchSize) {
            const itemIds = searchData.result.slice(i, i + batchSize);
            if (itemIds.length > 0) {
                const fetchData = await makeHttpsRequest(`${FETCH_ITEM_URL}${itemIds.join(',')}`);
                console.log('Fetch Data:', JSON.stringify(fetchData, null, 2));
                if (fetchData.result) {
                    const batchPrices = fetchData.result.map((item) => {
                        const price = item.listing.price.amount;
                        if (price < lowest) lowest = price;
                        if (price > highest) highest = price;
                        return price;
                    });
                    prices = prices.concat(batchPrices);
                }
            }
            await new Promise((resolve) => setTimeout(resolve, 1000)); // Rate limiting
        }

        if (prices.length === 0) {
            return res.status(404).json({ error: 'No prices found for the specified currency and league' });
        }

        const stats = calculateStatistics(prices);
        const checkedAt = new Date();

        // Insert the calculated statistics into the prices table
        await connection.execute(
            `INSERT INTO prices (leagueId, wantCurrencyId, haveCurrencyId, upperQuartile, lowerQuartile, mode, median, mean, lowest, highest, interQuartileRange, iqtMode, iqtMedian, iqtMean, checkedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                league_id || 1, // Default to 1 if league_id is not provided
                currencyId,
                1, // Assuming chaos orb has id 1 in the currencies table
                stats.upperQuartile,
                stats.lowerQuartile,
                stats.mode,
                stats.median,
                stats.mean,
                lowest,
                highest,
                stats.interQuartileRange,
                stats.iqtMode,
                stats.iqtMedian,
                stats.iqtMean,
                checkedAt
            ]
        );

        res.json({
            currency: currencyName,
            league: leagueToSearch,
            averagePrice: stats.mean,
            prices: prices,
        });
    } catch (error) {
        console.error('Error fetching currency price:', error);
        res.status(500).json({ error: 'Failed to fetch currency price' });
    } finally {
        if (connection) {
            await connection.end();
        }
    }
});

module.exports = router;