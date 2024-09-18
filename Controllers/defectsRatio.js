// const Records = require("../Models/Checking"); // Import your Mongoose model

// async function calculateDefectRatios(req, res) {
//   try {
//     const { model, status } = req.body; // Extract model and status from request body

//     const pipeline = [
//       // Group by model, defect status, and check status (assembly, packing, etc.)
//       {
//         $group: {
//           _id: {
//             model: "$Models",
//             defectStatus: "$DefectStatus",
//             checkStatus: "$Check", // Add this field to group by check status
//           },
//           totalDefectsQty: { $sum: { $ifNull: ["$Qty", 0] } },
//           totalInspectedQty: {
//             $sum: {
//               $cond: [{ $gt: ["$InspectedQty", 0] }, "$InspectedQty", 0],
//             },
//           },
//         },
//       },
//       // Optionally add filters based on provided model and status
//       ...(model ? [{ $match: { "_id.model": model } }] : []),
//       ...(status ? [{ $match: { "_id.defectStatus": status } }] : []),
//       // Group by model and check status to aggregate totals
//       {
//         $group: {
//           _id: {
//             model: "$_id.model",
//             checkStatus: "$_id.checkStatus",
//           },
//           totalInspectedQty: { $sum: "$totalInspectedQty" },
//           totalDefectsQty: { $sum: "$totalDefectsQty" },
//           defectRatios: {
//             $push: {
//               defectStatus: "$_id.defectStatus",
//               defectRatio: {
//                 $cond: {
//                   if: { $gt: ["$totalInspectedQty", 0] },
//                   then: {
//                     $cond: {
//                       if: { $gt: ["$totalDefectsQty", 0] },
//                       then: {
//                         $multiply: [
//                           {
//                             $divide: ["$totalDefectsQty", "$totalInspectedQty"],
//                           },
//                           100,
//                         ],
//                       },
//                       else: 0,
//                     },
//                   },
//                   else: 0,
//                 },
//               },
//             },
//           },
//         },
//       },
//       // Reshape to match desired output format
//       {
//         $group: {
//           _id: "$_id.model",
//           categories: {
//             $push: {
//               checkStatus: "$_id.checkStatus",
//               defectRatios: "$defectRatios",
//             },
//           },
//           totalDefectsQty: { $sum: "$totalDefectsQty" },
//           totalInspectedQty: { $sum: "$totalInspectedQty" },
//         },
//       },
//       {
//         $project: {
//           _id: 0,
//           model: "$_id",
//           categories: {
//             $arrayToObject: {
//               $map: {
//                 input: "$categories",
//                 as: "category",
//                 in: {
//                   k: "$$category.checkStatus",
//                   v: {
//                     $arrayToObject: {
//                       $map: {
//                         input: "$$category.defectRatios",
//                         as: "ratio",
//                         in: {
//                           k: "$$ratio.defectStatus",
//                           v: "$$ratio.defectRatio",
//                         },
//                       },
//                     },
//                   },
//                 },
//               },
//             },
//           },
//           total_ratio: {
//             $cond: {
//               if: { $gt: ["$totalInspectedQty", 0] },
//               then: {
//                 $cond: {
//                   if: { $gt: ["$totalDefectsQty", 0] },
//                   then: {
//                     $multiply: [
//                       { $divide: ["$totalDefectsQty", "$totalInspectedQty"] },
//                       100,
//                     ],
//                   },
//                   else: 0,
//                 },
//               },
//               else: 0,
//             },
//           },
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

const Records = require("../Models/Checking"); // Import your Mongoose model

async function calculateDefectRatios(req, res) {
  try {
    const { model, status } = req.body; // Extract model and status from request body

    const pipeline = [
      // Group by model, defect status, and check status (assembly, packing, etc.)
      {
        $group: {
          _id: {
            model: "$Models",
            defectStatus: "$DefectStatus",
            checkStatus: "$Check", // Add this field to group by check status
          },
          totalDefectsQty: { $sum: { $ifNull: ["$DefectsDescriptionqty", 0] } },
          totalInspectedQty: {
            $sum: {
              $cond: [{ $gt: ["$InspectedQty", 0] }, "$InspectedQty", 0],
            },
          },
        },
      },
      // Optionally add filters based on provided model and status
      ...(model ? [{ $match: { "_id.model": model } }] : []),
      ...(status ? [{ $match: { "_id.defectStatus": status } }] : []),
      // Group by model and check status to aggregate totals
      {
        $group: {
          _id: {
            model: "$_id.model",
            checkStatus: "$_id.checkStatus",
          },
          totalInspectedQty: { $sum: "$totalInspectedQty" },
          totalDefectsQty: { $sum: "$totalDefectsQty" },
          defectRatios: {
            $push: {
              defectStatus: "$_id.defectStatus",
              defectRatio: {
                $cond: {
                  if: { $gt: ["$totalInspectedQty", 0] },
                  then: {
                    $cond: {
                      if: { $gt: ["$totalDefectsQty", 0] },
                      then: {
                        $multiply: [
                          {
                            $divide: ["$totalDefectsQty", "$totalInspectedQty"],
                          },
                          100,
                        ],
                      },
                      else: 0,
                    },
                  },
                  else: 0,
                },
              },
            },
          },
        },
      },
      // Reshape to match desired output format
      {
        $group: {
          _id: "$_id.model",
          categories: {
            $push: {
              checkStatus: "$_id.checkStatus",
              defectRatios: "$defectRatios",
            },
          },
          totalDefectsQty: { $sum: "$totalDefectsQty" },
          totalInspectedQty: { $sum: "$totalInspectedQty" },
        },
      },
      {
        $project: {
          _id: 0,
          model: "$_id",
          categories: {
            $arrayToObject: {
              $map: {
                input: "$categories",
                as: "category",
                in: {
                  k: "$$category.checkStatus",
                  v: {
                    $arrayToObject: {
                      $map: {
                        input: "$$category.defectRatios",
                        as: "ratio",
                        in: {
                          k: "$$ratio.defectStatus",
                          v: "$$ratio.defectRatio",
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          total_ratio: {
            $cond: {
              if: { $gt: ["$totalInspectedQty", 0] },
              then: {
                $multiply: [
                  { $divide: ["$totalDefectsQty", "$totalInspectedQty"] },
                  100,
                ],
              },
              else: 0,
            },
          },
        },
      },
    ];

    const results = await Records.aggregate(pipeline);
    console.log(results);
    return res.status(200).json(results);
  } catch (err) {
    console.error("Error calculating defect ratios:", err);
    return res.status(500).json({ error: "Error calculating defect ratios" });
  }
}

module.exports = calculateDefectRatios;
