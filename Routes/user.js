const express = require("express");
const routes = express.Router();

const { Login } = require("../Controllers/user");

routes.post("/login", Login);

module.exports = routes;
