const express = require('express');
const app = express();
const PORT = 3000;

// Define the Path of Exile Trade API endpoint
const TRADE_API_URL = 'https://www.pathofexile.com/api/trade/search/Settlers';
const FETCH_ITEM_URL = 'https://www.pathofexile.com/api/trade/fetch/';

// Route to fetch Divine Orb to Chaos Orb exchange rate
app.get('/divine-to-chaos', async (req, res) => {
    try {
        // Step 1: Search for Divine Orbs listed for sale in the Settlers League
        const searchPayload = {
            query: {
                status: { option: 'online' },
                type: 'Divine Orb',
                stats: [{ type: 'and', filters: [] }],
                filters: {
                    trade_filters: {
                        disabled: false,
                        filters: {
                            price: {
                                option: 'chaos',
                            },
                        },
                    },
                },
            },
            sort: { price: 'asc' },
        };

        const searchResponse = await fetch(TRADE_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'MyPoEApp/1.0',
            },
            body: JSON.stringify(searchPayload),
        });

        if (!searchResponse.ok) {
            throw new Error(`HTTP error! Status: ${searchResponse.status}`);
        }

        const searchData = await searchResponse.json();

        // Step 2: Fetch the first few listings to get the price
        const itemIds = searchData.result.slice(0, 10); // Get the first 10 listings
        const fetchResponse = await fetch(`${FETCH_ITEM_URL}${itemIds.join(',')}`);
        if (!fetchResponse.ok) {
            throw new Error(`HTTP error! Status: ${fetchResponse.status}`);
        }

        const fetchData = await fetchResponse.json();

        // Step 3: Extract the Chaos Orb price from the listings
        const prices = fetchData.result.map((item) => {
            return {
                listing: item.listing,
                price: item.listing.price,
            };
        });

        // Step 4: Send the prices as a JSON response
        res.json({ prices });
    } catch (error) {
        console.error('Error fetching Divine Orb price:', error);
        res.status(500).json({ error: 'Failed to fetch Divine Orb price' });
    }
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on http://192.168.1.69:${PORT}`);
});