const express = require('express');
const cors = require("cors");

const swordleRoutes = require('./routes/api/swordle');
const connectDB = require('./configs/db');

const app = express();

// // Allow cross origin requests from frontend
// const whitelist = ['https://swordle.onrender.com']; // assuming front-end application is running here

// const corsOptions = {
//   origin: function (origin, callback) {
//     if (whitelist.indexOf(origin) !== -1) {
//       callback(null, true)
//     } else {
//       callback(new Error('Not allowed by CORS'))
//     }
//   }
// }

app.use(cors());


app.use("/api/swordle", swordleRoutes);

connectDB();

port = 8080

app.listen(port, () => {
    console.log('server is listening at http://localhost:'+port);
})