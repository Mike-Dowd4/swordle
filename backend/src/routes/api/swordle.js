const express = require('express');
const router = express.Router();

const { getSwimmers } = require('../../controllers/swordleController');


router.get('/', getSwimmers)



module.exports = router;