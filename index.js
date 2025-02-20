const express = require('express');
const { checkAndCreateTables } = require('./db');
const pricesRouter = require('./routes/prices');
const leaguesRouter = require('./routes/leagues').router;
const currenciesRouter = require('./routes/currencies').router;
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Use the prices router
app.use('/api/prices', pricesRouter);

// Use the leagues router
app.use('/api/leagues', leaguesRouter);

// Use the currencies router
app.use('/api/currencies', currenciesRouter);

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