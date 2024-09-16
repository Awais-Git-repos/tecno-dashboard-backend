const Collection = require("../Models/Checking");
const GroupByScanned = async () => {
  try {
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
              $cond: [{ $eq: ["$DefectStatus", "Reset"] }, "$convertedQty", 0],
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
    ]);

    if (data.length === 0) {
      console.log("Aggregation returned no results");
      return res.status(404).json({ message: "No matching results" });
    }

    return res.status(200).json(data[0]);
  } catch (error) {
    console.error("Error during aggregation:", error);
    return res.status(400).json(error);
  }
};

module.exports = GroupByScanned;
