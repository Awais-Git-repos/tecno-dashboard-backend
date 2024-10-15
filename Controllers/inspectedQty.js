const Records = require("../Models/Checking");

// async function getTotalInspectedQty(req, res) {
//   try {
//     const { models } = req.body; // Extract models array from request body
//     console.log("The models are: ", models);

//     const pipeline = [];

//     // If specific models are provided, filter by those models
//     if (models && models.length > 0) {
//       pipeline.push({
//         $match: {
//           Models: { $in: models }, // Match the models provided in the array
//         },
//       });
//     }

//     // Group and sum the InspectedQty for the filtered models (if any)
//     pipeline.push({
//       $group: {
//         _id: null, // We don't need grouping by any specific field
//         totalInspectedQty: { $sum: "$InspectedQty" }, // Sum inspected quantities
//       },
//     });

//     const modelSpecificResult = await Records.aggregate(pipeline);

//     // Handle the case where no records are found for the models
//     const modelSpecificQty =
//       modelSpecificResult.length > 0
//         ? modelSpecificResult[0].totalInspectedQty
//         : 0;

//     // Reset the pipeline to calculate the overall total inspected quantity
//     pipeline.length = 0; // Clear the pipeline

//     // Group to sum the total InspectedQty across all records
//     pipeline.push({
//       $group: {
//         _id: null, // Group all records together
//         overallTotalInspectedQty: { $sum: "$InspectedQty" }, // Total inspected quantity
//       },
//     });

//     const overallResult = await Records.aggregate(pipeline);

//     // Handle the case where no records are found for the overall total
//     const overallQty =
//       overallResult.length > 0 ? overallResult[0].overallTotalInspectedQty : 0;

//     // Return both quantities in the response
//     return res.status(200).json({
//       modelSpecificQty, // Total inspected quantity for specific models
//       overallQty, // Overall total inspected quantity
//     });
//   } catch (err) {
//     console.error("Error calculating total inspected quantity:", err);
//     return res
//       .status(500)
//       .json({ error: "Error calculating total inspected quantity" });
//   }
// }

// module.exports = getTotalInspectedQty;

// async function getTotalInspectedQty(req, res) {
//   try {
//     const { models, startDate, endDate } = req.body;
//     console.log("The models are: ", models);
//     console.log("The date range is:", startDate, endDate);

//     const pipeline = [];

//     // If specific models are provided, filter by those models
//     if (models && models.length > 0) {
//       pipeline.push({
//         $match: {
//           Models: { $in: models },
//         },
//       });
//     }

//     // Add date filtering if startDate and endDate are provided
//     if (startDate && endDate) {
//       pipeline.push({
//         $match: {
//           Date: {
//             $gte: startDate, // Start date as string
//             $lte: endDate, // End date as string
//           },
//         },
//       });
//     }

//     // Group and sum the InspectedQty for the filtered models (if any)
//     pipeline.push({
//       $group: {
//         _id: null,
//         totalInspectedQty: { $sum: "$InspectedQty" },
//       },
//     });

//     const modelSpecificResult = await Records.aggregate(pipeline);

//     const modelSpecificQty =
//       modelSpecificResult.length > 0
//         ? modelSpecificResult[0].totalInspectedQty
//         : 0;

//     // Reset the pipeline to calculate the overall total inspected quantity
//     pipeline.length = 0;

//     // Add date filtering for the overall total calculation
//     if (startDate && endDate) {
//       pipeline.push({
//         $match: {
//           Date: {
//             $gte: startDate, // Start date as string
//             $lte: endDate, // End date as string
//           },
//         },
//       });
//     }

//     // Group to sum the total InspectedQty across all records
//     pipeline.push({
//       $group: {
//         _id: null,
//         overallTotalInspectedQty: { $sum: "$InspectedQty" },
//       },
//     });

//     const overallResult = await Records.aggregate(pipeline);

//     const overallQty =
//       overallResult.length > 0 ? overallResult[0].overallTotalInspectedQty : 0;

//     // Return both quantities in the response
//     return res.status(200).json({
//       modelSpecificQty,
//       overallQty,
//     });
//   } catch (err) {
//     console.error("Error calculating total inspected quantity:", err);
//     return res
//       .status(500)
//       .json({ error: "Error calculating total inspected quantity" });
//   }
// }

// module.exports = getTotalInspectedQty;

async function getTotalInspectedQty(req, res) {
  try {
    const { models, startDate, endDate } = req.body;
    console.log("The models are: ", models);
    console.log("The date range is:", startDate, endDate);

    const pipeline = [];

    // If specific models are provided, filter by those models
    if (models && models.length > 0) {
      pipeline.push({
        $match: {
          Models: { $in: models },
        },
      });
    }

    // Add date filtering if startDate and endDate are provided
    if (startDate && endDate) {
      pipeline.push({
        $match: {
          Date: {
            $gte: startDate, // Start date as string
            $lte: endDate, // End date as string
          },
        },
      });
    }

    // Group and sum the InspectedQty for the filtered models (if any)
    pipeline.push({
      $group: {
        _id: null,
        totalInspectedQty: { $sum: "$InspectedQty" },
      },
    });

    const modelSpecificResult = await Records.aggregate(pipeline);

    const modelSpecificQty =
      modelSpecificResult.length > 0
        ? modelSpecificResult[0].totalInspectedQty
        : 0;

    // Reset the pipeline to calculate the overall total inspected quantity
    const overallPipeline = [
      {
        $group: {
          _id: null,
          overallTotalInspectedQty: { $sum: "$InspectedQty" },
        },
      },
    ];

    const overallResult = await Records.aggregate(overallPipeline);

    const overallQty =
      overallResult.length > 0 ? overallResult[0].overallTotalInspectedQty : 0;

    // Return both quantities in the response
    return res.status(200).json({
      modelSpecificQty,
      overallQty,
    });
  } catch (err) {
    console.error("Error calculating total inspected quantity:", err);
    return res
      .status(500)
      .json({ error: "Error calculating total inspected quantity" });
  }
}

module.exports = getTotalInspectedQty;
