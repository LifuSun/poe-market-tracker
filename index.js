const express = require('express');
const { checkAndCreateTables } = require('./db');
const pricesRouter = require('./routes/prices');
const { router: leaguesRouter, fetchAndInsertLeagues } = require('./routes/leagues');
const { router: currenciesRouter, fetchAndInsertCurrencies } = require('./routes/currencies');
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
    await checkAndCreateTables();
    await fetchAndInsertLeagues();
    await fetchAndInsertCurrencies();
    console.log(`Server is running on http://localhost:${PORT}`);
});