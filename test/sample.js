const axios = require("axios");
const { expect } = require("chai");

const disallowedCommands = [
  "exit",
  "require",
  "process",
  "eval",
  "Function",
  "XMLHttpRequest",
  "fetch",
  "fs",
  "child_process",
  "require.resolve",
  "module.exports",
  "global",
  "console",
  "__dirname",
  "__filename",
  "process.env",
  "localStorage",
  "sessionStorage",
  "document.write",
  "Math.random",
  "WebSocket",
  "WebSocketServer",
  "Object.defineProperty",
  "addEventListener",
  "innerHTML",
  "localStorage.setItem",
];

function checkForDisallowedCommands(userCode) {
  for (const command of disallowedCommands) {
    const regex = new RegExp(`\\b${command}\\b`, "i");
    if (regex.test(userCode)) {
      throw new Error(`Disallowed command found: ${command}`);
    }
  }
}

describe("Testing async await", () => {
  let dynamicJob;

  const api = process.argv[3].split(" ")[1];
  before(async () => {
    try {
      // Fetch the job function from the API
      const response = await axios.post(api);

      checkForDisallowedCommands(response.data.job);
      // Ensure the API response is successful
      expect(response.status).to.equal(200);

      // Evaluate the job function from the response
      dynamicJob = eval(response.data.job);
    } catch (error) {
      // Handle errors, such as network errors or API request failures
      console.log(error);
      throw error;
    }
  });

  afterEach((done) => {
    done();
  });

  it('should reject with "error" for non-number input', async () => {
    try {
      1;
      await dynamicJob("string");
      // If it doesn't reject, the test should fail
      throw new Error("Expected to reject");
    } catch (error) {
      expect(error).to.equal("error");
    }
  });

  it('should resolve with "odd" for odd numbers', async () => {
    const result = await dynamicJob(3);
    expect(result).to.equal("odd");
  });

  it('should resolve with "odd" after a delay of 1s for odd numbers', async () => {
    const startTime = Date.now();
    const result = await dynamicJob(5);
    const endTime = Date.now();
    const elapsedTime = endTime - startTime;
    expect(result).to.equal("odd");
    expect(elapsedTime).to.be.at.least(1000); // Ensure it takes at least 1000ms
  });

  it('should reject with "even" for even numbers', async () => {
    try {
      await dynamicJob(4);
      // If it doesn't reject, the test should fail
      throw new Error("Expected to reject");
    } catch (error) {
      expect(error).to.equal("even");
    }
  }).timeout(3000);

  it('should reject with "even" after a delay of 2s for even numbers', async () => {
    const startTime = Date.now();
    try {
      await dynamicJob(6);
      // If it doesn't reject, the test should fail
      throw new Error("Expected to reject");
    } catch (error) {
      const endTime = Date.now();
      const elapsedTime = endTime - startTime;
      expect(error).to.equal("even");
      expect(elapsedTime).to.be.at.least(2000); // Ensure it takes at least 2000ms
    }
  }).timeout(3000);
});
