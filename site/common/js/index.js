const contactCopyButtons = document.querySelectorAll(".contact-copy-btn");
const header = document.querySelector(".l-header");
const navToggle = document.querySelector(".navi-toggle");
const navLinks = document.querySelectorAll(".navi-btn");
const languageMenu = document.querySelector(".language-menu");
const languageToggle = document.querySelector(".language-menu__toggle");
let activeCopyState = null;
let lastScrollY = window.scrollY;

const resetCopyState = (state) => {
    if (!state) {
        return;
    }

    window.clearTimeout(state.timeoutId);
    state.icon.src = "./common/images/copy.svg";
    state.icon.classList.remove("contact-copy-icon--checked");
    delete state.button.dataset.copied;

    if (activeCopyState === state) {
        activeCopyState = null;
    }
};

contactCopyButtons.forEach((button) => {
    button.addEventListener("click", async () => {
        const row = button.closest(".contact-copy-row");
        const value = row?.querySelector(".contact-copy-value")?.textContent?.trim();
        const icon = button.querySelector(".contact-copy-icon");

        if (!value || !icon) {
            return;
        }

        try {
            if (activeCopyState && activeCopyState.button !== button) {
                resetCopyState(activeCopyState);
            }

            await navigator.clipboard.writeText(value);
            icon.src = "./common/images/check.svg";
            icon.classList.add("contact-copy-icon--checked");
            button.dataset.copied = "true";

            const timeoutId = window.setTimeout(() => {
                resetCopyState({ button, icon, timeoutId });
            }, 1200);

            activeCopyState = { button, icon, timeoutId };
        } catch (error) {
            button.dataset.copied = "false";
        }
    });
});

if (header) {
    window.addEventListener("scroll", () => {
        const currentScrollY = window.scrollY;
        const scrollDelta = currentScrollY - lastScrollY;

        if (currentScrollY <= 0) {
            header.classList.remove("is-hidden");
            lastScrollY = currentScrollY;
            return;
        }

        if (scrollDelta > 6) {
            header.classList.add("is-hidden");
        } else if (scrollDelta < -6) {
            header.classList.remove("is-hidden");
        }

        lastScrollY = currentScrollY;
    });
}

if (header && navToggle) {
    const closeLanguageMenu = () => {
        if (!languageMenu || !languageToggle) {
            return;
        }

        languageMenu.classList.remove("is-open");
        languageToggle.setAttribute("aria-expanded", "false");
    };

    const closeMenu = () => {
        header.classList.remove("is-menu-open");
        navToggle.setAttribute("aria-expanded", "false");
        navToggle.setAttribute("aria-label", "Open navigation");
        closeLanguageMenu();
    };

    navToggle.addEventListener("click", () => {
        const isOpen = header.classList.toggle("is-menu-open");
        navToggle.setAttribute("aria-expanded", String(isOpen));
        navToggle.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
    });

    navLinks.forEach((link) => {
        if (link === languageToggle) {
            return;
        }

        link.addEventListener("click", closeMenu);
    });

    window.addEventListener("resize", () => {
        if (window.innerWidth > 900) {
            closeMenu();
        }
    });

    if (languageMenu && languageToggle) {
        languageToggle.addEventListener("click", (event) => {
            event.stopPropagation();
            const isOpen = languageMenu.classList.toggle("is-open");
            languageToggle.setAttribute("aria-expanded", String(isOpen));
        });

        document.addEventListener("click", (event) => {
            if (!languageMenu.contains(event.target)) {
                closeLanguageMenu();
            }
        });
    }
}
