// const Records = require("../Models/Checking"); // Import your Mongoose model

// async function calculateDefectRatios(req, res) {
//   try {
//     const { model,lines } = req.body; // Extract model from request body if needed
//     console.log("The model(s) is/are: ", model);

//     const pipeline = [
//       // Conditionally add the $match stage if models are provided
//       ...(model && model.length > 0
//         ? [
//             {
//               $match: {
//                 Models: { $in: Array.isArray(model) ? model : [model] },
//               },
//             },
//           ]
//         : []), // If no model is provided, no $match stage is added (fetch for all models)
//       // Group by model and normalized defect status (lowercase)
//       {
//         $group: {
//           _id: {
//             model: "$Models",
//             defectStatus: { $toLower: "$DefectStatus" }, // Normalize to lowercase
//           },
//           totalDefectsDescriptionQty: { $sum: "$DefectsDescriptionqty" },
//         },
//       },
//       // Group by model and calculate total DefectsDescriptionqty for each model
//       {
//         $group: {
//           _id: "$_id.model",
//           totalDefectsDescriptionQty: { $sum: "$totalDefectsDescriptionQty" }, // Total for model
//           defectRatios: {
//             $push: {
//               defectStatus: "$_id.defectStatus",
//               defectsQty: "$totalDefectsDescriptionQty",
//             },
//           },
//         },
//       },
//       // Calculate the ratios for each defect status
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
//       // Project to match the desired format, handle keys like 'un-scanned' and apply rounding
//       {
//         $project: {
//           model: 1,
//           totalDefectsDescriptionQty: 1,
//           // Apply $round for scanned and unscanned to get single decimal precision
//           scanned: { $round: [{ $ifNull: ["$ratios.scanned", 0] }, 1] }, // Lowercase 'scanned'
//           unscanned: { $round: [{ $ifNull: ["$ratios.un-scanned", 0] }, 1] }, // Lowercase 'un-scanned'
//           reset: { $round: [{ $ifNull: ["$ratios.reset", 0] }, 1] }, // Lowercase 'reset'
//         },
//       },
//     ];

//     const results = await Records.aggregate(pipeline);
//     console.log(results);
//     return res.status(200).json(results);
//   } catch (err) {
//     console.error("Error calculating defect ratios:", err);
//     return res.status(500).json({ error: "Error calculating defect ratios" });
//   }
// }

// module.exports = calculateDefectRatios;

// const Records = require("../Models/Checking"); // Import your Mongoose model

// async function calculateDefectRatios(req, res) {
//   try {
//     const { model, lines } = req.body; // Extract model and lines from request body
//     console.log("The model(s) is/are: ", model);
//     console.log("The line(s) is/are: ", lines);

//     const pipeline = [
//       // Conditionally add the $match stage if lines are provided
//       ...(lines && lines.length > 0
//         ? [
//             {
//               $match: {
//                 Lines: { $in: Array.isArray(lines) ? lines : [lines] }, // Filter by lines
//               },
//             },
//           ]
//         : []), // No $match stage if no lines are provided

//       // Conditionally add the $match stage if models are provided
//       ...(model && model.length > 0
//         ? [
//             {
//               $match: {
//                 Models: { $in: Array.isArray(model) ? model : [model] }, // Filter by models
//               },
//             },
//           ]
//         : []), // No $match stage if no models are provided

//       // Group by model and normalized defect status (lowercase)
//       {
//         $group: {
//           _id: {
//             model: "$Models",
//             defectStatus: { $toLower: "$DefectStatus" }, // Normalize to lowercase
//           },
//           totalDefectsDescriptionQty: { $sum: "$DefectsDescriptionqty" },
//         },
//       },
//       // Group by model and calculate total DefectsDescriptionqty for each model
//       {
//         $group: {
//           _id: "$_id.model",
//           totalDefectsDescriptionQty: { $sum: "$totalDefectsDescriptionQty" }, // Total for model
//           defectRatios: {
//             $push: {
//               defectStatus: "$_id.defectStatus",
//               defectsQty: "$totalDefectsDescriptionQty",
//             },
//           },
//         },
//       },
//       // Calculate the ratios for each defect status
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
//       // Project to match the desired format, handle keys like 'un-scanned' and apply rounding
//       {
//         $project: {
//           model: 1,
//           totalDefectsDescriptionQty: 1,
//           // Apply $round for scanned and unscanned to get single decimal precision
//           scanned: { $round: [{ $ifNull: ["$ratios.scanned", 0] }, 1] }, // Lowercase 'scanned'
//           unscanned: { $round: [{ $ifNull: ["$ratios.un-scanned", 0] }, 1] }, // Lowercase 'un-scanned'
//           reset: { $round: [{ $ifNull: ["$ratios.reset", 0] }, 1] }, // Lowercase 'reset'
//         },
//       },
//     ];

//     const results = await Records.aggregate(pipeline);
//     console.log(results);
//     return res.status(200).json(results);
//   } catch (err) {
//     console.error("Error calculating defect ratios:", err);
//     return res.status(500).json({ error: "Error calculating defect ratios" });
//   }
// }

// module.exports = calculateDefectRatios;

// const Records = require("../Models/Checking");

// async function calculateDefectRatios(req, res) {
//   try {
//     const { models, lines } = req.body; // Extract models and lines from request body
//     console.log("The models are: ", models);
//     console.log("The lines are: ", lines);

//     const pipeline = [];

//     // Apply the $match condition for both models and lines if both are provided
//     if (lines && lines.length > 0 && models && models.length > 0) {
//       pipeline.push({
//         $match: {
//           Lines: { $in: lines }, // Match specified lines
//           Models: { $in: models }, // Match specified models
//         },
//       });
//     }

//     // If only lines are provided, filter records based on lines
//     if (lines && lines.length > 0 && (!models || models.length === 0)) {
//       pipeline.push({
//         $match: {
//           Lines: { $in: lines }, // Match specified lines
//         },
//       });
//     }

//     // If only models are provided, filter records based on models
//     if (models && models.length > 0 && (!lines || lines.length === 0)) {
//       pipeline.push({
//         $match: {
//           Models: { $in: models }, // Match specified models
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

//     // Handle case where no records match the criteria for lines and models
//     if (results.length === 0 && models && lines) {
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
    const { models, lines, defectsDescription } = req.body; // Extract models, lines, and defectsDescription from request body
    console.log("The models are: ", models);
    console.log("The lines are: ", lines);
    console.log("The defectsDescription are: ", defectsDescription);

    const pipeline = [];

    // Apply the $match condition for models, lines, and defectsDescription if provided
    if (
      lines &&
      lines.length > 0 &&
      models &&
      models.length > 0 &&
      defectsDescription &&
      defectsDescription.length > 0
    ) {
      pipeline.push({
        $match: {
          Lines: { $in: lines }, // Match specified lines
          Models: { $in: models }, // Match specified models
          DefectsDescription: { $in: defectsDescription }, // Match specified defects
        },
      });
    }

    // If only lines and defectsDescription are provided, filter records based on them
    if (
      lines &&
      lines.length > 0 &&
      defectsDescription &&
      defectsDescription.length > 0 &&
      (!models || models.length === 0)
    ) {
      pipeline.push({
        $match: {
          Lines: { $in: lines }, // Match specified lines
          DefectsDescription: { $in: defectsDescription }, // Match specified defects
        },
      });
    }

    // If only models and defectsDescription are provided, filter records based on them
    if (
      models &&
      models.length > 0 &&
      defectsDescription &&
      defectsDescription.length > 0 &&
      (!lines || lines.length === 0)
    ) {
      pipeline.push({
        $match: {
          Models: { $in: models }, // Match specified models
          DefectsDescription: { $in: defectsDescription }, // Match specified defects
        },
      });
    }

    // If only lines are provided, filter records based on lines
    if (
      lines &&
      lines.length > 0 &&
      (!models || models.length === 0) &&
      (!defectsDescription || defectsDescription.length === 0)
    ) {
      pipeline.push({
        $match: {
          Lines: { $in: lines }, // Match specified lines
        },
      });
    }

    // If only models are provided, filter records based on models
    if (
      models &&
      models.length > 0 &&
      (!lines || lines.length === 0) &&
      (!defectsDescription || defectsDescription.length === 0)
    ) {
      pipeline.push({
        $match: {
          Models: { $in: models }, // Match specified models
        },
      });
    }

    // If only defectsDescription is provided, filter records based on defectsDescription
    if (
      defectsDescription &&
      defectsDescription.length > 0 &&
      (!lines || lines.length === 0) &&
      (!models || models.length === 0)
    ) {
      pipeline.push({
        $match: {
          DefectsDescription: { $in: defectsDescription }, // Match specified defects
        },
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
