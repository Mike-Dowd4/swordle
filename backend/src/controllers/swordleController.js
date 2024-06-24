const express = require('express');

const Swimmer = require('../models/Swimmer.js');


// Gets all of the swimmers in DB(for search bar)
module.exports.getSwimmers = async (req, res) => {
    try {
        console.log('Swimmer = ', Swimmer);
        const swimmers = await Swimmer.find();
        console.log(swimmers);
    }
    catch(e) {
        console.log('failed: ', e);
        return null;
    }
    

    
}