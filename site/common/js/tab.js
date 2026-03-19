const initTabs = () => {
    document.querySelectorAll(".projects-tabs").forEach((tabSection, sectionIndex) => {
        const tabButtons = Array.from(tabSection.querySelectorAll(".projects-tabs__tab"));
        const panel = tabSection.querySelector(".projects-tabs__panel");
        const projectFields = Array.from(tabSection.querySelectorAll("[data-project-field]"));
        const defaultPanel = tabSection.querySelector(".projects-tabs__panel-default");
        const overviewPanel = tabSection.querySelector("[data-overview-panel]");
        const overviewButtons = Array.from(tabSection.querySelectorAll("[data-overview-target]"));

        if (!tabButtons.length || !panel) {
            return;
        }

        let activeTabKey = "";
        let lastProjectTabKey = tabButtons.find((button) => button.dataset.tab !== "project04")?.dataset.tab ?? "";

        const updateMobileTabVisibility = () => {
            tabButtons.forEach((button) => {
                const tabKey = button.dataset.tab ?? "";
                const shouldShow = tabKey === "project04" || tabKey === lastProjectTabKey;
                button.classList.toggle("is-mobile-visible", shouldShow);
            });
        };

        const setProjectFieldValues = (tabKey) => {
            const content = window.siteI18n?.t(`projects.content.${tabKey}`);

            projectFields.forEach((field) => {
                const path = field.dataset.projectField;

                if (!path) {
                    return;
                }

                const value = content
                    ? path.split(".").reduce((currentValue, key) => currentValue?.[key], content)
                    : "";
                field.textContent = typeof value === "string" ? value : "";
            });
        };

        const setActiveTab = (tabKey) => {
            const activeButton = tabButtons.find((button) => button.dataset.tab === tabKey);

            if (!activeButton) {
                return;
            }

            activeTabKey = tabKey;

            if (tabKey !== "project04") {
                lastProjectTabKey = tabKey;
            }

            tabButtons.forEach((button) => {
                const isActive = button === activeButton;
                button.classList.toggle("is-active", isActive);
                button.setAttribute("aria-selected", String(isActive));
                button.tabIndex = isActive ? 0 : -1;
            });

            panel.dataset.activeTab = tabKey;
            panel.setAttribute("aria-labelledby", activeButton.id);

            const isOverviewTab = tabKey === "project04";
            if (defaultPanel) {
                defaultPanel.hidden = isOverviewTab;
            }
            if (overviewPanel) {
                overviewPanel.hidden = !isOverviewTab;
            }

            updateMobileTabVisibility();
            setProjectFieldValues(tabKey);
        };

        tabButtons.forEach((button, index) => {
            const tabKey = button.dataset.tab ?? `tab-${index + 1}`;
            const buttonId = button.id || `projects-tab-${sectionIndex + 1}-${tabKey}`;

            button.id = buttonId;
            button.setAttribute("aria-controls", panel.id || `projects-tabpanel-${sectionIndex + 1}`);

            button.addEventListener("click", () => {
                setActiveTab(tabKey);
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

                tabButtons[nextIndex].focus();
                setActiveTab(tabButtons[nextIndex].dataset.tab);
            });
        });

        overviewButtons.forEach((button) => {
            button.addEventListener("click", () => {
                const tabKey = button.dataset.overviewTarget;

                if (!tabKey) {
                    return;
                }

                setActiveTab(tabKey);
            });
        });

        panel.id = panel.id || `projects-tabpanel-${sectionIndex + 1}`;

        const initialActiveTab =
            tabButtons.find((button) => button.classList.contains("is-active"))?.dataset.tab ??
            tabButtons[0].dataset.tab;

        setActiveTab(initialActiveTab);

        document.addEventListener("site:language-change", () => {
            if (activeTabKey) {
                setProjectFieldValues(activeTabKey);
            }
        });
    });
};

document.addEventListener("DOMContentLoaded", initTabs);
