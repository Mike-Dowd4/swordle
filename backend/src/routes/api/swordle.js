const express = require('express');
const router = express.Router();

const { getSwimmers } = require('../../controllers/swordleController');

// GET api/swordle/
// Gets all swimmers and their data in the database
router.get('/', getSwimmers);




module.exports = router;