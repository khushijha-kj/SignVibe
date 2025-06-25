const express = require("express");
const cookieParser = require("cookie-parser");
const healthRouter = require("./routers/health");
const authRouter = require("./routers/auth");

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use("/", healthRouter);
app.use("/api/v1/auth", authRouter);

module.exports = app;
