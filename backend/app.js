const express = require("express");
const cookieParser = require("cookie-parser");
const healthRouter = require("./routers/health");
const authRouter = require("./routers/auth");
const acadRouter = require("./routers/academic");
const llmHelpRouter = require("./routers/llmHelpRoute");

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use("/health", healthRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/acad", acadRouter);
app.use("/api/v1/help", llmHelpRouter);

module.exports = app;
