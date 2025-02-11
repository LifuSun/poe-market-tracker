const mysql = require('mysql2/promise');
const fs = require('fs');
require('dotenv').config();

// Database configuration
const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
};

// Function to clear the database
const clearDatabase = async () => {
    try {
        // Read the SQL script
        const sqlScript = fs.readFileSync('./scripts/clear_database.sql', 'utf8');

        // Split the script into individual queries
        const queries = sqlScript.split(';').filter(query => query.trim());

        // Connect to the database
        const connection = await mysql.createConnection(dbConfig);

        // Execute each query separately
        for (const query of queries) {
            await connection.query(query);
        }

        // Close the connection
        await connection.end();

        console.log('Database cleared and auto-increment counters reset successfully.');
    } catch (error) {
        console.error('Error clearing the database:', error);
    }
};

// Run the clearDatabase function
clearDatabase();