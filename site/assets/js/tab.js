const OVERVIEW_TAB_KEY = "overview";
const OVERFLOW_SLOT_BASE_KEY = "project04";
const tabScript =
    document.currentScript ??
    document.querySelector('script[src$="/assets/js/tab.js"]') ??
    document.querySelector('script[src$="assets/js/tab.js"]');
const resolveTabAssetUrl = (path) => new URL(path, tabScript?.src ?? window.location.href).toString();
const overviewNewIconUrl = resolveTabAssetUrl("../images/new.svg");

const getProjectTabNumber = (tabKey) => {
    const match = /^project(\d+)$/.exec(tabKey ?? "");
    return match ? Number(match[1]) : null;
};

const getProjectColorIndex = (tabKey) => {
    const projectNumber = getProjectTabNumber(tabKey);
    return projectNumber ? String((projectNumber - 1) % 5) : "";
};

const initTabs = () => {
    document.querySelectorAll(".projects-tabs").forEach((tabSection, sectionIndex) => {
        const tabButtons = Array.from(tabSection.querySelectorAll(".projects-tabs__tab"));
        const panel = tabSection.querySelector(".projects-tabs__panel");
        const projectFields = Array.from(tabSection.querySelectorAll("[data-project-field]"));
        const overviewLabels = Array.from(tabSection.querySelectorAll("[data-overview-label]"));
        const defaultPanel = tabSection.querySelector(".projects-tabs__panel-default");
        const overviewPanel = tabSection.querySelector("[data-overview-panel]");
        const overviewButtons = Array.from(tabSection.querySelectorAll("[data-overview-target]"));
        const overflowButton = tabSection.querySelector(".projects-tabs__tab--overflow");

        if (!tabButtons.length || !panel) {
            return;
        }

        let activeTabKey = "";
        let lastProjectTabKey =
            tabButtons.find((button) => (button.dataset.tab ?? "") !== OVERVIEW_TAB_KEY)?.dataset.tab ?? "";

        tabButtons.forEach((button) => {
            const tabKey = button.dataset.tab ?? "";
            const colorIndex = getProjectColorIndex(tabKey);

            if (colorIndex) {
                button.dataset.colorIndex = colorIndex;
            }
        });

        const updateOverflowButton = (tabKey = OVERFLOW_SLOT_BASE_KEY) => {
            if (!overflowButton) {
                return;
            }

            const tabNumber = getProjectTabNumber(tabKey);
            const representedTabKey = tabNumber && tabNumber <= 4 ? tabKey : OVERFLOW_SLOT_BASE_KEY;
            const representedTabNumber = getProjectTabNumber(representedTabKey) ?? 4;
            const primary = overflowButton.querySelector(".projects-tabs__tab-primary");
            const secondary = overflowButton.querySelector(".projects-tabs__tab-secondary");

            overflowButton.dataset.representedTab = representedTabKey;
            overflowButton.dataset.colorIndex = getProjectColorIndex(representedTabKey);

            if (primary) {
                primary.textContent = `#${representedTabNumber}`;
            }

            if (secondary) {
                secondary.textContent =
                    window.siteI18n?.t(`projects.tabs.${representedTabKey}`) ?? `Project ${representedTabNumber}`;
            }
        };

        const getButtonActionTabKey = (button) => {
            if (button === overflowButton) {
                return button.dataset.representedTab ?? button.dataset.tab ?? "";
            }

            return button.dataset.tab ?? "";
        };

        const getButtonForTabKey = (tabKey) => {
            const directButton = tabButtons.find((button) => button.dataset.tab === tabKey);

            if (directButton) {
                return directButton;
            }

            if ((getProjectTabNumber(tabKey) ?? 0) <= 4 && overflowButton) {
                return overflowButton;
            }

            return null;
        };

        const updateMobileTabVisibility = () => {
            tabButtons.forEach((button) => {
                const tabKey = button.dataset.tab ?? "";
                const representedTabKey = button === overflowButton ? button.dataset.representedTab ?? tabKey : tabKey;
                const shouldShow = tabKey === OVERVIEW_TAB_KEY || representedTabKey === lastProjectTabKey;

                button.classList.toggle("is-mobile-visible", shouldShow);
            });
        };

        const updateOverviewLabels = () => {
            const latestOverviewTabKey = overviewButtons[0]?.dataset.overviewTarget ?? "";

            overviewLabels.forEach((label) => {
                const tabKey = label.dataset.overviewLabel;

                if (!tabKey) {
                    return;
                }

                label.textContent =
                    window.siteI18n?.t(`projects.content.${tabKey}.left.project_name`) ??
                    window.siteI18n?.t(`projects.tabs.${tabKey}`) ??
                    label.textContent;

                const parentButton = label.closest(".projects-tabs__overview-button");
                const existingBadge = parentButton?.querySelector(".projects-tabs__overview-new");

                if (tabKey === latestOverviewTabKey) {
                    if (!existingBadge && parentButton) {
                        const badge = document.createElement("img");
                        badge.className = "projects-tabs__overview-new";
                        badge.src = overviewNewIconUrl;
                        badge.alt = "New";
                        parentButton.appendChild(badge);
                    }
                } else {
                    existingBadge?.remove();
                }
            });
        };

        const setProjectFieldValues = (tabKey) => {
            const content = window.siteI18n?.t(`projects.content.${tabKey}`);

            projectFields.forEach((field) => {
                const path = field.dataset.projectField;
                const fieldType = field.dataset.projectFieldType ?? "text";

                if (!path) {
                    return;
                }

                const value = content
                    ? path.split(".").reduce((currentValue, key) => currentValue?.[key], content)
                    : "";

                if (fieldType === "rich") {
                    field.replaceChildren();

                    if (Array.isArray(value)) {
                        const hasSectionItems = value.some(
                            (item) => item && typeof item === "object" && !Array.isArray(item) && Array.isArray(item.items)
                        );

                        if (hasSectionItems) {
                            const sections = document.createElement("div");
                            sections.className = "projects-tabs__content-sections";

                            value.forEach((item) => {
                                if (!item || typeof item !== "object" || Array.isArray(item)) {
                                    return;
                                }

                                const section = document.createElement("section");
                                section.className = "projects-tabs__content-section";

                                if (typeof item.title === "string" && item.title) {
                                    const title = document.createElement("h4");
                                    title.className = "projects-tabs__content-section-title";
                                    title.textContent = item.title;
                                    section.appendChild(title);
                                }

                                if (Array.isArray(item.items) && item.items.length) {
                                    const list = document.createElement("ul");
                                    list.className = "projects-tabs__content-list";

                                    item.items.forEach((listEntry) => {
                                        if (typeof listEntry !== "string" || !listEntry) {
                                            return;
                                        }

                                        const listItem = document.createElement("li");
                                        listItem.textContent = listEntry;
                                        list.appendChild(listItem);
                                    });

                                    section.appendChild(list);
                                }

                                sections.appendChild(section);
                            });

                            field.appendChild(sections);
                            return;
                        }

                        const list = document.createElement("ul");
                        list.className = "projects-tabs__content-list";

                        value.forEach((item) => {
                            if (typeof item !== "string" || !item) {
                                return;
                            }

                            const listItem = document.createElement("li");
                            listItem.textContent = item;
                            list.appendChild(listItem);
                        });

                        field.appendChild(list);
                        return;
                    }

                    field.textContent = typeof value === "string" ? value : "";
                    return;
                }

                field.textContent = typeof value === "string" ? value : "";
            });
        };

        const setActiveTab = (tabKey) => {
            updateOverflowButton(tabKey);
            updateOverviewLabels();

            const activeButton = getButtonForTabKey(tabKey);

            if (!activeButton) {
                return;
            }

            activeTabKey = tabKey;

            if (tabKey !== OVERVIEW_TAB_KEY) {
                lastProjectTabKey = tabKey;
            }

            tabButtons.forEach((button) => {
                const isActive = button === activeButton;
                const tabIcon = button.querySelector(".projects-tabs__tab-icon");

                button.classList.toggle("is-active", isActive);
                button.setAttribute("aria-selected", String(isActive));
                button.tabIndex = isActive ? 0 : -1;

                if (tabIcon) {
                    tabIcon.src = isActive
                        ? tabIcon.dataset.tabIconOpen ?? tabIcon.src
                        : tabIcon.dataset.tabIconClosed ?? tabIcon.src;
                }
            });

            panel.dataset.activeTab = tabKey;
            panel.setAttribute("aria-labelledby", activeButton.id);

            const isOverviewTab = tabKey === OVERVIEW_TAB_KEY;

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
            const buttonTabKey = button.dataset.tab ?? `tab-${index + 1}`;
            const buttonId = button.id || `projects-tab-${sectionIndex + 1}-${buttonTabKey}`;

            button.id = buttonId;
            button.setAttribute("aria-controls", panel.id || `projects-tabpanel-${sectionIndex + 1}`);

            button.addEventListener("click", () => {
                setActiveTab(getButtonActionTabKey(button));
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
                setActiveTab(getButtonActionTabKey(tabButtons[nextIndex]));
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
            tabSection.dataset.initialTab ??
            tabButtons.find((button) => button.classList.contains("is-active"))?.dataset.tab ??
            tabButtons[0].dataset.tab ??
            "";

        setActiveTab(initialActiveTab);

        document.addEventListener("site:language-change", () => {
            if (activeTabKey) {
                setActiveTab(activeTabKey);
            }
        });
    });
};

document.addEventListener("DOMContentLoaded", initTabs);
