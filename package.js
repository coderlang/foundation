
let {core} = require("./3rd_party/script/core.js");
let {ThirdParty, VueDevDependencies, WxAppDevDependencies, LocalParty} = require("./3rd_party/script/config.js");
module.exports = {
  name: "foundation",
  version: '0.996.0',
  scripts: [
  ],
  files: ["src", "index.ts"],
  dependencies: [
    LocalParty.Utils.Trunk,
    LocalParty.WxWrapper.V0_1,
    LocalParty.Stream.Trunk,
    ThirdParty.axios,
  ],
  devDependencies: [
    WxAppDevDependencies,
    VueDevDependencies,
  ],
  "miniprogram": "."
};
