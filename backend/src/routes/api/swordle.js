const express = require('express');
const router = express.Router();

const { getSwimmers } = require('../../controllers/swordleController');

// GET api/swordle/
// Gets all swimmers and their data in the database
router.get('/', getSwimmers);

//POST api/swordle/
//Sends guess
router.post('/', () => console.log("idk yet"));



module.exports = router;