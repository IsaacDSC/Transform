const Types = {
  integer: "int64",
  float: "float64",
  string: "string",
  object: "object",
  array: "array",
};

const sintaxStructGolang = {
  init: () => `type Entity Struct {`,
  initScope: () => `{`,
  endScope: () => `}`,
};

//
// Auxiliary functions
//

//TODO: Implement these useState
// const state = (...props) =>{
//   return
// }

const IdentifyTypes = (value) => {
  if (Array.isArray(value)) return Types["array"];
  if (!Number.isNaN(Number(value)))
    return Number.isInteger(Number(value)) ? Types["integer"] : Types["float"];
  if (typeof value === "string") return Types["string"];
  if (typeof value === "object") return Types["object"];
};

const GenerateTag = (key) => {
  const tag = `\`json:"${key}"\``;
  return tag;
};

const ConvertCamelCase = (key) => {
  const keyCamelCase = `${key[0].toUpperCase()}${key.slice(1)}`;
  return keyCamelCase;
};

const isPrimitiveValue = (value) => {
  if (value == "{" || value == "[" || value == "}" || value == "]") {
    return value;
  }
  return "primitive";
};

const mapping = {
  init: () => sintaxStructGolang.init(),
  "{": () => sintaxStructGolang.initScope(),
  "}": () => sintaxStructGolang.endScope(),
  "[": () => "[",
  "]": () => "}",
  key: {},
  assert: {
    existKeyValue: (keyValue) => keyValue.length == 2,
    isEndSlice: (act) => act == "]",
    isInitSlice: (act) => act == "[",
    isPrimitiveValue: (keyValue) => isPrimitiveValue(keyValue) == "primitive",
  },
  value: {
    primitive: (key, value) =>
      `${ConvertCamelCase(key)} ${IdentifyTypes(value)} \`json:"${key}"\``,
    "[": (key, value) => `${ConvertCamelCase(key)} []struct {`,
    "{": (key, value) => `${ConvertCamelCase(key)} struct ${value}`,
  },
};

const SliceRules = ({ counterElementInStruct, key, value }) => {
  if (counterElementInStruct == 1) {
    return mapping.value[isPrimitiveValue(value)](key, value);
  }
  return mapping.value[isPrimitiveValue(value)](key, value);
};

//
// Functions
//

const Skeleton = (lineInLine) => {
  let initSlice = false; //TODO: use State
  let counterElementInStruct = 0;
  const skeleton = lineInLine.map((line, index) => {
    const keyValue = line.split(":");
    if (index == 0) return mapping["init"]();
    if (mapping.assert.isEndSlice(keyValue)) {
      initSlice = false;
      counterElementInStruct = 0;
      return mapping[keyValue]();
    }
    if (mapping.assert.existKeyValue(keyValue)) {
      const [key, value] = keyValue;
      if (mapping.assert.isInitSlice(value)) {
        initSlice = true;
        counterElementInStruct++;
      }
      if (initSlice) return SliceRules({ counterElementInStruct, key, value });
      return mapping.value[isPrimitiveValue(value)](key, value);
    }
    if (mapping.assert.isPrimitiveValue(keyValue)) {
      return IdentifyTypes(keyValue[0]);
    }
    if (keyValue == "{" && initSlice) return "";
    if (keyValue == "}" && initSlice) return "";
    if (keyValue == "{") return mapping[keyValue]();
    if (keyValue == "}") return mapping[keyValue]();
  });
  return skeleton;
};

const BufferToLineInLine = (payload) => {
  const payloadToString = payload
    .toString()
    .replaceAll(" ", "")
    .replaceAll(",", "")
    .replaceAll('"', "");
  const lineInLine = payloadToString.split("\n");
  return lineInLine;
};

// Test      []string `json:"test"`
//TODO: Revalidar essa Function
const FmtToGolang = (skeleton) => {
  let fmtStructGolang = [];
  let removeLastListSintax = false;
  skeleton.forEach((row, index) => {
    if (index == 0) return fmtStructGolang.push(row);
    const isJavascriptTypes = Types[row] != undefined;
    if (
      row.includes("json") &&
      fmtStructGolang[fmtStructGolang.length - 1] == row
    ) {
      return;
    }
    if (isJavascriptTypes) {
      //TODO: elementExist In javascript (string, number, array, object)
      if (row == skeleton[index - 1]) return;
      const Key = skeleton[index - 1].split(" ")[0];
      fmtStructGolang[index - 1] = `${Key} []${Types[row]} ${GenerateTag(Key)}`;
      removeLastListSintax = true;
      return;
    }
    if (removeLastListSintax) {
      removeLastListSintax = false;
      return;
    }
    fmtStructGolang.push(row);
  });
  return fmtStructGolang;
};

const PlainTxtStructGolang = (fmtStructGolang) => {
  let txt = "";
  fmtStructGolang.forEach((row) => (txt += `${row}\n`));
  return txt;
};

//
// Main Function
//

const jsonToGo = (input) => {
  // const fileName = `${filepath}/01.json`;
  // generateFileToCompile(input, fileName);
  // const payload = ReadFileToCompile(fileName);
  const lineInLine = BufferToLineInLine(input);
  const skeleton = Skeleton(lineInLine);
  const fmtStructGolang = FmtToGolang(skeleton.filter((e) => e != ""));
  const structGo = PlainTxtStructGolang(fmtStructGolang);
  return structGo;
};

module.exports = { jsonToGo };
