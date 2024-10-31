// const Collection = require("../Models/Checking");
// const NodeCache = require("node-cache");
// const cache = new NodeCache({ stdTTL: 600 }); // Cache TTL of 600 seconds (10 minutes)

// const combineGroup = async (req, res) => {
//   const { models, defects, lines, startDate, endDate } = req.body;
//   console.log(startDate);
//   const cacheKey = `combineGroup_${JSON.stringify({
//     models,
//     defects,
//     lines,
//     startDate,
//     endDate,
//   })}`; // Unique cache key based on request parameters

//   // Check if the result is already cached
//   const cachedData = cache.get(cacheKey);
//   if (cachedData) {
//     return res.status(200).json(cachedData);
//   }

//   var uniqueModels = [];
//   var uniqueDamage = [];
//   var uniqueLines = [];

//   try {
//     // Fetch distinct values
//     const modelList = await Collection.distinct("Models");
//     uniqueModels.push(modelList);

//     const damageList = await Collection.distinct("DefectsDescription");
//     uniqueDamage.push(damageList);

//     const lineList = await Collection.distinct("Lines");
//     uniqueLines.push(lineList);

//     // Build dynamic match conditions based on user input
//     const matchConditions = {};

//     if (models && models.length > 0) {
//       matchConditions.Models = { $in: models };
//     }
//     if (defects && defects.length > 0) {
//       matchConditions.DefectsDescription = { $in: defects };
//     }
//     if (lines && lines.length > 0) {
//       matchConditions.Lines = { $in: lines };
//     }

//     // Add date range filtering if startDate and/or endDate are provided
//     if (startDate || endDate) {
//       matchConditions.Date = {};
//       if (startDate) {
//         matchConditions.Date.$gte = startDate; // Use startDate directly as string
//       }
//       if (endDate) {
//         matchConditions.Date.$lte = endDate; // Use endDate directly as string
//       }
//     }

//     // Aggregation pipeline
//     const pipeline = [
//       {
//         $match: matchConditions,
//       },
//       {
//         $addFields: {
//           convertedQty: {
//             $convert: {
//               input: "$DefectsDescriptionqty",
//               to: "int",
//               onError: 0,
//               onNull: 0,
//             },
//           },
//         },
//       },
//       {
//         $facet: {
//           groupByErrors: [
//             {
//               $group: {
//                 _id: "$DefectsDescription",
//                 error: { $sum: "$convertedQty" },
//                 scanned: {
//                   $sum: {
//                     $cond: [
//                       { $eq: ["$DefectStatus", "Scanned"] },
//                       "$convertedQty",
//                       0,
//                     ],
//                   },
//                 },
//                 unscanned: {
//                   $sum: {
//                     $cond: [
//                       { $eq: ["$DefectStatus", "Un-scanned"] },
//                       "$convertedQty",
//                       0,
//                     ],
//                   },
//                 },
//                 reset: {
//                   $sum: {
//                     $cond: [
//                       { $eq: ["$DefectStatus", "Reset"] },
//                       "$convertedQty",
//                       0,
//                     ],
//                   },
//                 },
//                 models: { $push: { model: "$Models", qty: "$convertedQty" } },
//               },
//             },
//             { $sort: { error: -1 } },
//             { $limit: 15 },
//             { $unwind: "$models" },
//             {
//               $group: {
//                 _id: { defect: "$_id", model: "$models.model" },
//                 error: { $first: "$error" },
//                 scanned: { $first: "$scanned" },
//                 unscanned: { $first: "$unscanned" },
//                 reset: { $first: "$reset" },
//                 modelQty: { $sum: "$models.qty" },
//               },
//             },
//             { $sort: { modelQty: -1 } },
//             {
//               $group: {
//                 _id: "$_id.defect",
//                 error: { $first: "$error" },
//                 scanned: { $first: "$scanned" },
//                 unscanned: { $first: "$unscanned" },
//                 reset: { $first: "$reset" },
//                 topModels: {
//                   $push: { model: "$_id.model", qty: "$modelQty" },
//                 },
//               },
//             },
//             {
//               $project: {
//                 _id: 0,
//                 Name: "$_id",
//                 error: 1,
//                 scanned: 1,
//                 unscanned: 1,
//                 reset: 1,
//                 topModels: { $slice: ["$topModels", 10] },
//               },
//             },
//           ],

//           groupByLines: [
//             {
//               $group: {
//                 _id: "$Lines",
//                 error: { $sum: "$convertedQty" },
//                 scanned: {
//                   $sum: {
//                     $cond: [
//                       { $eq: ["$DefectStatus", "Scanned"] },
//                       "$convertedQty",
//                       0,
//                     ],
//                   },
//                 },
//                 unscanned: {
//                   $sum: {
//                     $cond: [
//                       { $eq: ["$DefectStatus", "Un-scanned"] },
//                       "$convertedQty",
//                       0,
//                     ],
//                   },
//                 },
//                 reset: {
//                   $sum: {
//                     $cond: [
//                       { $eq: ["$DefectStatus", "Reset"] },
//                       "$convertedQty",
//                       0,
//                     ],
//                   },
//                 },
//                 models: { $push: { model: "$Models", qty: "$convertedQty" } },
//               },
//             },
//             { $sort: { error: -1 } },
//             { $limit: 15 },
//             { $unwind: "$models" },
//             {
//               $group: {
//                 _id: { line: "$_id", model: "$models.model" },
//                 error: { $first: "$error" },
//                 scanned: { $first: "$scanned" },
//                 unscanned: { $first: "$unscanned" },
//                 reset: { $first: "$reset" },
//                 totalQty: { $sum: "$models.qty" },
//               },
//             },
//             { $sort: { totalQty: -1 } },
//             {
//               $group: {
//                 _id: "$_id.line",
//                 error: { $first: "$error" },
//                 scanned: { $first: "$scanned" },
//                 unscanned: { $first: "$unscanned" },
//                 reset: { $first: "$reset" },
//                 topModels: {
//                   $push: { model: "$_id.model", qty: "$totalQty" },
//                 },
//               },
//             },
//             {
//               $project: {
//                 _id: 0,
//                 Name: "$_id",
//                 error: 1,
//                 scanned: 1,
//                 unscanned: 1,
//                 reset: 1,
//                 topModels: { $slice: ["$topModels", 10] },
//               },
//             },
//           ],
//           groupByModels: [
//             {
//               $group: {
//                 _id: "$Models",
//                 error: { $sum: "$convertedQty" },
//                 scanned: {
//                   $sum: {
//                     $cond: [
//                       { $eq: ["$DefectStatus", "Scanned"] },
//                       "$convertedQty",
//                       0,
//                     ],
//                   },
//                 },
//                 unscanned: {
//                   $sum: {
//                     $cond: [
//                       { $eq: ["$DefectStatus", "Un-scanned"] },
//                       "$convertedQty",
//                       0,
//                     ],
//                   },
//                 },
//                 reset: {
//                   $sum: {
//                     $cond: [
//                       { $eq: ["$DefectStatus", "Reset"] },
//                       "$convertedQty",
//                       0,
//                     ],
//                   },
//                 },
//                 lines: { $push: { line: "$Lines", qty: "$convertedQty" } },
//               },
//             },
//             { $sort: { error: -1 } },
//             { $limit: 15 },
//             { $unwind: "$lines" },
//             {
//               $group: {
//                 _id: { model: "$_id", line: "$lines.line" },
//                 error: { $first: "$error" },
//                 scanned: { $first: "$scanned" },
//                 unscanned: { $first: "$unscanned" },
//                 reset: { $first: "$reset" },
//                 lineCount: { $sum: "$lines.qty" },
//               },
//             },
//             { $sort: { lineCount: -1 } },
//             {
//               $group: {
//                 _id: "$_id.model",
//                 error: { $first: "$error" },
//                 scanned: { $first: "$scanned" },
//                 unscanned: { $first: "$unscanned" },
//                 reset: { $first: "$reset" },
//                 topLines: {
//                   $push: { line: "$_id.line", qty: "$lineCount" },
//                 },
//               },
//             },
//             {
//               $project: {
//                 _id: 0,
//                 Name: "$_id",
//                 error: 1,
//                 scanned: 1,
//                 unscanned: 1,
//                 reset: 1,
//                 topLines: { $slice: ["$topLines", 10] },
//               },
//             },
//           ],
//         },
//       },
//     ];

//     const results = await Collection.aggregate(pipeline);

//     // const result = { results, modelList, damageList, lineList };
//     const result = {
//       data: results[0],
//       uniqueModels: [...modelList],
//       uniqueDamage: [...damageList],
//       uniqueLines: [...lineList],
//     };

//     // Cache the result for future requests
//     cache.set(cacheKey, result);

//     res.status(200).json(result);
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ message: "Server Error" });
//   }
// };

// module.exports = combineGroup;

const Collection = require("../Models/Checking");
const NodeCache = require("node-cache");
const cache = new NodeCache({ stdTTL: 600 }); // Cache TTL of 600 seconds (10 minutes)

const combineGroup = async (req, res) => {
  const { models, defects, lines, startDate, endDate } = req.body;
  console.log(startDate);
  const cacheKey = `combineGroup_${JSON.stringify({
    models,
    defects,
    lines,
    startDate,
    endDate,
  })}`; // Unique cache key based on request parameters

  // Check if the result is already cached
  const cachedData = cache.get(cacheKey);
  if (cachedData) {
    return res.status(200).json(cachedData);
  }

  var uniqueModels = [];
  var uniqueDamage = [];
  var uniqueLines = [];

  try {
    // Fetch distinct values
    const modelList = await Collection.distinct("Models");
    uniqueModels.push(modelList);

    const damageList = await Collection.distinct("DefectsDescription");
    uniqueDamage.push(damageList);

    const lineList = await Collection.distinct("Lines");
    uniqueLines.push(lineList);

    // Build dynamic match conditions based on user input
    const matchConditions = {};

    if (models && models.length > 0) {
      matchConditions.Models = { $in: models };
    }
    if (defects && defects.length > 0) {
      matchConditions.DefectsDescription = { $in: defects };
    }
    if (lines && lines.length > 0) {
      matchConditions.Lines = { $in: lines };
    }

    // Add date range filtering if startDate and/or endDate are provided
    if (startDate || endDate) {
      matchConditions.Date = {};
      if (startDate) {
        matchConditions.Date.$gte = startDate; // Use startDate directly as string
      }
      if (endDate) {
        matchConditions.Date.$lte = endDate; // Use endDate directly as string
      }
    }

    // Aggregation pipeline
    const pipeline = [
      {
        $match: matchConditions,
      },
      {
        $addFields: {
          convertedQty: {
            $convert: {
              input: "$DefectsDescriptionqty",
              to: "int",
              onError: 0,
              onNull: 0,
            },
          },
        },
      },
      {
        $facet: {
          groupByErrors: [
            {
              $group: {
                _id: "$DefectsDescription",
                error: { $sum: "$convertedQty" },
                scanned: {
                  $sum: {
                    $cond: [
                      { $eq: ["$DefectStatus", "Scanned"] },
                      "$convertedQty",
                      0,
                    ],
                  },
                },
                unscanned: {
                  $sum: {
                    $cond: [
                      { $eq: ["$DefectStatus", "Un-scanned"] },
                      "$convertedQty",
                      0,
                    ],
                  },
                },
                reset: {
                  $sum: {
                    $cond: [
                      { $eq: ["$DefectStatus", "Reset"] },
                      "$convertedQty",
                      0,
                    ],
                  },
                },
                models: {
                  $push: {
                    model: "$Models",
                    qty: "$convertedQty",
                    defectStatus: "$DefectStatus",
                  },
                },
              },
            },
            { $sort: { error: -1 } },
            { $limit: 15 },
            { $unwind: "$models" },
            {
              $group: {
                _id: { defect: "$_id", model: "$models.model" },
                error: { $first: "$error" },
                scanned: { $first: "$scanned" },
                unscanned: { $first: "$unscanned" },
                reset: { $first: "$reset" },
                modelQty: { $sum: "$models.qty" },
                scannedCount: {
                  $sum: {
                    $cond: [
                      { $eq: ["$models.defectStatus", "Scanned"] },
                      "$models.qty",
                      0,
                    ],
                  },
                },
                unscannedCount: {
                  $sum: {
                    $cond: [
                      { $eq: ["$models.defectStatus", "Un-scanned"] },
                      "$models.qty",
                      0,
                    ],
                  },
                },
                resetCount: {
                  $sum: {
                    $cond: [
                      { $eq: ["$models.defectStatus", "reset"] },
                      "$models.qty",
                      0,
                    ],
                  },
                },
              },
            },
            { $sort: { modelQty: -1 } },
            {
              $group: {
                _id: "$_id.defect",
                error: { $first: "$error" },
                scanned: { $first: "$scanned" },
                unscanned: { $first: "$unscanned" },
                reset: { $first: "$reset" },
                topModels: {
                  $push: {
                    model: "$_id.model",
                    qty: "$modelQty",
                    scanned: "$scannedCount",
                    unscanned: "$unscannedCount",
                    reset: "$resetCount",
                  },
                },
              },
            },
            {
              $project: {
                _id: 0,
                Name: "$_id",
                error: 1,
                scanned: 1,
                unscanned: 1,
                reset: 1,
                topModels: { $slice: ["$topModels", 10] },
              },
            },
          ],

          groupByLines: [
            {
              $group: {
                _id: "$Lines",
                error: { $sum: "$convertedQty" },
                scanned: {
                  $sum: {
                    $cond: [
                      { $eq: ["$DefectStatus", "Scanned"] },
                      "$convertedQty",
                      0,
                    ],
                  },
                },
                unscanned: {
                  $sum: {
                    $cond: [
                      { $eq: ["$DefectStatus", "Un-scanned"] },
                      "$convertedQty",
                      0,
                    ],
                  },
                },
                reset: {
                  $sum: {
                    $cond: [
                      { $eq: ["$DefectStatus", "Reset"] },
                      "$convertedQty",
                      0,
                    ],
                  },
                },
                models: {
                  $push: {
                    model: "$Models",
                    qty: "$convertedQty",
                    defectStatus: "$DefectStatus",
                  },
                },
              },
            },
            { $sort: { error: -1 } },
            { $limit: 15 },
            { $unwind: "$models" },
            {
              $group: {
                _id: { line: "$_id", model: "$models.model" },
                error: { $first: "$error" },
                scanned: { $first: "$scanned" },
                unscanned: { $first: "$unscanned" },
                reset: { $first: "$reset" },
                totalQty: { $sum: "$models.qty" },
                scannedCount: {
                  $sum: {
                    $cond: [
                      { $eq: ["$models.defectStatus", "Scanned"] },
                      "$models.qty",
                      0,
                    ],
                  },
                },
                unscannedCount: {
                  $sum: {
                    $cond: [
                      { $eq: ["$models.defectStatus", "Un-scanned"] },
                      "$models.qty",
                      0,
                    ],
                  },
                },
                resetCount: {
                  $sum: {
                    $cond: [
                      { $eq: ["$models.defectStatus", "reset"] },
                      "$models.qty",
                      0,
                    ],
                  },
                },
              },
            },
            { $sort: { totalQty: -1 } },
            {
              $group: {
                _id: "$_id.line",
                error: { $first: "$error" },
                scanned: { $first: "$scanned" },
                unscanned: { $first: "$unscanned" },
                reset: { $first: "$reset" },
                topModels: {
                  $push: {
                    model: "$_id.model",
                    qty: "$totalQty",
                    scanned: "$scannedCount",
                    unscanned: "$unscannedCount",
                    reset: "$resetCount",
                  },
                },
              },
            },
            {
              $project: {
                _id: 0,
                Name: "$_id",
                error: 1,
                scanned: 1,
                unscanned: 1,
                reset: 1,
                topModels: { $slice: ["$topModels", 10] },
              },
            },
          ],
          groupByModels: [
            {
              $group: {
                _id: "$Models",
                error: { $sum: "$convertedQty" },
                scanned: {
                  $sum: {
                    $cond: [
                      { $eq: ["$DefectStatus", "Scanned"] },
                      "$convertedQty",
                      0,
                    ],
                  },
                },
                unscanned: {
                  $sum: {
                    $cond: [
                      { $eq: ["$DefectStatus", "Un-scanned"] },
                      "$convertedQty",
                      0,
                    ],
                  },
                },
                reset: {
                  $sum: {
                    $cond: [
                      { $eq: ["$DefectStatus", "Reset"] },
                      "$convertedQty",
                      0,
                    ],
                  },
                },
                lines: {
                  $push: {
                    line: "$Lines",
                    qty: "$convertedQty",
                    defectStatus: "$DefectStatus",
                  },
                },
              },
            },
            { $sort: { error: -1 } },
            { $limit: 15 },
            { $unwind: "$lines" },
            {
              $group: {
                _id: { model: "$_id", line: "$lines.line" },
                error: { $first: "$error" },
                scanned: { $first: "$scanned" },
                unscanned: { $first: "$unscanned" },
                reset: { $first: "$reset" },
                lineCount: { $sum: "$lines.qty" },
                scannedCount: {
                  $sum: {
                    $cond: [
                      { $eq: ["$lines.defectStatus", "Scanned"] },
                      "$lines.qty",
                      0,
                    ],
                  },
                },
                unscannedCount: {
                  $sum: {
                    $cond: [
                      { $eq: ["$lines.defectStatus", "Un-scanned"] },
                      "$lines.qty",
                      0,
                    ],
                  },
                },
                resetCount: {
                  $sum: {
                    $cond: [
                      { $eq: ["$lines.defectStatus", "reset"] },
                      "$lines.qty",
                      0,
                    ],
                  },
                },
              },
            },
            { $sort: { lineCount: -1 } },
            {
              $group: {
                _id: "$_id.model",
                error: { $first: "$error" },
                scanned: { $first: "$scanned" },
                unscanned: { $first: "$unscanned" },
                reset: { $first: "$reset" },
                topLines: {
                  $push: {
                    line: "$_id.line",
                    qty: "$lineCount",
                    scanned: "$scannedCount",
                    unscanned: "$unscannedCount",
                    reset: "$resetCount",
                  },
                },
              },
            },
            {
              $project: {
                _id: 0,
                Name: "$_id",
                error: 1,
                scanned: 1,
                unscanned: 1,
                reset: 1,
                topLines: { $slice: ["$topLines", 10] },
              },
            },
          ],
        },
      },
    ];

    const results = await Collection.aggregate(pipeline);

    // const result = { results, modelList, damageList, lineList };
    const result = {
      data: results[0],
      uniqueModels: [...modelList],
      uniqueDamage: [...damageList],
      uniqueLines: [...lineList],
    };

    // Cache the result for future requests
    cache.set(cacheKey, result);

    res.status(200).json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
};

module.exports = combineGroup;

// const Collection = require("../Models/Checking");
// const NodeCache = require("node-cache");
// const cache = new NodeCache({ stdTTL: 600 }); // Cache TTL of 600 seconds (10 minutes)

// const combineGroup = async (req, res) => {
//   const { models, defects, lines, startDate, endDate } = req.body;
//   const cacheKey = `combineGroup_${JSON.stringify({
//     models,
//     defects,
//     lines,
//     startDate,
//     endDate,
//   })}`; // Unique cache key based on request parameters

//   // Check if the result is already cached
//   const cachedData = cache.get(cacheKey);
//   if (cachedData) {
//     return res.status(200).json(cachedData);
//   }

//   try {
//     // Fetch distinct values
//     const modelList = await Collection.distinct("Models");
//     const damageList = await Collection.distinct("DefectsDescription");
//     const lineList = await Collection.distinct("Lines");

//     // Build dynamic match conditions based on user input
//     const matchConditions = {};

//     if (models && models.length > 0) {
//       matchConditions.Models = { $in: models };
//     }
//     if (defects && defects.length > 0) {
//       matchConditions.DefectsDescription = { $in: defects };
//     }
//     if (lines && lines.length > 0) {
//       matchConditions.Lines = { $in: lines };
//     }

//     // Add date range filtering if startDate and/or endDate are provided
//     if (startDate || endDate) {
//       matchConditions.Date = {};
//       if (startDate) matchConditions.Date.$gte = startDate;
//       if (endDate) matchConditions.Date.$lte = endDate;
//     }

//     // Aggregation pipeline
//     const pipeline = [
//       {
//         $match: matchConditions,
//       },
//       {
//         $addFields: {
//           convertedQty: {
//             $convert: {
//               input: "$DefectsDescriptionqty",
//               to: "int",
//               onError: 0,
//               onNull: 0,
//             },
//           },
//         },
//       },
//       {
//         $facet: {
//           groupByErrors: [
//             {
//               $group: {
//                 _id: { defect: "$DefectsDescription", line: "$Lines" },
//                 totalError: { $sum: "$convertedQty" },
//                 scanned: {
//                   $sum: {
//                     $cond: [
//                       { $eq: ["$DefectStatus", "Scanned"] },
//                       "$convertedQty",
//                       0,
//                     ],
//                   },
//                 },
//                 unscanned: {
//                   $sum: {
//                     $cond: [
//                       { $eq: ["$DefectStatus", "Un-scanned"] },
//                       "$convertedQty",
//                       0,
//                     ],
//                   },
//                 },
//                 reset: {
//                   $sum: {
//                     $cond: [
//                       { $eq: ["$DefectStatus", "Reset"] },
//                       "$convertedQty",
//                       0,
//                     ],
//                   },
//                 },
//               },
//             },
//             { $sort: { totalError: -1 } },
//             {
//               $group: {
//                 _id: "$_id.defect",
//                 totalError: { $first: "$totalError" },
//                 topLines: {
//                   $push: {
//                     line: "$_id.line",
//                     scanned: "$scanned",
//                     unscanned: "$unscanned",
//                     reset: "$reset",
//                   },
//                 },
//               },
//             },
//             {
//               $project: {
//                 _id: 0,
//                 defect: "$_id",
//                 totalError: 1,
//                 topLines: { $slice: ["$topLines", 10] },
//               },
//             },
//           ],

//           groupByLines: [
//             {
//               $group: {
//                 _id: { line: "$Lines", model: "$Models" },
//                 totalError: { $sum: "$convertedQty" },
//                 scanned: {
//                   $sum: {
//                     $cond: [
//                       { $eq: ["$DefectStatus", "Scanned"] },
//                       "$convertedQty",
//                       0,
//                     ],
//                   },
//                 },
//                 unscanned: {
//                   $sum: {
//                     $cond: [
//                       { $eq: ["$DefectStatus", "Un-scanned"] },
//                       "$convertedQty",
//                       0,
//                     ],
//                   },
//                 },
//                 reset: {
//                   $sum: {
//                     $cond: [
//                       { $eq: ["$DefectStatus", "Reset"] },
//                       "$convertedQty",
//                       0,
//                     ],
//                   },
//                 },
//               },
//             },
//             { $sort: { totalError: -1 } },
//             {
//               $group: {
//                 _id: "$_id.line",
//                 totalError: { $first: "$totalError" },
//                 topModels: {
//                   $push: {
//                     model: "$_id.model",
//                     scanned: "$scanned",
//                     unscanned: "$unscanned",
//                     reset: "$reset",
//                   },
//                 },
//               },
//             },
//             {
//               $project: {
//                 _id: 0,
//                 line: "$_id",
//                 totalError: 1,
//                 topModels: { $slice: ["$topModels", 10] },
//               },
//             },
//           ],

//           groupByModels: [
//             {
//               $group: {
//                 _id: { model: "$Models", line: "$Lines" },
//                 totalError: { $sum: "$convertedQty" },
//                 scanned: {
//                   $sum: {
//                     $cond: [
//                       { $eq: ["$DefectStatus", "Scanned"] },
//                       "$convertedQty",
//                       0,
//                     ],
//                   },
//                 },
//                 unscanned: {
//                   $sum: {
//                     $cond: [
//                       { $eq: ["$DefectStatus", "Un-scanned"] },
//                       "$convertedQty",
//                       0,
//                     ],
//                   },
//                 },
//                 reset: {
//                   $sum: {
//                     $cond: [
//                       { $eq: ["$DefectStatus", "Reset"] },
//                       "$convertedQty",
//                       0,
//                     ],
//                   },
//                 },
//               },
//             },
//             { $sort: { totalError: -1 } },
//             {
//               $group: {
//                 _id: "$_id.model",
//                 totalError: { $first: "$totalError" },
//                 topLines: {
//                   $push: {
//                     line: "$_id.line",
//                     scanned: "$scanned",
//                     unscanned: "$unscanned",
//                     reset: "$reset",
//                   },
//                 },
//               },
//             },
//             {
//               $project: {
//                 _id: 0,
//                 model: "$_id",
//                 totalError: 1,
//                 topLines: { $slice: ["$topLines", 10] },
//               },
//             },
//           ],
//         },
//       },
//     ];

//     const results = await Collection.aggregate(pipeline);

//     const result = {
//       data: results[0],
//       uniqueModels: modelList,
//       uniqueDamage: damageList,
//       uniqueLines: lineList,
//     };

//     // Cache the result for future requests
//     cache.set(cacheKey, result);

//     res.status(200).json(result);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Server Error" });
//   }
// };

// module.exports = combineGroup;
