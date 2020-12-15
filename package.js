
let {core} = require("./3rd_party/script/core.js");
let {LocalParty} = require("./3rd_party/script/config.js");
module.exports = {
  name: "foundation",
  version: '0.996.0',
  scripts: [
  ],
  files: ["src", "index.ts"],
  dependencies: [
    LocalParty.Utils.Master,
  ],
  devDependencies: [
  ],
  "miniprogram": "."
};
