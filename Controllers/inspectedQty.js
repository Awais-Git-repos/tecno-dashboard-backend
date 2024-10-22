const Records = require("../Models/Checking");

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
//     const overallPipeline = [
//       {
//         $group: {
//           _id: null,
//           overallTotalInspectedQty: { $sum: "$InspectedQty" },
//         },
//       },
//     ];

//     const overallResult = await Records.aggregate(overallPipeline);

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
    const { models, startDate, endDate, lines, defects } = req.body;
    console.log("The models are: ", models);
    console.log("The date range is:", startDate, endDate);
    console.log("The lines are:", lines);
    console.log("The defects are:", defects);

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

    // Add filtering by lines if provided
    if (lines && lines.length > 0) {
      pipeline.push({
        $match: {
          Lines: { $in: lines },
        },
      });
    }

    // Add filtering by defects if provided
    if (defects && defects.length > 0) {
      pipeline.push({
        $match: {
          Defects: { $in: defects },
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
