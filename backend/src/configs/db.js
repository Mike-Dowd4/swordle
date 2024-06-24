const mongoose = require("mongoose");
const path = require('path')



require("dotenv").config({path: path.resolve(__dirname, '../../../.env')});

const db = process.env.MONGO_URL;

mongoose.set("strictQuery", true, "useNewUrlParser", true);

const connectDB = async () => {
  try {
    await mongoose.connect(db, {
      dbName: "swimmer_data"
    });
    console.log("MongoDB is Connected...");
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};
module.exports = connectDB;