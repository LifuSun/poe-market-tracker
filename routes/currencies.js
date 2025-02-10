const express = require('express');
const https = require('https');
const mysql = require('mysql2/promise');
const router = express.Router();
require('dotenv').config();

// Define the Path of Exile API endpoint for static data
const STATIC_DATA_URL = 'https://www.pathofexile.com/api/trade/data/static';

// Database configuration
const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
};

// Helper function to make HTTPS requests
const makeHttpsRequest = (url) => {
    return new Promise((resolve, reject) => {
        const options = {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3',
                'Accept': 'application/json',
                'Accept-Language': 'en-US,en;q=0.9',
                'Connection': 'keep-alive'
            }
        };

        https.get(url, options, (res) => {
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
        }).on('error', (e) => {
            reject(e);
        });
    });
};

// Route to fetch and return a list of all currency items
router.get('/currencies', async (req, res) => {
    try {
        // Fetch data from the Path of Exile API
        const data = await makeHttpsRequest(STATIC_DATA_URL);

        // Filter the data to get currency items
        const currencyItems = data.result.filter(item => item.id === 'Currency');

        // Insert data into the currencies table
        const connection = await mysql.createConnection(dbConfig);
        for (const currency of currencyItems) {
            for (const entry of currency.entries) {
                const [rows] = await connection.execute(
                    `SELECT short_name FROM currencies WHERE short_name = ?`,
                    [entry.id]
                );

                if (rows.length === 0) {
                    // Ensure that the name and image_url are not null
                    const name = entry.text || 'Unknown Currency';
                    const imageUrl = entry.image || 'default_image_url'; // Replace 'default_image_url' with an actual default URL if needed
                    await connection.execute(
                        `INSERT INTO currencies (short_name, name, image_url) VALUES (?, ?, ?)`,
                        [
                            entry.id || null,
                            name,
                            imageUrl
                        ]
                    );
                }
            }
        }
        await connection.end();

        // Send the currency items as a JSON response
        res.json(currencyItems);
    } catch (error) {
        // Handle errors
        console.error('Error fetching currency items:', error);
        res.status(500).json({ error: 'Failed to fetch currency items' });
    }
});

module.exports = router;