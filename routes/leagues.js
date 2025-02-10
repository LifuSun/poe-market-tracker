const express = require('express');
const https = require('https');
const mysql = require('mysql2/promise');
const router = express.Router();
require('dotenv').config();

// Define the Path of Exile API endpoint for leagues
const POE_API_URL = 'https://api.pathofexile.com/leagues';

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

// Helper function to convert ISO datetime to MySQL DATETIME format
const convertToMySQLDatetime = (isoDatetime) => {
    if (!isoDatetime) return null;
    return isoDatetime.replace('T', ' ').replace('Z', '');
};

// Route to fetch and display league data
router.get('/leagues', async (req, res) => {
    try {
        // Fetch data from the Path of Exile API
        const data = await makeHttpsRequest(POE_API_URL);

        // Filter the data based on the criteria
        const filteredData = data.filter(league => 
            league.category.id !== 'Standard' && 
            league.category.current === true && 
            league.realm === 'pc'
        );

        // Insert data into the leagues table
        const connection = await mysql.createConnection(dbConfig);
        for (const league of filteredData) {
            const [rows] = await connection.execute(
                `SELECT name FROM leagues WHERE name = ?`,
                [league.id]
            );

            if (rows.length === 0) {
                await connection.execute(
                    `INSERT INTO leagues (name, realm, ladder_url, startAt, endAt, description, category_id, category_current, registerAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        league.id || null,
                        league.realm || null,
                        league.url || null,
                        convertToMySQLDatetime(league.startAt),
                        convertToMySQLDatetime(league.endAt),
                        league.description || null,
                        league.category.id || null,
                        league.category.current || null,
                        convertToMySQLDatetime(league.registerAt)
                    ]
                );
            }
        }
        await connection.end();

        // Send the filtered data as a JSON response
        res.json(filteredData);
    } catch (error) {
        // Handle errors
        console.error('Error fetching league data:', error);
        res.status(500).json({ error: 'Failed to fetch league data' });
    }
});

module.exports = router;