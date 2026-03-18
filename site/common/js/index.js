const header = document.querySelector(".l-header");
const navToggle = document.querySelector(".navi-toggle");
const navLinks = document.querySelectorAll(".navi-btn");
const languageMenu = document.querySelector(".language-menu");
const languageToggle = document.querySelector(".language-menu__toggle");

const getMessage = (key, fallback) => window.siteI18n?.t(key) ?? fallback;

const initCopyButtons = () => {
    const contactCopyButtons = document.querySelectorAll(".contact-copy-btn");

    if (!contactCopyButtons.length) {
        return;
    }

    let activeCopyState = null;

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
};

const initMobileDoubleTapNavigation = () => {
    if (!header) {
        return;
    }

    let lastTapTime = 0;
    document.addEventListener(
        "touchend",
        (event) => {
            if (window.innerWidth > 767) {
                return;
            }

            const currentTapTime = Date.now();
            const isDoubleTap = currentTapTime - lastTapTime < 320;
            lastTapTime = currentTapTime;

            if (!isDoubleTap) {
                return;
            }

            if (header.contains(event.target)) {
                return;
            }

            event.preventDefault();
            header.classList.toggle("is-hidden");
        },
        { passive: false }
    );
};

const initHeaderScroll = () => {
    if (!header || getComputedStyle(header).position !== "fixed") {
        return;
    }

    let lastScrollY = window.scrollY;
    let hasEnteredHeaderAfterReveal = false;
    const updateHeaderVisibilityOnPointerMove = (event) => {
        if (window.innerWidth <= 767) {
            return;
        }

        if (window.scrollY <= 0) {
            header.classList.remove("is-hidden");
            return;
        }

        if (event.clientY <= 40) {
            header.classList.remove("is-hidden");
            return;
        }

        if (header.contains(event.target)) {
            hasEnteredHeaderAfterReveal = true;
            return;
        }

        if (header.classList.contains("is-menu-open") || languageMenu?.classList.contains("is-open")) {
            return;
        }

        if (hasEnteredHeaderAfterReveal) {
            header.classList.add("is-hidden");
            hasEnteredHeaderAfterReveal = false;
        }
    };

    window.addEventListener("scroll", () => {
        const currentScrollY = window.scrollY;
        const scrollDelta = currentScrollY - lastScrollY;

        if (currentScrollY <= 0) {
            header.classList.remove("is-hidden");
            hasEnteredHeaderAfterReveal = false;
            lastScrollY = currentScrollY;
            return;
        }

        if (scrollDelta > 6) {
            header.classList.add("is-hidden");
            hasEnteredHeaderAfterReveal = false;
        } else if (scrollDelta < -6) {
            header.classList.remove("is-hidden");
            hasEnteredHeaderAfterReveal = false;
        }

        lastScrollY = currentScrollY;
    });

    window.addEventListener("mousemove", updateHeaderVisibilityOnPointerMove);
};

const initNavigation = () => {
    if (!header || !navToggle) {
        return;
    }

    const closeLanguageMenu = () => {
        if (!languageMenu || !languageToggle) {
            return;
        }

        languageMenu.classList.remove("is-open");
        languageToggle.setAttribute("aria-expanded", "false");
    };

    const closeNavigationMenu = () => {
        header.classList.remove("is-menu-open");
        navToggle.setAttribute("aria-expanded", "false");
        navToggle.setAttribute("aria-label", getMessage("common.open_navigation", "Open navigation"));
    };

    const closeMenu = () => {
        closeNavigationMenu();
        closeLanguageMenu();
    };

    navToggle.addEventListener("click", () => {
        if (!header.classList.contains("is-menu-open")) {
            closeLanguageMenu();
        }

        const isOpen = header.classList.toggle("is-menu-open");
        navToggle.setAttribute("aria-expanded", String(isOpen));
        navToggle.setAttribute(
            "aria-label",
            isOpen
                ? getMessage("common.close_navigation", "Close navigation")
                : getMessage("common.open_navigation", "Open navigation")
        );
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

    if (!languageMenu || !languageToggle) {
        return;
    }

    languageToggle.addEventListener("click", (event) => {
        event.stopPropagation();
        if (!languageMenu.classList.contains("is-open")) {
            closeNavigationMenu();
        }

        const isOpen = languageMenu.classList.toggle("is-open");
        languageToggle.setAttribute("aria-expanded", String(isOpen));
    });

    document.addEventListener("click", (event) => {
        if (!languageMenu.contains(event.target)) {
            closeLanguageMenu();
        }
    });

    window.addEventListener(
        "scroll",
        () => {
            closeLanguageMenu();
        },
        { passive: true }
    );

    document.addEventListener("site:language-change", () => {
        const isOpen = header.classList.contains("is-menu-open");
        navToggle.setAttribute(
            "aria-label",
            isOpen
                ? getMessage("common.close_navigation", "Close navigation")
                : getMessage("common.open_navigation", "Open navigation")
        );
    });
};

initCopyButtons();
initMobileDoubleTapNavigation();
initHeaderScroll();
initNavigation();
