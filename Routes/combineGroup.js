const express = require("express");
const routes = express.Router();

const combinegroup = require("../Controllers/combineGroup");

routes.post("/", combinegroup);

module.exports = routes;
