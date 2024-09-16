const mongoose = require("mongoose");

const connectDB = (server) => {
  mongoose
    .connect("mongodb://localhost:27017/Tecno")
    .then(() => {
      console.log("Db Connected");
    })
    .then(() => {
      server();
    })
    .catch((err) => {
      console.log("The Err is: ", err.message);
    });
};

module.exports = connectDB;
