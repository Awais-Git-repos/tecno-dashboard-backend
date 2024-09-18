// const Collection = require("../Models/Checking");
// const GroupByScanned = async (req, res) => {
//   try {
//     const data = await Collection.aggregate([
//       {
//         $addFields: {
//           convertedQty: {
//             $convert: {
//               input: "$Qty",
//               to: "int",
//               onError: 0,
//               onNull: 0,
//             },
//           },
//         },
//       },
//       {
//         $group: {
//           _id: null,
//           totalScanned: {
//             $sum: {
//               $cond: [
//                 { $eq: ["$DefectStatus", "Scanned"] },
//                 "$convertedQty",
//                 0,
//               ],
//             },
//           },
//           totalUnscanned: {
//             $sum: {
//               $cond: [
//                 { $eq: ["$DefectStatus", "Un-scanned"] },
//                 "$convertedQty",
//                 0,
//               ],
//             },
//           },
//           totalReset: {
//             $sum: {
//               $cond: [{ $eq: ["$DefectStatus", "Reset"] }, "$convertedQty", 0],
//             },
//           },
//         },
//       },
//       {
//         $project: {
//           _id: 0,
//           totalScanned: 1,
//           totalUnscanned: 1,
//           totalReset: 1,
//         },
//       },
//     ]);

//     if (data.length === 0) {
//       console.log("Aggregation returned no results");
//       return res.status(404).json({ message: "No matching results" });
//     }

//     return res.status(200).json(data[0]);
//   } catch (error) {
//     console.error("Error during aggregation:", error);
//     return res.status(400).json(error);
//   }
// };

// module.exports = GroupByScanned;

const Collection = require("../Models/Checking");

const GroupByScanned = async (req, res) => {
  try {
    // Define the aggregation pipeline
    const data = await Collection.aggregate([
      {
        $addFields: {
          convertedQty: {
            $convert: {
              input: "$Qty",
              to: "int",
              onError: 0,
              onNull: 0,
            },
          },
        },
      },
      {
        $facet: {
          overall: [
            {
              $group: {
                _id: null,
                totalScanned: {
                  $sum: {
                    $cond: [
                      { $eq: ["$DefectStatus", "Scanned"] },
                      "$convertedQty",
                      0,
                    ],
                  },
                },
                totalUnscanned: {
                  $sum: {
                    $cond: [
                      { $eq: ["$DefectStatus", "Un-scanned"] },
                      "$convertedQty",
                      0,
                    ],
                  },
                },
                totalReset: {
                  $sum: {
                    $cond: [
                      { $eq: ["$DefectStatus", "Reset"] },
                      "$convertedQty",
                      0,
                    ],
                  },
                },
              },
            },
            {
              $project: {
                _id: 0,
                totalScanned: 1,
                totalUnscanned: 1,
                totalReset: 1,
              },
            },
          ],
          byCheck: [
            {
              // Trim the 'Check' values to remove any leading/trailing spaces
              $addFields: {
                trimmedCheck: { $trim: { input: "$Check" } },
              },
            },
            {
              $group: {
                _id: "$trimmedCheck",
                totalScanned: {
                  $sum: {
                    $cond: [
                      { $eq: ["$DefectStatus", "Scanned"] },
                      "$convertedQty",
                      0,
                    ],
                  },
                },
                totalUnscanned: {
                  $sum: {
                    $cond: [
                      { $eq: ["$DefectStatus", "Un-scanned"] },
                      "$convertedQty",
                      0,
                    ],
                  },
                },
                totalReset: {
                  $sum: {
                    $cond: [
                      { $eq: ["$DefectStatus", "Reset"] },
                      "$convertedQty",
                      0,
                    ],
                  },
                },
              },
            },
            {
              $project: {
                _id: 0,
                check: "$_id",
                scanned: "$totalScanned",
                unscanned: "$totalUnscanned",
                reset: "$totalReset",
              },
            },
          ],
        },
      },
      {
        $project: {
          overall: { $arrayElemAt: ["$overall", 0] },
          byCheck: 1,
        },
      },
    ]);

    if (data.length === 0) {
      console.log("Aggregation returned no results");
      return res.status(404).json({ message: "No matching results" });
    }

    // Log the results of 'byCheck' to see the trimmed values
    console.log("Data from aggregation byCheck:", data[0].byCheck);

    // Transform 'byCheck' array into an object with Check values as keys
    const byCheckObject = data[0].byCheck.reduce((acc, check) => {
      acc[check.check] = {
        scanned: check.scanned,
        unscanned: check.unscanned,
        reset: check.reset,
      };
      return acc;
    }, {});

    // Combine the overall and byCheck data into a single result object
    const result = {
      overall: data[0].overall,
      byCheck: byCheckObject,
    };

    return res.status(200).json(result);
  } catch (error) {
    console.error("Error during aggregation:", error);
    return res.status(400).json(error);
  }
};

module.exports = GroupByScanned;
