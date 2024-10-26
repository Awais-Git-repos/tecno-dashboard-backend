// const Records = require("../Models/Checking");

// async function calculateDefectRatios(req, res) {
//   try {
//     const { models, lines, defectsDescription } = req.body; // Extract models, lines, and defectsDescription from request body
//     console.log("The models are: ", models);
//     console.log("The lines are: ", lines);
//     console.log("The defectsDescription are: ", defectsDescription);

//     const pipeline = [];

//     // Apply the $match condition for models, lines, and defectsDescription if provided
//     if (
//       lines &&
//       lines.length > 0 &&
//       models &&
//       models.length > 0 &&
//       defectsDescription &&
//       defectsDescription.length > 0
//     ) {
//       pipeline.push({
//         $match: {
//           Lines: { $in: lines }, // Match specified lines
//           Models: { $in: models }, // Match specified models
//           DefectsDescription: { $in: defectsDescription }, // Match specified defects
//         },
//       });
//     }

//     // If only lines and defectsDescription are provided, filter records based on them
//     if (
//       lines &&
//       lines.length > 0 &&
//       defectsDescription &&
//       defectsDescription.length > 0 &&
//       (!models || models.length === 0)
//     ) {
//       pipeline.push({
//         $match: {
//           Lines: { $in: lines }, // Match specified lines
//           DefectsDescription: { $in: defectsDescription }, // Match specified defects
//         },
//       });
//     }

//     // If only models and defectsDescription are provided, filter records based on them
//     if (
//       models &&
//       models.length > 0 &&
//       defectsDescription &&
//       defectsDescription.length > 0 &&
//       (!lines || lines.length === 0)
//     ) {
//       pipeline.push({
//         $match: {
//           Models: { $in: models }, // Match specified models
//           DefectsDescription: { $in: defectsDescription }, // Match specified defects
//         },
//       });
//     }

//     // If only lines are provided, filter records based on lines
//     if (
//       lines &&
//       lines.length > 0 &&
//       (!models || models.length === 0) &&
//       (!defectsDescription || defectsDescription.length === 0)
//     ) {
//       pipeline.push({
//         $match: {
//           Lines: { $in: lines }, // Match specified lines
//         },
//       });
//     }

//     // If only models are provided, filter records based on models
//     if (
//       models &&
//       models.length > 0 &&
//       (!lines || lines.length === 0) &&
//       (!defectsDescription || defectsDescription.length === 0)
//     ) {
//       pipeline.push({
//         $match: {
//           Models: { $in: models }, // Match specified models
//         },
//       });
//     }

//     // If only defectsDescription is provided, filter records based on defectsDescription
//     if (
//       defectsDescription &&
//       defectsDescription.length > 0 &&
//       (!lines || lines.length === 0) &&
//       (!models || models.length === 0)
//     ) {
//       pipeline.push({
//         $match: {
//           DefectsDescription: { $in: defectsDescription }, // Match specified defects
//         },
//       });
//     }

//     // Now apply the grouping and calculations after filtering
//     pipeline.push(
//       {
//         $group: {
//           _id: {
//             model: "$Models",
//             defectStatus: { $toLower: "$DefectStatus" }, // Normalize to lowercase
//           },
//           totalDefectsDescriptionQty: { $sum: "$DefectsDescriptionqty" },
//         },
//       },
//       {
//         $group: {
//           _id: "$_id.model",
//           totalDefectsDescriptionQty: { $sum: "$totalDefectsDescriptionQty" },
//           defectRatios: {
//             $push: {
//               defectStatus: "$_id.defectStatus",
//               defectsQty: "$totalDefectsDescriptionQty",
//             },
//           },
//         },
//       },
//       {
//         $project: {
//           _id: 0,
//           model: "$_id",
//           totalDefectsDescriptionQty: 1,
//           ratios: {
//             $arrayToObject: {
//               $map: {
//                 input: "$defectRatios",
//                 as: "ratio",
//                 in: {
//                   k: "$$ratio.defectStatus",
//                   v: {
//                     $cond: {
//                       if: { $gt: ["$totalDefectsDescriptionQty", 0] },
//                       then: {
//                         $multiply: [
//                           {
//                             $divide: [
//                               "$$ratio.defectsQty",
//                               "$totalDefectsDescriptionQty",
//                             ],
//                           },
//                           100,
//                         ],
//                       },
//                       else: 0,
//                     },
//                   },
//                 },
//               },
//             },
//           },
//         },
//       },
//       {
//         $project: {
//           model: 1,
//           totalDefectsDescriptionQty: 1,
//           scanned: { $round: [{ $ifNull: ["$ratios.scanned", 0] }, 1] },
//           unscanned: { $round: [{ $ifNull: ["$ratios.un-scanned", 0] }, 1] },
//           reset: { $round: [{ $ifNull: ["$ratios.reset", 0] }, 1] },
//         },
//       }
//     );

//     const results = await Records.aggregate(pipeline);

//     // Handle case where no records match the criteria for lines, models, and defectsDescription
//     if (results.length === 0 && models && lines && defectsDescription) {
//       return res.status(400).json({ message: "Grouping not possible" });
//     }

//     return res.status(200).json(results);
//   } catch (err) {
//     console.error("Error calculating defect ratios:", err);
//     return res.status(500).json({ error: "Error calculating defect ratios" });
//   }
// }

// module.exports = calculateDefectRatios;

const Records = require("../Models/Checking");

async function calculateDefectRatios(req, res) {
  try {
    const { models, lines, defectsDescription, startDate, endDate } = req.body;
    console.log("The models are: ", models);
    console.log("The lines are: ", lines);
    console.log("The defectsDescription are: ", defectsDescription);
    console.log("The date range is:", startDate, endDate);

    const pipeline = [];

    // Apply the $match condition for models, lines, defectsDescription, and date range if provided
    const matchConditions = {};

    if (lines && lines.length > 0) {
      matchConditions.Lines = { $in: lines };
    }

    if (models && models.length > 0) {
      matchConditions.Models = { $in: models };
    }

    if (defectsDescription && defectsDescription.length > 0) {
      matchConditions.DefectsDescription = { $in: defectsDescription };
    }

    // Add string-based date filter if startDate and endDate are provided
    if (startDate && endDate) {
      matchConditions.Date = {
        $gte: startDate, // Since dates are strings, no need to convert
        $lte: endDate, // Compare directly as strings
      };

      console.log("String Date Range:", matchConditions.Date);
    }

    if (Object.keys(matchConditions).length > 0) {
      pipeline.push({
        $match: matchConditions,
      });
    }

    // Now apply the grouping and calculations after filtering
    pipeline.push(
      {
        $group: {
          _id: {
            model: "$Models",
            defectStatus: { $toLower: "$DefectStatus" }, // Normalize to lowercase
          },
          totalDefectsDescriptionQty: { $sum: "$DefectsDescriptionqty" },
        },
      },
      {
        $group: {
          _id: "$_id.model",
          totalDefectsDescriptionQty: { $sum: "$totalDefectsDescriptionQty" },
          defectRatios: {
            $push: {
              defectStatus: "$_id.defectStatus",
              defectsQty: "$totalDefectsDescriptionQty",
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          model: "$_id",
          totalDefectsDescriptionQty: 1,
          ratios: {
            $arrayToObject: {
              $map: {
                input: "$defectRatios",
                as: "ratio",
                in: {
                  k: "$$ratio.defectStatus",
                  v: {
                    $cond: {
                      if: { $gt: ["$totalDefectsDescriptionQty", 0] },
                      then: {
                        $multiply: [
                          {
                            $divide: [
                              "$$ratio.defectsQty",
                              "$totalDefectsDescriptionQty",
                            ],
                          },
                          100,
                        ],
                      },
                      else: 0,
                    },
                  },
                },
              },
            },
          },
        },
      },
      {
        $project: {
          model: 1,
          totalDefectsDescriptionQty: 1,
          scanned: { $round: [{ $ifNull: ["$ratios.scanned", 0] }, 1] },
          unscanned: { $round: [{ $ifNull: ["$ratios.un-scanned", 0] }, 1] },
          reset: { $round: [{ $ifNull: ["$ratios.reset", 0] }, 1] },
        },
      }
    );

    const results = await Records.aggregate(pipeline);

    // Handle case where no records match the criteria for lines, models, and defectsDescription
    if (results.length === 0 && models && lines && defectsDescription) {
      return res.status(400).json({ message: "Grouping not possible" });
    }

    return res.status(200).json(results);
  } catch (err) {
    console.error("Error calculating defect ratios:", err);
    return res.status(500).json({ error: "Error calculating defect ratios" });
  }
}

module.exports = calculateDefectRatios;
