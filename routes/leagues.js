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

// Define the Path of Exile API endpoint for leagues
const POE_API_URL = 'https://www.pathofexile.com/api/leagues?type=main&realm=pc';

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

// Helper function to convert ISO 8601 datetime to MySQL DATETIME format
const convertToMySQLDateTime = (isoDate) => {
    if (!isoDate) return null;
    const date = new Date(isoDate);
    return date.toISOString().slice(0, 19).replace('T', ' ');
};

// Function to fetch and insert/update league data
const fetchAndInsertLeagues = async () => {
    try {
        // Fetch data from the Path of Exile API
        const data = await makeHttpsRequest(POE_API_URL);

        // Filter the data to get only current leagues in the PC realm
        const filteredData = data.filter(league => 
            league.category.current === true && 
            league.realm === 'pc'
        );

        // Insert or update data in the leagues table
        const connection = await mysql.createConnection(dbConfig);
        for (const league of filteredData) {
            const [rows] = await connection.execute(
                `SELECT * FROM leagues WHERE name = ?`,
                [league.id]
            );

            const now = new Date();
            const name = league.id || null;
            const realm = league.realm || null;
            const ladderUrl = league.url || null;
            const startAt = convertToMySQLDateTime(league.startAt);
            const endAt = convertToMySQLDateTime(league.endAt);
            const description = league.description || null;
            const categoryId = league.category.id || null;
            const categoryCurrent = league.category.current || null;
            const registerAt = convertToMySQLDateTime(league.registerAt);

            if (rows.length === 0) {
                await connection.execute(
                    `INSERT INTO leagues (name, realm, ladderUrl, startAt, endAt, description, categoryId, categoryCurrent, registerAt, checkedAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        name,
                        realm,
                        ladderUrl,
                        startAt,
                        endAt,
                        description,
                        categoryId,
                        categoryCurrent,
                        registerAt,
                        now,
                        now
                    ]
                );
            } else {
                const row = rows[0];
                if (row.realm !== realm || row.ladderUrl !== ladderUrl || row.startAt !== startAt || row.endAt !== endAt || row.description !== description || row.categoryId !== categoryId || row.categoryCurrent !== categoryCurrent || row.registerAt !== registerAt) {
                    await connection.execute(
                        `UPDATE leagues SET realm = ?, ladderUrl = ?, startAt = ?, endAt = ?, description = ?, categoryId = ?, categoryCurrent = ?, registerAt = ?, checkedAt = ?, updatedAt = ? WHERE name = ?`,
                        [
                            realm,
                            ladderUrl,
                            startAt,
                            endAt,
                            description,
                            categoryId,
                            categoryCurrent,
                            registerAt,
                            now,
                            now,
                            name
                        ]
                    );
                } else {
                    await connection.execute(
                        `UPDATE leagues SET checkedAt = ? WHERE name = ?`,
                        [
                            now,
                            name
                        ]
                    );
                }
            }
        }

        await connection.end();
    } catch (error) {
        console.error('Error fetching and inserting leagues:', error);
    }
};

// Run the fetchAndInsertLeagues function
fetchAndInsertLeagues();

module.exports = router;