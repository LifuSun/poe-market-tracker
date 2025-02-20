const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
};

const checkAndCreateTables = async () => {
    const connection = await mysql.createConnection({
        host: dbConfig.host,
        user: dbConfig.user,
        password: dbConfig.password,
    });

    // Create the database if it doesn't exist
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${dbConfig.database}`);

    // Use the created database
    await connection.query(`USE ${dbConfig.database}`);

    // Read the SQL script
    const sql = fs.readFileSync(path.join(__dirname, 'scripts', 'create_database.sql'), 'utf8');

    // Split the SQL script into individual statements
    const sqlStatements = sql.split(';').map(stmt => stmt.trim()).filter(stmt => stmt.length);

    // Execute each statement sequentially
    for (const statement of sqlStatements) {
        await connection.query(statement);
    }

    await connection.end();
};

module.exports = { checkAndCreateTables };