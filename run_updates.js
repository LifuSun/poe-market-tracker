const { fetchAndInsertCurrencies } = require('./routes/currencies');
const { fetchAndInsertLeagues } = require('./routes/leagues');

const runUpdates = async () => {
    try {
        await fetchAndInsertCurrencies();
        console.log('Currencies data fetched and inserted successfully.');
    } catch (error) {
        console.error('Error fetching and inserting currencies:', error);
    }

    try {
        await fetchAndInsertLeagues();
        console.log('Leagues data fetched and inserted successfully.');
    } catch (error) {
        console.error('Error fetching and inserting leagues:', error);
    }
};

runUpdates();