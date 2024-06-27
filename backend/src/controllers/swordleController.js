const express = require('express');

const Swimmer = require('../models/Swimmer.js');


// Gets all of the swimmers in DB(for search bar)
module.exports.getSwimmers = async (req, res) => {
    try {
        const swimmers = await Swimmer.find();
        return res.json({status: true,
            swimmers: swimmers
        });
    }
    catch(e) {
        console.log('failed: ', e);
        return null;
    }
    
}