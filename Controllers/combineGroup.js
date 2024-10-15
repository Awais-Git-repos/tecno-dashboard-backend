// const Collection = require("../Models/Checking");
// const NodeCache = require("node-cache");
// const cache = new NodeCache({ stdTTL: 600 }); // Create a new cache instance with a TTL of 600 seconds (10 minutes)

// const combineGroup = async (req, res) => {
//   const { models, defects, lines } = req.body;
//   const cacheKey = `combineGroup_${JSON.stringify({ models, defects, lines })}`; // Create a unique cache key based on the request parameters

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
//                   $push: { line: "$_id.line", count: "$lineCount" },
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

//     const data = await Collection.aggregate(pipeline);

//     // Check if all results are empty
//     if (
//       !data ||
//       data.length === 0 ||
//       (!data[0].groupByErrors.length &&
//         !data[0].groupByLines.length &&
//         !data[0].groupByModels.length)
//     ) {
//       console.log("Aggregation returned no results");
//       return res.status(404).json({ message: "No matching results" });
//     }

//     const result = { data: data[0], uniqueModels, uniqueDamage, uniqueLines };

//     // Cache the result for future requests with an expiration time of 10 minutes
//     cache.set(cacheKey, result);

//     return res.status(200).json(result);
//   } catch (error) {
//     console.error("Error during aggregation:", error);
//     return res.status(400).json(error);
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
                models: { $push: { model: "$Models", qty: "$convertedQty" } },
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
                  $push: { model: "$_id.model", qty: "$modelQty" },
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
                models: { $push: { model: "$Models", qty: "$convertedQty" } },
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
                  $push: { model: "$_id.model", qty: "$totalQty" },
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
                lines: { $push: { line: "$Lines", qty: "$convertedQty" } },
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
                  $push: { line: "$_id.line", qty: "$lineCount" },
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
