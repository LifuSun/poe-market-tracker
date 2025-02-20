const { exec } = require('child_process');
const { fetchAndInsertCurrencies } = require('./routes/currencies');

const runCurrencies = async () => {
    exec('systemctl is-active poe-market-tracker.service', async (error, stdout) => {
        if (error) {
            console.error('Error checking service status:', error);
            return;
        }

        if (stdout.trim() === 'active') {
            try {
                await fetchAndInsertCurrencies();
                console.log('Currencies data fetched and inserted successfully.');
            } catch (error) {
                console.error('Error fetching and inserting currencies:', error);
            }
        } else {
            console.log('poe-market-tracker.service is not running. Skipping currencies update.');
        }
    });
};

runCurrencies();