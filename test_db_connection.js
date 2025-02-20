// filepath: /var/www/poe-market-tracker/test_db_connection.js
const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
};

const testConnection = async () => {
    try {
        console.log('Attempting to connect to the database with the following config:', dbConfig);
        const connection = await mysql.createConnection(dbConfig);
        console.log('Database connection successful!');
        await connection.end();
    } catch (error) {
        console.error('Database connection failed:', error);
    }
};

testConnection();