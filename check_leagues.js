const { exec } = require('child_process');
const { fetchAndInsertLeagues } = require('./routes/leagues');

const runLeagues = async () => {
    exec('systemctl is-active poe-market-tracker.service', async (error, stdout) => {
        if (error) {
            console.error('Error checking service status:', error);
            return;
        }

        if (stdout.trim() === 'active') {
            try {
                await fetchAndInsertLeagues();
                console.log('Leagues data fetched and inserted successfully.');
            } catch (error) {
                console.error('Error fetching and inserting leagues:', error);
            }
        } else {
            console.log('poe-market-tracker.service is not running. Skipping leagues update.');
        }
    });
};

runLeagues();