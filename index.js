const express = require('express');
const { checkAndCreateTables } = require('./db');
const pricesRouter = require('./routes/prices');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Use the prices router
app.use('/api', pricesRouter);

// Start the server and check/create tables
app.listen(PORT, async () => {
    await checkAndCreateTables();
    console.log(`Server is running on http://localhost:${PORT}`);
});