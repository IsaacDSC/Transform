const fs = require("fs");
const path = require("path");
const { jsonToGo } = require("../engine.js");

const filepath = path.join(__dirname, "../tmp");

const ReadFileToCompile = (fileName) => {
  const payload = fs.readFileSync(fileName);
  return payload;
};

const GenerateFileCompiled = (input, fileName) => {
  const payload = JSON.stringify(input, null, 2);
  fs.writeFileSync(fileName, payload, "utf-8");
};

const T01 = ReadFileToCompile(`${filepath}/01.json`);
const structGo01 = jsonToGo(T01);
const T02 = ReadFileToCompile(`${filepath}/02.json`);
const structGo02 = jsonToGo(T02);

console.log({ structGo01, structGo02 });
