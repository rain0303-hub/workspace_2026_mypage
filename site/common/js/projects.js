const initProjectsTabs = () => {
    const tabSection = document.querySelector(".projects-tabs");

    if (!tabSection) {
        return;
    }

    const tabButtons = Array.from(tabSection.querySelectorAll(".projects-tabs__tab"));
    const panel = tabSection.querySelector(".projects-tabs__panel");
    const eyebrow = tabSection.querySelector("[data-tab-eyebrow]");
    const title = tabSection.querySelector("[data-tab-title]");
    const text = tabSection.querySelector("[data-tab-text]");

    if (!tabButtons.length || !panel || !eyebrow || !title || !text) {
        return;
    }

    let activeTabKey = tabButtons.find((button) => button.classList.contains("is-active"))?.dataset.tab ?? "web";

    const getTabContent = () => window.siteI18n?.t("projects.content") ?? {};

    const setActiveTab = (tabKey) => {
        const content = getTabContent()[tabKey];

        if (!content) {
            return;
        }

        activeTabKey = tabKey;

        tabButtons.forEach((button) => {
            const isActive = button.dataset.tab === tabKey;
            button.classList.toggle("is-active", isActive);
            button.setAttribute("aria-selected", String(isActive));
            button.tabIndex = isActive ? 0 : -1;
        });

        panel.setAttribute("aria-label", content.panelLabel);
        eyebrow.textContent = content.eyebrow;
        title.textContent = content.title;
        text.textContent = content.text;
    };

    tabButtons.forEach((button, index) => {
        button.tabIndex = button.classList.contains("is-active") ? 0 : -1;

        button.addEventListener("click", () => {
            setActiveTab(button.dataset.tab);
        });

        button.addEventListener("keydown", (event) => {
            if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") {
                return;
            }

            event.preventDefault();

            const nextIndex =
                event.key === "ArrowRight"
                    ? (index + 1) % tabButtons.length
                    : (index - 1 + tabButtons.length) % tabButtons.length;

            const nextButton = tabButtons[nextIndex];
            nextButton.focus();
            setActiveTab(nextButton.dataset.tab);
        });
    });

    document.addEventListener("site:language-change", () => {
        setActiveTab(activeTabKey);
    });

    setActiveTab(activeTabKey);
};

document.addEventListener("DOMContentLoaded", initProjectsTabs);
