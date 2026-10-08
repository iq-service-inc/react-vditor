// 產生 dist/index.css：vditor 基礎樣式，以及以容器 class（.react-vditor--light / .react-vditor--dark）限定範圍的主題樣式。
// 範圍限定不提高選擇器權重，以維持與原生 vditor 相同的層疊結果。
const fs = require("fs");
const path = require("path");
const postcss = require("postcss");
const prefixSelector = require("postcss-prefix-selector");

const DIST = path.dirname(require.resolve("vditor/dist/index.css"));

const scoped = (file, prefix) => {
    const source = fs.readFileSync(path.join(DIST, file), "utf8");
    return postcss([prefixSelector({prefix})]).process(source, {from: undefined}).css;
};

const buildCss = () => [
    fs.readFileSync(path.join(DIST, "index.css"), "utf8"),
    "/* react-vditor：light / dark 主題 */",
    scoped("css/content-theme/light.css", ":where(.react-vditor--light)"),
    scoped("css/content-theme/dark.css", ":where(.react-vditor--dark)"),
    // light 沿用 vditor 全域載入的 github.min.css；dark 以型別選擇器 div 增加 (0,0,1) 權重覆寫（主題容器均為 <div>）
    scoped("js/highlight.js/styles/github-dark.min.css", "div:where(.react-vditor--dark)"),
    ":where(.react-vditor--light) .vditor-reset pre > code.hljs { background-color: #f6f8fa; }",
    ".react-vditor-preview.react-vditor--dark { background-color: #2f363d; }",
].join("\n");

module.exports = {buildCss};
