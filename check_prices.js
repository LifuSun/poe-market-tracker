const { exec } = require('child_process');
const axios = require('axios');

const runPrices = async () => {
    exec('systemctl is-active poe-market-tracker.service', async (error, stdout) => {
        if (error) {
            console.error('Error checking service status:', error);
            return;
        }

        if (stdout.trim() === 'active') {
            try {
                const response = await axios.get('http://localhost:3000/api/prices/divine?league_id=1');
                console.log('Prices data fetched and processed successfully:', response.data);
            } catch (error) {
                console.error('Error fetching and processing prices:', error);
            }
        } else {
            console.log('poe-market-tracker.service is not running. Skipping prices update.');
        }
    });
};

runPrices();