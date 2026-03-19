const header = document.querySelector(".l-header");
const headerLogo = document.querySelector(".header-logo");
const navToggle = document.querySelector(".navi-toggle");
const navLinks = document.querySelectorAll(".navi-btn");
const languageMenu = document.querySelector(".language-menu");
const languageToggle = document.querySelector(".language-menu__toggle");
const indexScript =
    document.currentScript ??
    document.querySelector('script[src$="/common/js/index.js"]') ??
    document.querySelector('script[src$="common/js/index.js"]');
const resolveIndexAssetUrl = (path) => new URL(path, indexScript?.src ?? window.location.href).toString();
const copyIconUrl = resolveIndexAssetUrl("../images/copy.svg");
const checkIconUrl = resolveIndexAssetUrl("../images/check.svg");

const getMessage = (key, fallback) => window.siteI18n?.t(key) ?? fallback;

const initHeaderLogoTapAnimation = () => {
    if (!headerLogo) {
        return;
    }

    let tapTimeoutId = 0;

    headerLogo.addEventListener("click", () => {
        if (window.innerWidth > 767) {
            return;
        }

        window.clearTimeout(tapTimeoutId);
        headerLogo.classList.remove("is-tapping");
        void headerLogo.offsetWidth;
        headerLogo.classList.add("is-tapping");

        tapTimeoutId = window.setTimeout(() => {
            headerLogo.classList.remove("is-tapping");
        }, 360);
    });
};

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
        state.icon.src = copyIconUrl;
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
                icon.src = checkIconUrl;
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

    const languageIcon = languageToggle.querySelector(".language-menu__icon");
    const languageOptions = Array.from(languageMenu.querySelectorAll(".language-menu__option[data-language]"));
    let languageIconAnimationTimeoutId = 0;

    const triggerLanguageIconAnimation = () => {
        if (!languageIcon || window.innerWidth > 767) {
            return;
        }

        window.clearTimeout(languageIconAnimationTimeoutId);
        languageIcon.classList.remove("is-pressing");
        void languageIcon.offsetWidth;
        languageIcon.classList.add("is-pressing");

        languageIconAnimationTimeoutId = window.setTimeout(() => {
            languageIcon.classList.remove("is-pressing");
        }, 360);
    };

    languageToggle.addEventListener("click", (event) => {
        event.stopPropagation();
        triggerLanguageIconAnimation();
        if (!languageMenu.classList.contains("is-open")) {
            closeNavigationMenu();
        }

        const isOpen = languageMenu.classList.toggle("is-open");
        languageToggle.setAttribute("aria-expanded", String(isOpen));
    });

    languageOptions.forEach((option) => {
        option.addEventListener("click", () => {
            closeLanguageMenu();
        });
    });

    document.addEventListener("click", (event) => {
        if (window.innerWidth <= 767 && header.classList.contains("is-menu-open") && !header.contains(event.target)) {
            closeNavigationMenu();
        }

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
initHeaderLogoTapAnimation();
initMobileDoubleTapNavigation();
initHeaderScroll();
initNavigation();
