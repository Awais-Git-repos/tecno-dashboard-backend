const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const { parse } = require("fast-csv");
const Collection = require("../Models/Checking"); // Updated model name
const FileMetadata = require("../Models/FileMetaData"); // New model
const reportFolderPath = path.join(__dirname, "..", "uploads");

// const databaseWrite = async (req, res) => {
//   try {
//     if (!req.file) {
//       return res.status(400).json({ msg: "No file uploaded" });
//     }

//     const filePath = path.join(reportFolderPath, req.file.filename);
//     console.log("The reading file is ", filePath);
//     const stream = fs.createReadStream(filePath);

//     // Create file metadata entry
//     const fileMetadata = new FileMetadata({
//       filename: req.file.filename,
//       fileId: new mongoose.Types.ObjectId(),
//     });
//     await fileMetadata.save();

//     let rows = [];

//     stream
//       .pipe(parse({ headers: true }))
//       .on("data", (row) => {
//         // Validate and convert data before pushing to rows
//         if (row.Qty) {
//           row.Qty = parseFloat(row.Qty); // Convert Qty to a number
//           if (isNaN(row.Qty)) {
//             row.Qty = 0; // Handle NaN by setting to null or a default value
//           }
//         }

//         // Add fileId to each record
//         row.fileId = fileMetadata.fileId;
//         rows.push(row); // Accumulate each row from the file
//       })
//       .on("end", async () => {
//         // Insert records into the database
//         try {
//           await Collection.insertMany(rows);
//           return res.status(200).json({ msg: "Records successfully saved" });
//         } catch (error) {
//           console.error("Error saving records:", error);
//           return res
//             .status(500)
//             .json({ msg: "Error saving data to the database", error });
//         }
//       })
//       .on("error", (error) => {
//         console.error(`Error reading CSV file (${req.file.filename}):`, error);
//         return res
//           .status(500)
//           .json({ msg: "Error processing the file", error });
//       });
//   } catch (error) {
//     return res
//       .status(500)
//       .json({ msg: "Error occurred during file processing", error });
//   }
// };

const databaseWrite = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ msg: "No file uploaded" });
    }

    const filePath = path.join(reportFolderPath, req.file.filename);
    console.log("The reading file is ", filePath);
    const stream = fs.createReadStream(filePath);

    // Create file metadata entry
    const fileMetadata = new FileMetadata({
      filename: req.file.filename,
      fileId: new mongoose.Types.ObjectId(),
    });
    await fileMetadata.save();

    let rows = [];

    stream
      .pipe(parse({ headers: true, quote: '"' })) // Ensure quoted fields are handled correctly
      .on("data", (row) => {
        // Process Qty field
        if (row["Qty"]) {
          row.Qty = parseFloat(row["Qty"]);
          if (isNaN(row.Qty)) {
            row.Qty = 0; // Handle NaN by setting to 0
          }
        }

        // Process Inspected Qty field
        if (row["InspectedQty"]) {
          row.InspectedQty = parseFloat(row["InspectedQty"]); // Convert Inspected Qty to number
          if (isNaN(row.InspectedQty)) {
            row.InspectedQty = 0; // Handle NaN by setting to 0
          }
        }

        // Process Week field
        if (row["Week"]) {
          row.Week = parseInt(row["Week"]); // Convert Week to integer
          if (isNaN(row.Week)) {
            row.Week = null; // Handle NaN by setting to null
          }
        }

        // Add fileId to each record
        row.fileId = fileMetadata.fileId;

        rows.push(row); // Accumulate each row from the file
      })
      .on("end", async () => {
        // Insert records into the database
        try {
          await Collection.insertMany(rows);
          return res.status(200).json({ msg: "Records successfully saved" });
        } catch (error) {
          console.error("Error saving records:", error);
          return res
            .status(500)
            .json({ msg: "Error saving data to the database", error });
        }
      })
      .on("error", (error) => {
        console.error(`Error reading CSV file (${req.file.filename}):`, error);
        return res
          .status(500)
          .json({ msg: "Error processing the file", error });
      });
  } catch (error) {
    return res
      .status(500)
      .json({ msg: "Error occurred during file processing", error });
  }
};

const getFilesDetails = async (req, res) => {
  try {
    const response = await FileMetadata.find();
    return res.status(200).json(response);
  } catch (error) {
    console.log(error);
    return res.status(400).json(error);
  }
};

const deleteRecords = async (req, res) => {
  try {
    // Extract fileId from request body (assuming it's sent from the client)
    const { fileId } = req.body;
    console.log(fileId);
    // Check if fileId is provided
    if (!fileId) {
      return res.status(400).json({ msg: "fileId is required" });
    }

    // Find and delete all records associated with the given fileId from Collection
    const deleteResult = await Collection.deleteMany({ fileId });

    // If no records were found and deleted, respond with an appropriate message
    if (deleteResult.deletedCount === 0) {
      return res
        .status(404)
        .json({ msg: "No records found associated with the provided fileId" });
    }

    // Find and delete the file metadata associated with the fileId
    const fileMetaDeleteResult = await FileMetadata.findOneAndDelete({
      fileId,
    });

    // Check if the file metadata was found and deleted
    if (!fileMetaDeleteResult) {
      return res
        .status(404)
        .json({ msg: "File metadata not found for the provided fileId" });
    }

    // Send a success response
    return res
      .status(200)
      .json({ msg: "Records and file metadata deleted successfully" });
  } catch (error) {
    console.error("Error deleting records:", error);
    return res.status(500).json({ msg: "Error deleting records", error });
  }
};

const deleteFile = async (req, res) => {
  try {
    // Step 1: Find all file IDs with no associated records in the Collection
    const unusedFiles = await FileMetadata.find({}).lean(); // Fetch all file metadata

    const filesToDelete = [];

    for (const fileMeta of unusedFiles) {
      const count = await Collection.countDocuments({
        fileId: fileMeta.fileId,
      });
      if (count === 0) {
        filesToDelete.push(fileMeta.fileId);
      }
    }

    // Step 2: Delete file metadata for files with no associated records
    const deleteResults = await FileMetadata.deleteMany({
      fileId: { $in: filesToDelete },
    });

    // Send a success response
    return res.status(200).json({
      msg: `${deleteResults.deletedCount} unused files deleted successfully`,
    });
  } catch (error) {
    console.error("Error deleting unused files:", error);
    return res.status(500).json({ msg: "Error deleting unused files", error });
  }
};

module.exports = { databaseWrite, getFilesDetails, deleteRecords, deleteFile };
