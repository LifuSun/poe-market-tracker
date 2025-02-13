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

// Define the Path of Exile API endpoint for currencies
const POE_API_URL = 'https://www.pathofexile.com/api/trade/data/static';

// Helper function to make HTTPS requests
const makeHttpsRequest = (url) => {
    return new Promise((resolve, reject) => {
        const options = {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3',
                'Accept': 'application/json',
                'Accept-Language': 'en-US,en;q=0.9',
                'Connection': 'keep-alive',
                'Content-Type': 'application/json'
            }
        };

        https.get(url, options, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

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
        }).on('error', (e) => {
            reject(e);
        });
    });
};

// Function to fetch and insert/update currency data
const fetchAndInsertCurrencies = async () => {
    try {
        // Fetch data from the Path of Exile API
        const data = await makeHttpsRequest(POE_API_URL);

        // Filter the data to get only currency information
        const currencyData = data.result.filter(entry => entry.id === 'Currency')[0].entries;

        // Insert or update data in the currencies table
        const connection = await mysql.createConnection(dbConfig);
        for (const currency of currencyData) {
            const [rows] = await connection.execute(
                `SELECT * FROM currencies WHERE shortName = ?`,
                [currency.id]
            );

            const now = new Date();
            const shortName = currency.id;
            const name = currency.text;
            const imageUrl = currency.image;

            if (rows.length === 0) {
                await connection.execute(
                    `INSERT INTO currencies (shortName, name, imageUrl, checkedAt, updatedAt) VALUES (?, ?, ?, ?, ?)`,
                    [
                        shortName,
                        name,
                        imageUrl,
                        now,
                        now
                    ]
                );
            } else {
                const row = rows[0];
                if (row.name !== name || row.imageUrl !== imageUrl) {
                    await connection.execute(
                        `UPDATE currencies SET name = ?, imageUrl = ?, checkedAt = ?, updatedAt = ? WHERE shortName = ?`,
                        [
                            name,
                            imageUrl,
                            now,
                            now,
                            shortName
                        ]
                    );
                } else {
                    await connection.execute(
                        `UPDATE currencies SET checkedAt = ? WHERE shortName = ?`,
                        [
                            now,
                            shortName
                        ]
                    );
                }
            }
        }

        await connection.end();
    } catch (error) {
        console.error('Error fetching and inserting currencies:', error);
    }
};

// Run the fetchAndInsertCurrencies function
fetchAndInsertCurrencies();

module.exports = router;