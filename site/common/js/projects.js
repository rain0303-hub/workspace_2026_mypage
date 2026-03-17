const projectTabContent = {
    web: {
        panelLabel: "Citizen projects",
        eyebrow: "Citizen",
        title: "Convenient Navigation",
        text: "A simple preview area for public-service style projects. We can place cards, screenshots, and detail blocks here next."
    },
    app: {
        panelLabel: "Child care projects",
        eyebrow: "Child Care",
        title: "Support For Families",
        text: "This area can present child-care, family support, or reservation related projects in a clean and structured way."
    },
    other: {
        panelLabel: "Senior citizen projects",
        eyebrow: "Senior Citizen",
        title: "Accessible Information",
        text: "This area can present services for seniors, guidance systems, and accessibility-oriented project work."
    }
};

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

    const setActiveTab = (tabKey) => {
        const content = projectTabContent[tabKey];

        if (!content) {
            return;
        }

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
};

document.addEventListener("DOMContentLoaded", initProjectsTabs);
