// 編輯模式僅提供 wysiwyg 與 sv：edit-mode 換成切換分割預覽的按鈕，並停用 ir 的快捷鍵。
// vditor 未公開切換模式的 API，按鈕以模擬快捷鍵（Ctrl / ⌘ + Alt + 7、9）切換。

/** 切換按鈕的 name；沿用 vditor 語系檔的鍵名，按鈕提示隨 lang 顯示 */
const BUTTON_NAME = "splitView";

/** vditor 切換模式的快捷鍵 */
const HOTKEYS = {wysiwyg: "Digit7", ir: "Digit8", sv: "Digit9"};

const isModeHotkey = (event) => (event.ctrlKey || event.metaKey) && event.altKey && !event.shiftKey;

/** 同 vditor 的 isCtrl：mac 用 ⌘，其他平台用 Ctrl */
const isMac = () => navigator.platform.toUpperCase().includes("MAC");

/** 實際使用的模式：ir 改用 wysiwyg */
export const resolveMode = (mode) => (mode === "ir" ? "wysiwyg" : mode);

const toggleButton = {
    name: BUTTON_NAME,
    icon: '<svg><use xlink:href="#vditor-icon-both"></use></svg>',
    hotkey: "⌥⌘9",
    tipPosition: "nw",
    click: (event, vditor) => {
        const mac = isMac();
        vditor[vditor.currentMode].element.dispatchEvent(new KeyboardEvent("keydown", {
            code: vditor.currentMode === "sv" ? HOTKEYS.wysiwyg : HOTKEYS.sv,
            altKey: true, ctrlKey: !mac, metaKey: mac, bubbles: true,
        }));
    },
};

/**
 * 工具列（含子選單）中的 edit-mode 之後加入切換按鈕。
 * 原生 edit-mode 保留但隱藏（見 initToggleModeButton），供 vditor 依名稱停用、啟用
 */
export const expandEditMode = (toolbar) => toolbar.flatMap((item) => {
    if (item === "edit-mode" || item?.name === "edit-mode") {
        return [item, toggleButton];
    }
    return item?.toolbar ? {...item, toolbar: expandEditMode(item.toolbar)} : item;
});

const toggleButtons = (root) => root.querySelectorAll(`.vditor-toolbar [data-type="${BUTTON_NAME}"]`);

/** sv 模式時將切換按鈕標示為作用中 */
export const markCurrentMode = (root, mode) => {
    toggleButtons(root).forEach((button) => button.classList.toggle("vditor-menu--current", mode === "sv"));
};

/**
 * 編輯器就緒後呼叫：隱藏原生 edit-mode，並讓切換按鈕跟隨其停用狀態。
 * vditor 的 disabled()、enable() 與預覽模式只依名稱停用 edit-mode
 */
export const initToggleModeButton = (root, mode) => {
    const native = root.querySelector('.vditor-toolbar [data-type="edit-mode"]');
    if (native) {
        native.parentElement.style.display = "none";
        const syncDisabled = () => toggleButtons(root).forEach((button) =>
            button.classList.toggle("vditor-menu--disabled", native.classList.contains("vditor-menu--disabled")));
        syncDisabled();
        new MutationObserver(syncDisabled).observe(native, {attributeFilter: ["class"]});
    }
    markCurrentMode(root, mode);
};

/**
 * 捕獲階段攔截 ir 的快捷鍵；冒泡階段於 vditor 處理快捷鍵後更新按鈕標示。
 * 回傳解除監聽的函式
 */
export const bindEditMode = (root, getMode) => {
    const block = (event) => {
        if (event.code === HOTKEYS.ir && isModeHotkey(event)) {
            event.stopPropagation();
            event.preventDefault();
        }
    };
    const mark = (event) => isModeHotkey(event) && markCurrentMode(root, getMode());
    root.addEventListener("keydown", block, true);
    root.addEventListener("keydown", mark);
    return () => {
        root.removeEventListener("keydown", block, true);
        root.removeEventListener("keydown", mark);
    };
};
