const { exec } = require('child_process');
const http = require('http');
const https = require('https');
const mysql = require('mysql2/promise');
require('dotenv').config();

// Database configuration
const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
};

// Helper function to make HTTP/HTTPS requests
const makeHttpsRequest = (url, method = 'GET', payload = null) => {
    return new Promise((resolve, reject) => {
        const isHttps = url.startsWith('https');
        const lib = isHttps ? https : http;
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

        const req = lib.request(url, options, (res) => {
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
                    console.error(`HTTP error! Status: ${res.statusCode}, Response: ${data}`);
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

// Helper function to add a delay
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const runPrices = async () => {
    exec('systemctl is-active poe-market-tracker.service', async (error, stdout) => {
        if (error) {
            console.error('Error checking service status:', error);
            return;
        }

        if (stdout.trim() === 'active') {
            let connection;
            try {
                connection = await mysql.createConnection(dbConfig);

                // Fetch all shortNames from the currencies table
                const [currencyRows] = await connection.execute('SELECT shortName FROM currencies');
                const currencies = currencyRows.map(row => row.shortName);

                // Fetch all ids from the leagues table
                const [leagueRows] = await connection.execute('SELECT id FROM leagues');
                const leagues = leagueRows.map(row => row.id);

                // Run the endpoint against every combination of currencies and leagues
                for (const currency of currencies) {
                    for (const leagueId of leagues) {
                        try {
                            const response = await makeHttpsRequest(`http://localhost:3000/api/prices/${currency}?league_id=${leagueId}`);
                            console.log(`Prices data fetched and processed successfully for ${currency} in league ${leagueId}:`, response);
                        } catch (error) {
                            console.error(`Error fetching and processing prices for ${currency} in league ${leagueId}:`, error);
                        }
                        await delay(30000); // Add a 10-second delay between each call
                    }
                }
            } catch (error) {
                console.error('Error fetching data from the database:', error);
            } finally {
                if (connection) {
                    await connection.end();
                }
            }
        } else {
            console.log('poe-market-tracker.service is not running. Skipping prices update.');
        }
    });
};

runPrices();