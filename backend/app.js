const express = require("express");
const healthRouter = require("./routers/health");

const app = express();

app.use(express.json());
app.use("/", healthRouter);

module.exports = app;
