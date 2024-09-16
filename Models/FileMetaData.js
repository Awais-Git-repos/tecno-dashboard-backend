const mongoose = require("mongoose");
const { Schema } = mongoose;

const fileSchema = new Schema({
  filename: { type: String, required: true },
  fileId: { type: Schema.Types.ObjectId, required: true, unique: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("FileMetadata", fileSchema);
