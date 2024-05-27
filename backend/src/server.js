const express = require('express');
const cors = require("cors");

const swordleRoutes = require('./routes/api/swordle');
const connectDB = require('./configs/db');

const app = express();

// Allow cross origin requests from frontend
app.use(cors({
    origin: "http://localhost:3000"
}));


app.use("/api/swordle", swordleRoutes);

connectDB();

port = 8080

app.listen(port, () => {
    console.log('server is listening at http://localhost:'+port);
})