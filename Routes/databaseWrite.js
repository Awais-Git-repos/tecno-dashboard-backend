const express = require("express");
const multer = require("multer");
const routes = express.Router();

// Define storage with a custom filename function
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Specify the destination folder
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    // Use the original filename or add logic to rename
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

const {
  databaseWrite,
  getFilesDetails,
  deleteRecords,
} = require("../Controllers/databaseWrite");

routes.post("/", upload.single("file"), databaseWrite);
routes.get("/fileData", getFilesDetails);
routes.delete("/fileDelete", deleteRecords);

module.exports = routes;
