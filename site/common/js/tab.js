const initTabs = () => {
    document.querySelectorAll(".projects-tabs").forEach((tabSection, sectionIndex) => {
        const tabButtons = Array.from(tabSection.querySelectorAll(".projects-tabs__tab"));
        const panel = tabSection.querySelector(".projects-tabs__panel");

        if (!tabButtons.length || !panel) {
            return;
        }

        const setActiveTab = (tabKey) => {
            const activeButton = tabButtons.find((button) => button.dataset.tab === tabKey);

            if (!activeButton) {
                return;
            }

            tabButtons.forEach((button) => {
                const isActive = button === activeButton;
                button.classList.toggle("is-active", isActive);
                button.setAttribute("aria-selected", String(isActive));
                button.tabIndex = isActive ? 0 : -1;
            });

            panel.dataset.activeTab = tabKey;
            panel.setAttribute("aria-labelledby", activeButton.id);
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

        panel.id = panel.id || `projects-tabpanel-${sectionIndex + 1}`;

        const initialActiveTab =
            tabButtons.find((button) => button.classList.contains("is-active"))?.dataset.tab ??
            tabButtons[0].dataset.tab;

        setActiveTab(initialActiveTab);
    });
};

document.addEventListener("DOMContentLoaded", initTabs);
