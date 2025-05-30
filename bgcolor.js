document.addEventListener('DOMContentLoaded', () => {
    // Get the div elements you want to click
    const aboutBtn = document.getElementById('about_btn');
    const movementBtn = document.getElementById('movement_btn');
    const planBtn = document.getElementById('plan_btn');
    const feedbackBtn = document.getElementById('feedback_btn');

    /**
     * Updates the fill and stroke colors of SVG elements in the DOM.
     * This function first converts any remaining <img> tags with SVG sources
     * into inline SVGs, then applies color changes to all accessible <svg> elements.
     * @param {string[]} targetColors - An array of hex color strings to search for.
     * @param {string} newColor - The hex color string to change matching colors to.
     */
    const updateSvgColors = async (targetColors, newColor) => {
        // --- Step 1: Process any <img> tags with SVG sources that haven't been converted yet ---
        const imgSvgElements = document.querySelectorAll('img[src$=".svg"]');

        for (const img of imgSvgElements) {
            try {
                const response = await fetch(img.src);
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status} - ${img.src}`);
                }
                const svgText = await response.text();
                const parser = new DOMParser();
                const svgDoc = parser.parseFromString(svgText, 'image/svg+xml');

                // Get the root <svg> element from the parsed document
                const modifiedSvgElement = svgDoc.documentElement;

                // Create a wrapper div for the inline SVG
                const inlineSvgWrapper = document.createElement('div');
                inlineSvgWrapper.classList.add('dynamic-svg-wrapper'); // Add a class for easy selection later
                inlineSvgWrapper.innerHTML = new XMLSerializer().serializeToString(modifiedSvgElement);

                // --- IMPORTANT CHANGE HERE: Copy computed styles ---
                const computedStyle = getComputedStyle(img);

                // Copy relevant box model and positioning styles
                inlineSvgWrapper.style.width = computedStyle.width;
                inlineSvgWrapper.style.height = computedStyle.height;
                inlineSvgWrapper.style.margin = computedStyle.margin;
                inlineSvgWrapper.style.padding = computedStyle.padding;
                inlineSvgWrapper.style.float = computedStyle.float;
                inlineSvgWrapper.style.display = computedStyle.display;
                inlineSvgWrapper.style.verticalAlign = computedStyle.verticalAlign; // Often relevant for images

                // If you want to copy all computed styles, you can loop through them,
                // but it's generally better to be selective to avoid unintended side effects.
                // for (const prop of computedStyle) {
                //     inlineSvgWrapper.style[prop] = computedStyle[prop];
                // }


                // Replace the original <img> with the new wrapper div containing the inline SVG
                img.parentNode.replaceChild(inlineSvgWrapper, img);

            } catch (error) {
                console.error('Error fetching or processing SVG from <img>:', error);
            }
        }

        // --- Step 2: Now, target all actual <svg> elements in the DOM and apply color changes ---
        // Select all <svg> elements that are direct children of our new wrapper class,
        // or any other top-level <svg> elements that might exist.
        const allSvgElementsInDOM = document.querySelectorAll('.dynamic-svg-wrapper > svg, svg:not(.dynamic-svg-wrapper svg)');

        // Build the selector for the internal elements of the SVG based on targetColors
        let internalSelectorParts = [];
        targetColors.forEach(color => {
            internalSelectorParts.push(`[fill="${color}"]`);
            internalSelectorParts.push(`[stroke="${color}"]`);
        });
        const combinedInternalSelector = internalSelectorParts.join(', ');

        allSvgElementsInDOM.forEach(svgEl => { // 'svgEl' is now the actual <svg> DOM element
            const elementsToChange = svgEl.querySelectorAll(combinedInternalSelector);

            elementsToChange.forEach(el => {
                const currentFill = el.getAttribute('fill');
                const currentStroke = el.getAttribute('stroke');

                // Change fill color if it matches any of the target colors
                if (currentFill && targetColors.includes(currentFill)) {
                    el.setAttribute('fill', newColor);
                }
                // Change stroke color if it matches any of the target colors
                if (currentStroke && targetColors.includes(currentStroke)) {
                    el.setAttribute('stroke', newColor);
                }
            });
        });
    };

    // --- About Button Click Event ---
    if (aboutBtn) {
        aboutBtn.addEventListener('click', () => {
            // Change --SS-white value to --SS-grey
            document.documentElement.style.setProperty('--SS-white', 'var(--SS-grey)');

            // Define colors for About button's SVG changes
            const targetColors = ['#F5F5FA', '#46B4FF', '#8C8C96', '#F5FF00'];
            const newColor = '#8C8C96';

            updateSvgColors(targetColors, newColor);
        });
    } else {
        console.error("Div with ID 'about_btn' not found.");
    }

    // --- Movement Button Click Event ---
    if (movementBtn) {
        movementBtn.addEventListener('click', () => {
            // Change --SS-white value to --SS-sky
            document.documentElement.style.setProperty('--SS-white', 'var(--SS-sky)');

            // Define colors for Movement button's SVG changes
            const targetColors = ['#F5F5FA', '#F5FF00', '#8C8C96', '#46B4FF'];
            const newColor = '#46B4FF';

            updateSvgColors(targetColors, newColor);
        });
    } else {
        console.error("Div with ID 'movement_btn' not found.");
    }

    // --- Plan Button Click Event ---
    if (planBtn) {
        planBtn.addEventListener('click', () => {
            // Change --SS-white value to --SS-thunder
            document.documentElement.style.setProperty('--SS-white', 'var(--SS-thunder)');

            // Define colors for Plan button's SVG changes
            const targetColors = ['#F5F5FA', '#46B4FF', '#8C8C96', '#F5FF00'];
            const newColor = '#F5FF00';

            updateSvgColors(targetColors, newColor);
        });
    } else {
        console.error("Div with ID 'plan_btn' not found.");
    }

    // --- Feedback Button Click Event (commented out in your original code) ---
    // if (feedbackBtn) {
    //     feedbackBtn.addEventListener('click', () => {
    //         document.documentElement.style.setProperty('--SS-white', 'var(--SS-light-grey)');
    //         const targetColors = ['#F5F5FA', '#46B4FF', '#8C8C96', '#F5FF00'];
    //         const newColor = '#F5F5FA';
    //         updateSvgColors(targetColors, newColor);
    //     });
    // } else {
    //     console.error("Div with ID 'feedback_btn' not found.");
    // }
});