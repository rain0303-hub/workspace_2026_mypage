const I18N_STORAGE_KEY = "site-language";
const mainScript =
    document.currentScript ??
    document.querySelector('script[src$="/assets/js/main.js"]') ??
    document.querySelector('script[src$="assets/js/main.js"]');
const resolveMainAssetUrl = (path) => new URL(path, mainScript?.src ?? window.location.href).toString();
const CONTENT_FILE_URL = resolveMainAssetUrl("../i18n/content.json");
const I18N_FILE_MAP = {
    jp: resolveMainAssetUrl("../i18n/jp.json"),
    en: resolveMainAssetUrl("../i18n/en.json"),
    zh: resolveMainAssetUrl("../i18n/zh.json")
};

const i18nState = {
    locale: "jp",
    messages: {},
    cache: {}
};
const contentState = {
    data: null
};

const getByPath = (source, path) =>
    path.split(".").reduce((value, key) => (value && key in value ? value[key] : undefined), source);

const translate = (key) => getByPath(i18nState.messages, key);
const getContent = (key) => getByPath(contentState.data, key);
const resolveContentAssetUrl = (path) =>
    typeof path === "string" && path ? new URL(path, CONTENT_FILE_URL).toString() : "";

const applyTextTranslations = () => {
    document.querySelectorAll("[data-i18n]").forEach((element) => {
        const value = translate(element.dataset.i18n);

        if (typeof value === "string") {
            element.textContent = value;
        }
    });
};

const applyAttributeTranslations = () => {
    document.querySelectorAll("[data-i18n-aria-label]").forEach((element) => {
        const value = translate(element.dataset.i18nAriaLabel);

        if (typeof value === "string") {
            element.setAttribute("aria-label", value);
        }
    });
};

const applyDocumentLanguage = () => {
    document.documentElement.lang = i18nState.locale === "jp" ? "ja" : i18nState.locale;
};

const applyTitleTranslation = () => {
    const titleElement = document.querySelector("title[data-i18n]");

    if (!titleElement) {
        return;
    }

    const value = translate(titleElement.dataset.i18n);

    if (typeof value === "string") {
        document.title = value;
    }
};

const updateLanguageButtons = () => {
    document.querySelectorAll(".language-menu__option[data-language]").forEach((button) => {
        const isActive = button.dataset.language === i18nState.locale;
        button.setAttribute("aria-pressed", String(isActive));
        button.classList.toggle("is-active", isActive);
    });
};

const dispatchLanguageChange = () => {
    document.dispatchEvent(
        new CustomEvent("site:language-change", {
            detail: {
                locale: i18nState.locale,
                messages: i18nState.messages
            }
        })
    );
};

const dispatchContentChange = () => {
    document.dispatchEvent(
        new CustomEvent("site:content-change", {
            detail: {
                content: contentState.data
            }
        })
    );
};

const applyTranslations = () => {
    applyDocumentLanguage();
    applyTitleTranslation();
    applyTextTranslations();
    applyAttributeTranslations();
    updateLanguageButtons();
    dispatchLanguageChange();
};

const loadMessages = async (locale) => {
    if (i18nState.cache[locale]) {
        return i18nState.cache[locale];
    }

    const response = await fetch(I18N_FILE_MAP[locale]);

    if (!response.ok) {
        throw new Error(`Failed to load locale: ${locale}`);
    }

    const messages = await response.json();
    i18nState.cache[locale] = messages;
    return messages;
};

const loadContent = async () => {
    if (contentState.data) {
        return contentState.data;
    }

    const response = await fetch(CONTENT_FILE_URL);

    if (!response.ok) {
        throw new Error("Failed to load content config.");
    }

    contentState.data = await response.json();
    return contentState.data;
};

const loadMessagesWithFallback = async (locale) => {
    try {
        return await loadMessages(locale);
    } catch (error) {
        if (locale !== "en") {
            console.error(`Failed to load locale "${locale}", falling back to English.`, error);
            return loadMessages("en");
        }

        throw error;
    }
};

const setLanguage = async (locale) => {
    const nextLocale = I18N_FILE_MAP[locale] ? locale : "jp";
    const messages = await loadMessagesWithFallback(nextLocale);

    i18nState.locale = messages === i18nState.cache[nextLocale] ? nextLocale : "en";
    i18nState.messages = messages;
    window.localStorage.setItem(I18N_STORAGE_KEY, i18nState.locale);
    applyTranslations();
};

const getInitialLocale = () => {
    const savedLocale = window.localStorage.getItem(I18N_STORAGE_KEY);

    if (savedLocale && I18N_FILE_MAP[savedLocale]) {
        return savedLocale;
    }

    return "jp";
};

const initLanguageMenu = () => {
    document.querySelectorAll(".language-menu__option[data-language]").forEach((button) => {
        button.addEventListener("click", async () => {
            await setLanguage(button.dataset.language);
        });
    });
};

const initI18n = async () => {
    initLanguageMenu();

    try {
        await setLanguage(getInitialLocale());
    } catch (error) {
        console.error(error);
    }
};

const initContent = async () => {
    try {
        await loadContent();
        dispatchContentChange();
    } catch (error) {
        console.error(error);
    }
};

window.siteI18n = {
    get locale() {
        return i18nState.locale;
    },
    t: translate
};

window.siteContent = {
    get(path) {
        return getContent(path);
    },
    resolveAssetUrl(path) {
        return resolveContentAssetUrl(path);
    }
};

document.addEventListener("DOMContentLoaded", () => {
    void initI18n();
    void initContent();
});
