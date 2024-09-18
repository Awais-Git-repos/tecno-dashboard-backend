const express = require("express");
const routes = express.Router();

const defectsRatio = require("../Controllers/defectsRatio");

routes.post("/", defectsRatio);

module.exports = routes;
