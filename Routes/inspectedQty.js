const express = require("express");
const routes = express.Router();

const inspectedQty = require("../Controllers/inspectedQty");

routes.post("/", inspectedQty);

module.exports = routes;
