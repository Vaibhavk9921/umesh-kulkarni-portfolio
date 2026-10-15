"use strict";

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const menuToggle = document.getElementById("menuToggle");
const mobileMenu = document.getElementById("mobileMenu");


// =========================================
// SMOOTH SCROLL (Lenis)
// Skipped for visitors who prefer reduced motion.
// Touch devices keep their native, already-smooth scrolling.
// =========================================

let lenis = null;

if (typeof window.Lenis === "function" && !prefersReducedMotion) {
    lenis = new window.Lenis({
        duration: 1.2,
        easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true
    });

    const raf = time => {
        lenis.raf(time);
        requestAnimationFrame(raf);
    };

    requestAnimationFrame(raf);
}


// =========================================
// MOBILE MENU
// =========================================

if (menuToggle && mobileMenu) {

    const closeMenu = () => {
        mobileMenu.classList.remove("active");
        menuToggle.setAttribute("aria-expanded", "false");
        menuToggle.setAttribute("aria-label", "Open navigation menu");
    };

    menuToggle.addEventListener("click", () => {
        const isOpen = mobileMenu.classList.toggle("active");

        menuToggle.setAttribute("aria-expanded", String(isOpen));
        menuToggle.setAttribute(
            "aria-label",
            isOpen ? "Close navigation menu" : "Open navigation menu"
        );
    });

    // Close menu when a navigation link is clicked
    mobileMenu.querySelectorAll("a").forEach(link => {
        link.addEventListener("click", closeMenu);
    });

    // Close menu when the user presses Escape
    document.addEventListener("keydown", event => {
        if (event.key === "Escape") {
            closeMenu();
        }
    });
}


// =========================================
// ANCHOR NAVIGATION
// =========================================

document.querySelectorAll('a[href^="#"]').forEach(link => {

    link.addEventListener("click", event => {

        const href = link.getAttribute("href");

        if (!href || href === "#") {
            return;
        }

        const target = document.querySelector(href);

        if (!target) {
            return;
        }

        event.preventDefault();

        if (lenis) {
            lenis.scrollTo(target, { offset: 0, duration: 1.4 });
        } else {
            target.scrollIntoView({
                behavior: prefersReducedMotion ? "auto" : "smooth",
                block: "start"
            });
        }

        // Update the URL hash for navigation and browser history
        history.replaceState(null, "", href);
    });
});


// =========================================
// SCROLL REVEAL
// Fades and lifts content into place as it enters the screen.
// Classes are added here, so if JavaScript fails the page stays fully visible.
// =========================================

const REVEAL_SELECTORS = [
    ".impact-header > *", ".impact-card", ".impact-note",
    ".about-header > *", ".about-lead", ".about-story > p:not(.about-lead)",
    ".about-facts > div", ".about-funnel", ".funnel li",
    ".about-do article", ".about-toolkit > div",
    ".expertise-header > *", ".expertise-row",
    ".work-header > *", ".work-featured", ".work-card", ".work-agency",
    ".exp-header > *", ".exp-item",
    ".contact-header > *", ".contact-cta", ".contact-links li"
];

if (!prefersReducedMotion && "IntersectionObserver" in window) {

    const siblingCount = new Map();
    const revealItems = [];

    REVEAL_SELECTORS.forEach(selector => {
        document.querySelectorAll(selector).forEach(el => {
            if (el.classList.contains("reveal")) {
                return;
            }

            // Stagger siblings so groups appear one after another
            const index = siblingCount.get(el.parentElement) || 0;
            siblingCount.set(el.parentElement, index + 1);

            el.style.setProperty("--reveal-delay", Math.min(index, 5) * 90 + "ms");
            el.classList.add("reveal");
            revealItems.push(el);
        });
    });

    const revealObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) {
                return;
            }

            const el = entry.target;
            const delay = parseInt(el.style.getPropertyValue("--reveal-delay"), 10) || 0;

            el.classList.add("is-visible");
            revealObserver.unobserve(el);

            // Clean up so the element's own hover transitions work again
            setTimeout(() => {
                el.classList.remove("reveal", "is-visible");
                el.style.removeProperty("--reveal-delay");
            }, delay + 1100);
        });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });

    revealItems.forEach(el => revealObserver.observe(el));
}


// =========================================
// COUNT-UP NUMBERS (results strip + impact cards)
// Reads the number already in the HTML, so edit it there as usual.
// =========================================

if (!prefersReducedMotion && "IntersectionObserver" in window) {

    const counters = [];

    document.querySelectorAll(".result strong, .impact-card h3").forEach(el => {
        const original = el.textContent.trim();
        const target = parseInt(original.replace(/[^\d]/g, ""), 10);

        // Only animate real figures, not small labels like "01" or "06"
        if (!target || target < 20) {
            return;
        }

        const prefix = original.match(/^[^\d]*/)[0];
        el.textContent = prefix + "0";
        counters.push({ el, original, prefix, target });
    });

    const countObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) {
                return;
            }

            const counter = counters.find(c => c.el === entry.target);
            countObserver.unobserve(entry.target);

            const duration = 1600;
            const start = performance.now();

            const tick = now => {
                const progress = Math.min((now - start) / duration, 1);
                const eased = 1 - Math.pow(1 - progress, 3);

                counter.el.textContent = progress < 1
                    ? counter.prefix + Math.round(counter.target * eased).toLocaleString("en-IN")
                    : counter.original;

                if (progress < 1) {
                    requestAnimationFrame(tick);
                }
            };

            requestAnimationFrame(tick);
        });
    }, { threshold: 0.5 });

    counters.forEach(c => countObserver.observe(c.el));
}


// =========================================
// SCROLL PROGRESS BAR
// =========================================

if (!prefersReducedMotion) {

    const bar = document.createElement("div");
    bar.className = "scroll-progress";
    bar.setAttribute("aria-hidden", "true");
    document.body.appendChild(bar);

    let ticking = false;

    const updateProgress = () => {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        const progress = max > 0 ? window.scrollY / max : 0;

        bar.style.transform = "scaleX(" + Math.min(Math.max(progress, 0), 1) + ")";
        ticking = false;
    };

    window.addEventListener("scroll", () => {
        if (!ticking) {
            ticking = true;
            requestAnimationFrame(updateProgress);
        }
    }, { passive: true });

    updateProgress();
}


// =========================================
// ACTIVE NAV LINK (highlights the section you're reading)
// =========================================

if ("IntersectionObserver" in window) {

    const navLinks = document.querySelectorAll(".header-nav a");

    const spy = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) {
                return;
            }

            navLinks.forEach(link => {
                link.classList.toggle(
                    "is-active",
                    link.getAttribute("href") === "#" + entry.target.id
                );
            });
        });
    }, { rootMargin: "-40% 0px -55% 0px" });

    document.querySelectorAll("main section[id]").forEach(section => spy.observe(section));
}


// =========================================
// FLOATING WHATSAPP BUTTON
// Hidden while the Contact section is on screen,
// because the big WhatsApp button is already there.
// =========================================

const waFloat = document.querySelector(".wa-float");
const contactSection = document.getElementById("contact");

if (waFloat && contactSection && "IntersectionObserver" in window) {
    new IntersectionObserver(
        ([entry]) => waFloat.classList.toggle("is-hidden", entry.isIntersecting),
        { threshold: 0.35 }
    ).observe(contactSection);
}
