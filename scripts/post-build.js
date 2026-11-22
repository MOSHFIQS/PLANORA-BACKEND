const fs = require("fs");
const path = require("path");

const apiPath = path.resolve(__dirname, "../api/index.js");
if (fs.existsSync(apiPath)) {
  let content = fs.readFileSync(apiPath, "utf8");
  content = content
    .replace(/swagger_ui_require\(['"]url['"]\)/g, "require('url')")
    .replace(/type_helpers_utils_require\(['"]url['"]\)/g, "require('url')");
  fs.writeFileSync(apiPath, content, "utf8");
  console.log("Post-build patch applied successfully to api/index.js");
}
