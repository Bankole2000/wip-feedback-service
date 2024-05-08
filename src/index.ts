import { app } from "./app";
import http from "http";
import { config } from "./configs";

const httpServer = http.createServer(app);
const PORT = config.app.PORT;

httpServer.listen(PORT, async () => {
  console.log(`Feedback service listening at ${PORT}`);
});

process.on("beforeExit", (code) => {
  // Can make asynchronous calls
  setTimeout(() => {
    console.log(`Process will exit with code: ${code}`);
    process.exit(code);
  }, 100);
});
process.on("uncaughtException", (err) => {
  console.log(`Uncaught Exception: ${err.message}`);
  process.exit(1);
});

process.on("exit", (code) => {
  // Only synchronous calls
  console.log(`Process exited with code: ${code}`);
});
