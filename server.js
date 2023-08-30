const express = require("express");
const app = express();
const cors = require("cors");
app.use(cors());
app.use(express.json());
const { spawn } = require("child_process");

const PORT = 3000;

app.post("/validate", async (req, res, next) => {
  try {
    const { api } = req.body;
    const log = [];

    const mochaProcess = spawn(
      "npx",
      ["mocha", "test/sample.js", `--arg1 ${api}`],
      {
        stdio: "pipe", // change to "inherit" if you want to see the output to console
      }
    );

    mochaProcess.stdout.on("data", (data) => {
      const baseString = data.toString().trim();
      log.push(baseString);
    });

    mochaProcess.on("exit", (code) => {
      if (code === 0) {
        return res.json({ message: "Tests passed" });
      } else {
        const disallowedCommandRegex = /Error: Disallowed command found/;
        if (disallowedCommandRegex.test(log.join(""))) {
          return res.json({ message: "Invalid commands found on code" });
        }

        const failingTestArray = log.filter((line) => /^\d+\)/.test(line));
        const failedTestFilter = failingTestArray.slice(
          0,
          failingTestArray.length / 2
        );

        return res.json({
          message: "Tests failed",
          failingTests: failedTestFilter,
        });
      }
    });
  } catch (err) {
    next(err);
  }
});

app.use((err, req, res, next) => {
  const statusCode = err.status || 500;
  return res.status(statusCode).json({ error: err.message });
});

app.listen(PORT, () => {
  console.log("listening on port " + PORT);
});
