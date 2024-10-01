const cluster = require("cluster");
const os = require("os");
const express = require("express");
const db = require("./Database/db");
const cors = require("cors");
const seeding = require("./seeding");
const dotenv = require("dotenv");
dotenv.config();

// Check if the process is the master process
if (cluster.isMaster) {
  // Determine the number of CPU cores
  const numCPUs = os.cpus().length;
  console.log(`Master ${process.pid} is running`);

  // Fork workers based on the number of CPU cores
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  // Restart workers if they die
  cluster.on("exit", (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died. Restarting...`);
    cluster.fork();
  });
} else {
  // This is a worker process
  const app = express();

  app.use(cors());
  app.use(express.json({ extended: false }));

  app.use("/combinedGroup", require("./Routes/combineGroup"));

  // Route: Group By Scanned-Unscanned-Reset
  app.use("/groupByScanned", require("./Routes/groupbysacnned"));

  app.use("/fileupload", require("./Routes/databaseWrite"));

  app.use("/defectsRatio", require("./Routes/defectsRatio"));

  app.use("/api/user", require("./Routes/user"));

  // Database connection setup
  function database() {
    try {
      const node = server;
      db(node);
      seeding();
    } catch (error) {
      console.log(error);
    }
  }

  database();

  // Start the server on a worker process
  function server() {
    const PORT = 3000;
    app.listen(PORT, () => {
      console.log(`Worker ${process.pid} is listening on port ${PORT}`);
    });
  }
}

// const express = require("express");
// const db = require("./Database/db");
// const cors = require("cors");

// const app = express();

// app.use(cors());
// app.use(express.json({ extended: false }));

// app.use("/combinedGroup", require("./Routes/combineGroup"));
// app.use("/groupByScanned", require("./Routes/groupbysacnned"));
// app.use("/fileupload", require("./Routes/databaseWrite"));

// app.get("/", (req, res) => {
//   return res.status(200).json({ msg: "Hello World" });
// });

// // Database connection setup
// function database() {
//   try {
//     db(server);
//   } catch (error) {
//     console.log(error);
//   }
// }

// function server() {
//   app.listen(3000, () => {
//     console.log("Server Listening on port");
//   });
// }

// database();

// // Export the app for Vercel
// module.exports = app;
