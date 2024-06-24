const mongoose = require('mongoose');

const swimmerSchema = new mongoose.Schema({
    Name: {
        type: String,
        require: true
    },
    Gender: String,
    Nationality: String,
    Stroke: String,
    Specialty: String,
    US_College: String,
    D1_Conference: String,
    Birthday: String,
    Previous_D1_College: String,
    Prebious_D1_Conference: String,
    Continent_1: String,
    Continent_2: String,
    ISL_team: String,
    Former_ISL_teams: String
},
{
    collection: 'swimmers'
})

module.exports = Swimmer = mongoose.model('swimmers', swimmerSchema);