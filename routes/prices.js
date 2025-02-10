const express = require('express');
const router = express.Router();

// Define a simple route for demonstration
router.get('/prices', (req, res) => {
    res.json({ message: 'Prices endpoint' });
});

module.exports = router;