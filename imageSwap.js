document.addEventListener('DOMContentLoaded', () => {
    // Define the media query
    const mediaQuery = window.matchMedia('(max-width: 1024px)');

    // Select all images that have both data-desktop-src and data-mobile-src attributes
    // We are deliberately EXCLUDING the #animatedSvg here because its logic is handled by Animatedbgcolors.js
    const imagesToSwap = document.querySelectorAll('img[data-desktop-src][data-mobile-src]:not(#animatedSvg)');

    function swapImages(e) {
        imagesToSwap.forEach(img => {
            const desktopSrc = img.dataset.desktopSrc;
            const mobileSrc = img.dataset.mobileSrc;

            if (e.matches) {
                // If the media query matches (width <= 1024px), use mobile source
                if (mobileSrc) {
                    img.src = mobileSrc;
                }
            } else {
                // If the media query does not match (width > 1024px), use desktop source
                if (desktopSrc) {
                    img.src = desktopSrc;
                }
            }
        });
    }

    // Initial check when the page loads
    swapImages(mediaQuery);

    // Listen for changes in the media query (e.g., when the user resizes the window)
    mediaQuery.addListener(swapImages);
});