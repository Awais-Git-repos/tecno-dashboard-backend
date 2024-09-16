const mongoose = require("mongoose");
const { Schema } = mongoose;

const collectionSchema = new Schema({
  Date: String,
  Month: String,
  Year: Number,
  Lines: String,
  Models: String,
  DefectsDescription: String,
  Qty: Number,
  DefectStatus: String,
  Check: String,
  fileId: { type: Schema.Types.ObjectId, ref: "FileMetadata", required: true }, // Add this line
});

// collectionSchema.index({ DefectsDescription: 1, DefectStatus: 1 });

module.exports = mongoose.model("records-2024", collectionSchema);
