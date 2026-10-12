"use strict";

const menuToggle = document.getElementById("menuToggle");
const mobileMenu = document.getElementById("mobileMenu");


// =========================================
// MOBILE MENU
// =========================================

if (menuToggle && mobileMenu) {

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

        link.addEventListener("click", () => {
            mobileMenu.classList.remove("active");

            menuToggle.setAttribute("aria-expanded", "false");
            menuToggle.setAttribute("aria-label", "Open navigation menu");
        });

    });


    // Close menu when the user presses Escape

    document.addEventListener("keydown", event => {

        if (event.key === "Escape") {
            mobileMenu.classList.remove("active");

            menuToggle.setAttribute("aria-expanded", "false");
            menuToggle.setAttribute("aria-label", "Open navigation menu");
        }

    });

}


// =========================================
// SMOOTH NAVIGATION
// =========================================

document.querySelectorAll('a[href^="#"]').forEach(link => {

    link.addEventListener("click", event => {

        const href = link.getAttribute("href");

        if (!href || href === "#") {
            return;
        }

        const target = document.querySelector(href);

        if (target) {
            event.preventDefault();

            target.scrollIntoView({
                behavior: window.matchMedia(
                    "(prefers-reduced-motion: reduce)"
                ).matches ? "auto" : "smooth",
                block: "start"
            });

            // Update the URL hash for navigation and browser history
            history.replaceState(null, "", href);
        }

    });

});