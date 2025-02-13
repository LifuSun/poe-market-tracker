const express = require('express');
const { checkAndCreateTables } = require('./db');
const pricesRouter = require('./routes/prices');
const leaguesRouter = require('./routes/leagues');
const currenciesRouter = require('./routes/currencies');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Use the prices router
app.use('/api', pricesRouter);

// Use the leagues router
app.use('/api', leaguesRouter);

// Use the currencies router
app.use('/api', currenciesRouter);

// Start the server and check/create tables
app.listen(PORT, async () => {
    try {
        await checkAndCreateTables();
        console.log(`Server is running on http://localhost:${PORT}`);
    } catch (error) {
        console.error('Error starting the server:', error);
        process.exit(1); // Exit the process with an error code
    }
});

module.exports = app;