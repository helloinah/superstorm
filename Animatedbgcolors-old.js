document.addEventListener('DOMContentLoaded', async () => { // Made async for initial fetch

    // --- FROM bgcolor.js (Button references) ---
    const aboutBtn = document.getElementById('about_btn');
    const movementBtn = document.getElementById('movement_btn');
    const planBtn = document.getElementById('plan_btn');
    const feedbackBtn = document.getElementById('feedback_btn');

    // --- ANIMATION SETUP ---
    const animatedSvgImg = document.getElementById('animatedSvg'); // Original <img> element
    let animatedSvgWrapper = null; // This will hold the div containing the inline <svg>
    let currentInlineAnimatedSvg = null; // This will hold the actual inline <svg> element itself

    const imagePaths = [
        'img/mov_1.svg', 'img/mov_2.svg', 'img/mov_3.svg', 'img/mov_4.svg', 'img/mov_5.svg',
        'img/mov_6.svg', 'img/mov_7.svg', 'img/mov_8.svg', 'img/mov_9.svg', 'img/mov_10.svg',
        'img/mov_11.svg', 'img/mov_12.svg', 'img/mov_13.svg', 'img/mov_14.svg', 'img/mov_15.svg',
        'img/mov_16.svg', 'img/mov_17.svg', 'img/mov_18.svg', 'img/mov_19.svg', 'img/mov_20.svg'
    ];

    let currentIndex = 0;
    const frameDuration = 500; // 0.5 seconds per frame

    // Store preloaded SVG content (as text)
    const preloadedSvgTexts = [];
    const parser = new DOMParser();
    const serializer = new XMLSerializer();

    // Store the currently active color scheme for the animated SVG
    let currentAnimatedSvgTargetColors = [];
    let currentAnimatedSvgNewColor = '';

    // --- Function to apply colors to a *single* SVG DOM element ---
    const applyColorsToSingleSvg = (svgElement, targetColors, newColor) => {
        if (!svgElement || !targetColors.length || !newColor) return;

        let internalSelectorParts = [];
        targetColors.forEach(color => {
            internalSelectorParts.push(`[fill="${color}"]`);
            internalSelectorParts.push(`[stroke="${color}"]`);
        });
        const combinedInternalSelector = internalSelectorParts.join(', ');

        const elementsToChange = svgElement.querySelectorAll(combinedInternalSelector);

        elementsToChange.forEach(el => {
            const currentFill = el.getAttribute('fill');
            const currentStroke = el.getAttribute('stroke');

            if (currentFill && targetColors.includes(currentFill)) {
                el.setAttribute('fill', newColor);
            }
            if (currentStroke && targetColors.includes(currentStroke)) {
                el.setAttribute('stroke', newColor);
            }
        });
        return svgElement; // Return the modified SVG DOM element
    };


    // --- 1. Preload all SVG contents ---
    // This is crucial to avoid flickering when swapping frames
    const preloadAllSvgs = async () => {
        const fetchPromises = imagePaths.map(async (path) => {
            try {
                const response = await fetch(path);
                if (!response.ok) throw new Error(`HTTP error! Status: ${response.status} - ${path}`);
                return await response.text();
            } catch (error) {
                console.error(`Error preloading SVG ${path}:`, error);
                return null; // Return null for failed fetches
            }
        });
        const results = await Promise.all(fetchPromises);
        preloadedSvgTexts.push(...results.filter(text => text !== null)); // Filter out any failed loads
    };

    // --- 2. Initial conversion of animatedSvg from <img> to inline <svg> ---
    const convertAnimatedSvgToInline = async () => {
        if (!animatedSvgImg || preloadedSvgTexts.length === 0) {
            console.error("Animated SVG <img> not found or SVGs not preloaded.");
            return;
        }

        try {
            const initialSvgText = preloadedSvgTexts[0]; // Use the first preloaded SVG
            const svgDoc = parser.parseFromString(initialSvgText, 'image/svg+xml');
            const initialSvgElement = svgDoc.documentElement;

            animatedSvgWrapper = document.createElement('div');
            animatedSvgWrapper.classList.add('dynamic-svg-wrapper'); // Add a class for easy selection
            animatedSvgWrapper.classList.add('animated-svg-wrapper'); // Specific class for this one

            // Copy computed styles from the original <img> to the new wrapper
            const computedStyle = getComputedStyle(animatedSvgImg);
            animatedSvgWrapper.style.width = computedStyle.width;
            animatedSvgWrapper.style.height = computedStyle.height;
            animatedSvgWrapper.style.margin = computedStyle.margin;
            animatedSvgWrapper.style.padding = computedStyle.padding;
            animatedSvgWrapper.style.float = computedStyle.float;
            animatedSvgWrapper.style.display = computedStyle.display;
            animatedSvgWrapper.style.verticalAlign = computedStyle.verticalAlign;
            animatedSvgWrapper.style.position = computedStyle.position; // Crucial for absolute positioning
            animatedSvgWrapper.style.top = computedStyle.top;
            animatedSvgWrapper.style.left = computedStyle.left;

            // Apply current active colors to the initial SVG frame
            let coloredInitialSvg = initialSvgElement.cloneNode(true); // Clone to avoid modifying original preloaded text
            if (currentAnimatedSvgTargetColors.length && currentAnimatedSvgNewColor) {
                 coloredInitialSvg = applyColorsToSingleSvg(coloredInitialSvg, currentAnimatedSvgTargetColors, currentAnimatedSvgNewColor);
            }
            animatedSvgWrapper.innerHTML = serializer.serializeToString(coloredInitialSvg);

            // Replace the original <img> with the new wrapper div containing the inline SVG
            animatedSvgImg.parentNode.replaceChild(animatedSvgWrapper, animatedSvgImg);
            currentInlineAnimatedSvg = animatedSvgWrapper.querySelector('svg');

        } catch (error) {
            console.error('Error converting animated SVG <img> to inline:', error);
        }
    };


    // --- 3. Animation loop: Swap inline SVG content ---
    function showNextFrame() {
        if (!currentInlineAnimatedSvg || preloadedSvgTexts.length === 0) return;

        currentIndex = (currentIndex + 1) % preloadedSvgTexts.length;
        const nextSvgText = preloadedSvgTexts[currentIndex];

        if (nextSvgText) {
            const nextSvgDoc = parser.parseFromString(nextSvgText, 'image/svg+xml');
            let nextSvgElement = nextSvgDoc.documentElement;

            // Apply current active colors to the new frame before displaying it
            if (currentAnimatedSvgTargetColors.length && currentAnimatedSvgNewColor) {
                nextSvgElement = applyColorsToSingleSvg(nextSvgElement, currentAnimatedSvgTargetColors, currentAnimatedSvgNewColor);
            }

            // Replace the content of the existing inline <svg>
            currentInlineAnimatedSvg.innerHTML = nextSvgElement.innerHTML;
            // Copy attributes like viewBox, width, height from the new SVG
            Array.from(nextSvgElement.attributes).forEach(attr => {
                currentInlineAnimatedSvg.setAttribute(attr.name, attr.value);
            });
        }
    }


    // --- 4. updateSvgColors: Now only deals with inline SVGs, and reapplies colors to animated SVG ---
    const updateSvgColors = async (targetColors, newColor) => {
        // --- Step 1: Process any *other* <img> tags with SVG sources that haven't been converted yet ---
        // EXCLUDE the animated SVG <img> element
        const imgSvgElements = document.querySelectorAll('img[src$=".svg"]:not(#animatedSvg)'); // Use ID for precise exclusion

        for (const img of imgSvgElements) {
            try {
                const response = await fetch(img.src);
                if (!response.ok) throw new Error(`HTTP error! Status: ${response.status} - ${img.src}`);
                const svgText = await response.text();
                const svgDoc = parser.parseFromString(svgText, 'image/svg+xml');
                const modifiedSvgElement = svgDoc.documentElement;

                const inlineSvgWrapper = document.createElement('div');
                inlineSvgWrapper.classList.add('dynamic-svg-wrapper');
                inlineSvgWrapper.innerHTML = serializer.serializeToString(modifiedSvgElement);

                const computedStyle = getComputedStyle(img);
                inlineSvgWrapper.style.width = computedStyle.width;
                inlineSvgWrapper.style.height = computedStyle.height;
                inlineSvgWrapper.style.margin = computedStyle.margin;
                inlineSvgWrapper.style.padding = computedStyle.padding;
                inlineSvgWrapper.style.float = computedStyle.float;
                inlineSvgWrapper.style.display = computedStyle.display;
                inlineSvgWrapper.style.verticalAlign = computedStyle.verticalAlign;

                img.parentNode.replaceChild(inlineSvgWrapper, img);

            } catch (error) {
                console.error('Error fetching or processing other SVG from <img>:', error);
            }
        }

        // --- Step 2: Apply color changes to all accessible <svg> elements ---
        // Target all inline SVGs, including the animated one (if it's ready)
        const allSvgElementsInDOM = document.querySelectorAll('.dynamic-svg-wrapper > svg, svg:not(.dynamic-svg-wrapper svg)'); // This should select all inline SVGs now

        allSvgElementsInDOM.forEach(svgEl => {
            applyColorsToSingleSvg(svgEl, targetColors, newColor);
        });

        // Store the new color scheme so subsequent animation frames also get colored
        currentAnimatedSvgTargetColors = targetColors;
        currentAnimatedSvgNewColor = newColor;

        // Manually re-color the current animated SVG frame if it's already an inline SVG
        // This handles cases where a color button is clicked while the animation is running.
        if (currentInlineAnimatedSvg) {
            applyColorsToSingleSvg(currentInlineAnimatedSvg, targetColors, newColor);
        }
    };


    // --- Initial Setup Execution ---
    await preloadAllSvgs(); // Wait for all SVGs to be preloaded
    await convertAnimatedSvgToInline(); // Convert the initial animated SVG to inline

    // Start the animation loop ONLY AFTER initial conversion
    if (currentInlineAnimatedSvg) {
        setInterval(showNextFrame, frameDuration);
    }


    // --- Button Click Events ---
    if (aboutBtn) {
        aboutBtn.addEventListener('click', () => {
            document.documentElement.style.setProperty('--SS-white', 'var(--SS-grey)');
            const targetColors = ['#F5F5FA', '#46B4FF', '#8C8C96', '#F5FF00']; // Example target colors
            const newColor = '#8C8C96'; // Example new color
            updateSvgColors(targetColors, newColor);
        });
    } else { console.error("Div with ID 'about_btn' not found."); }

    if (movementBtn) {
        movementBtn.addEventListener('click', () => {
            document.documentElement.style.setProperty('--SS-white', 'var(--SS-sky)');
            const targetColors = ['#F5F5FA', '#F5FF00', '#8C8C96', '#46B4FF'];
            const newColor = '#46B4FF';
            updateSvgColors(targetColors, newColor);
        });
    } else { console.error("Div with ID 'movement_btn' not found."); }

    if (planBtn) {
        planBtn.addEventListener('click', () => {
            document.documentElement.style.setProperty('--SS-white', 'var(--SS-thunder)');
            const targetColors = ['#F5F5FA', '#46B4FF', '#8C8C96', '#F5FF00'];
            const newColor = '#F5FF00';
            updateSvgColors(targetColors, newColor);
        });
    } else { console.error("Div with ID 'plan_btn' not found."); }

    // Feedback Button (still commented out as in original)
    // if (feedbackBtn) {
    //     feedbackBtn.addEventListener('click', () => {
    //         document.documentElement.style.setProperty('--SS-white', 'var(--SS-light-grey)');
    //         const targetColors = ['#F5F5FA', '#46B4FF', '#8C8C96', '#F5FF00'];
    //         const newColor = '#F5F5FA';
    //         updateSvgColors(targetColors, newColor);
    //     });
    // } else { console.error("Div with ID 'feedback_btn' not found."); }
});