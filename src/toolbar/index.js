/**
 * 預設工具列。跟 vditor 原本的相比：
 * - 拿掉 export（寫死連 CDN）、devtools（要 echarts）、info（寫死 unpkg 的 logo）
 * - 拿掉 emoji、record、code-theme、content-theme、help
 */
export const TOOLBAR = [
    "headings", "bold", "italic", "strike", "link", "|",
    "list", "ordered-list", "check", "outdent", "indent", "|",
    "quote", "line", "code", "inline-code", "insert-before", "insert-after", "|",
    "upload", "table", "|",
    "undo", "redo", "|",
    "fullscreen", "edit-mode",
    {name: "more", toolbar: ["both", "outline", "preview"]},
];

/** upload.imageOnly 時 upload 按鈕的提示。vditor 語系檔沒有這個字，照各語系「上傳圖片或文件」的譯法拿掉「或文件」；沒列到的語言用英文 */
const IMAGE_ONLY_TIPS = {
    en_US: "Upload image",
    zh_CN: "上传图片",
    zh_TW: "上傳圖片",
};

/**
 * upload.imageOnly 時，upload 按鈕（含 more 之類的子選單裡的）的提示改成「上傳圖片」；使用端在物件裡給的 tip 優先。
 * 不是 imageOnly 時沿用 vditor 語系檔的「上傳圖片或文件」
 */
export const expandToolbar = (toolbar, lang, imageOnly) => toolbar.map((item) => {
    if (imageOnly && (item === "upload" || item?.name === "upload")) {
        return {name: "upload", tip: IMAGE_ONLY_TIPS[lang] || IMAGE_ONLY_TIPS.en_US, ...(typeof item === "string" ? {} : item)};
    }
    return item?.toolbar ? {...item, toolbar: expandToolbar(item.toolbar, lang, imageOnly)} : item;
});

/**
 * vditor 的 disabled() 只停用編輯相關的按鈕；其餘按鈕（如 more 中的「預覽」）仍可操作，可能使停用狀態失效。
 * 改寫 instance 的 disabled()、enable()：停用時一併停用其餘按鈕，啟用時只還原這些按鈕，其他交由 vditor 處理
 */
export const disableToolbarWithEditor = (instance, root) => {
    const disabled = instance.disabled.bind(instance);
    const enable = instance.enable.bind(instance);
    let extra = [];
    instance.disabled = () => {
        disabled();
        // 連續呼叫時累加，enable() 才能全部還原
        const buttons = [...root.querySelectorAll(".vditor-toolbar__item > [data-type]:not(.vditor-menu--disabled)")];
        buttons.forEach((button) => button.classList.add("vditor-menu--disabled"));
        extra = extra.concat(buttons);
    };
    instance.enable = () => {
        extra.forEach((button) => button.classList.remove("vditor-menu--disabled"));
        extra = [];
        enable();
    };
};
