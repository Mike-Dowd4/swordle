const express = require('express');

const connection = require('../configs/db');




// Gets all of the swimmers in DB(for search bar)
module.exports.getSwimmers = async (req, res) => {

    connection.query('SELECT * FROM swimmers', (err, rows, fields) => {
    if (err) return res.status(500).json({ status: false, error: err });

    return res.json({status: true,
        swimmers: rows
    });
    });
    
}