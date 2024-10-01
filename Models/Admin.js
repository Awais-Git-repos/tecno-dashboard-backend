const mongoose = require("mongoose");
const { Schema } = mongoose;

const user = new Schema({
  email: { type: String, required: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("admin", user);
