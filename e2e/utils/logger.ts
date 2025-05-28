import fs from "fs";

function logToFile(level: string, msg: string) {
  fs.appendFileSync(
    "test.log",
    `[${new Date().toISOString()}] [${level}] ${msg}\n`,
  );
}

export const logger = {
  info: (msg: string) => {
    const logMsg = `[INFO] ${msg}`;
    console.log(logMsg);
    logToFile("INFO", msg);
  },
  error: (msg: string) => {
    const logMsg = `[ERROR] ${msg}`;
    console.error(logMsg);
    logToFile("ERROR", msg);
  },
};
