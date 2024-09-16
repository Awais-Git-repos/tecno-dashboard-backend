const express = require("express");
const routes = express.Router();

const groupbyscanned = require("../Controllers/groupbyscanned");

routes.get("/", groupbyscanned);

module.exports = routes;
