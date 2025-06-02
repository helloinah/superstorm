document.addEventListener('DOMContentLoaded', async () => {
    // --- FROM bgcolor.js (Button references) ---
    const aboutBtn = document.getElementById('about_btn');
    const movementBtn = document.getElementById('movement_btn');
    const planBtn = document.getElementById('plan_btn');
    const feedbackBtn = document.getElementById('feedback_btn');

    // --- ANIMATION SETUP ---
    const animatedSvgImg = document.getElementById('animatedSvg'); // Original <img> element
    let animatedSvgWrapper = null;
    let currentInlineAnimatedSvg = null;

    // REFERENCE TO THE INLINE BACKGROUND SVG
    const svgBgElement = document.querySelector('.svg-bg'); // Select the inline background SVG

    // Define BOTH desktop and mobile image paths for the animated sequence
    const desktopImagePaths = [
        'img/mov_1.svg', 'img/mov_2.svg', 'img/mov_3.svg', 'img/mov_4.svg', 'img/mov_5.svg',
        'img/mov_6.svg', 'img/mov_7.svg', 'img/mov_8.svg', 'img/mov_9.svg', 'img/mov_10.svg',
        'img/mov_11.svg', 'img/mov_12.svg', 'img/mov_13.svg', 'img/mov_14.svg', 'img/mov_15.svg',
        'img/mov_16.svg', 'img/mov_17.svg', 'img/mov_18.svg', 'img/mov_19.svg', 'img/mov_20.svg'
    ];
    // Mobile paths using your "m_" prefix
    const mobileImagePaths = desktopImagePaths.map(path => {
        const parts = path.split('/');
        const filename = parts.pop(); // Get 'mov_1.svg'
        return `${parts.join('/')}/m_${filename}`; // Prepend 'm_' and rejoin path
    });
    // Add path for the static background SVG
    const desktopBgSvgPath = 'img/svg_bg.svg'; // Assuming this is the desktop path for your inline SVG background
    const mobileBgSvgPath = 'img/m_svg_bg.svg'; // Assuming your mobile static background SVG is named m_svg_bg.svg

    let currentAnimatedImagePaths = []; // This will hold the active set of paths for the animated SVG
    let currentBgSvgPath = ''; // This will hold the active path for the background SVG

    let currentIndex = 0;
    const frameDuration = 500; // 0.5 seconds per frame

    // Store preloaded SVG content (as text)
    const preloadedAnimatedSvgTexts = []; // Renamed for clarity for animated SVGs
    let preloadedBgSvgText = null; // To store the background SVG content

    const parser = new DOMParser();
    const serializer = new XMLSerializer();

    // Store the currently active color scheme for the animated SVG
    let currentAnimatedSvgTargetColors = [];
    let currentAnimatedSvgNewColor = '';

    let animationInterval; // To control the animation loop

    const mediaQueryForSVGs = window.matchMedia('(max-width: 1024px)'); // Use one media query for all SVG handling


    // --- Function to apply colors to a *single* SVG DOM element ---
    const applyColorsToSingleSvg = (svgElement, targetColors, newColor) => {
        if (!svgElement || !targetColors.length || !newColor) return svgElement;

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


    // --- Preload all SVG contents ---
    const preloadAllSvgs = async (pathsToLoad) => {
        preloadedAnimatedSvgTexts.length = 0; // Clear previous preloaded SVGs for animation
        const fetchPromises = pathsToLoad.map(async (path) => {
            try {
                const response = await fetch(path);
                if (!response.ok) throw new Error(`HTTP error! Status: ${response.status} - ${path}`);
                return await response.text();
            } catch (error) {
                console.error(`Error preloading SVG ${path}:`, error);
                return null;
            }
        });
        const results = await Promise.all(fetchPromises);
        preloadedAnimatedSvgTexts.push(...results.filter(text => text !== null));
    };

    // --- Preload the static background SVG ---
    const preloadBgSvg = async (path) => {
        try {
            const response = await fetch(path);
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status} - ${path}`);
            preloadedBgSvgText = await response.text();
        } catch (error) {
            console.error(`Error preloading background SVG ${path}:`, error);
            preloadedBgSvgText = null;
        }
    };


    // --- Initial conversion/update of animatedSvg from <img> to inline <svg> ---
    const convertAnimatedSvgToInline = async (initialSvgText) => {
        if (!animatedSvgImg && !animatedSvgWrapper) { // Check if the img or wrapper exists
            console.error("Animated SVG element not found.");
            return;
        }

        if (!initialSvgText) {
            console.error("Initial SVG text for animated SVG is missing.");
            return;
        }

        try {
            const svgDoc = parser.parseFromString(initialSvgText, 'image/svg+xml');
            let initialSvgElement = svgDoc.documentElement;

            if (animatedSvgWrapper) {
                // If wrapper already exists, just update its content and attributes
                animatedSvgWrapper.innerHTML = serializer.serializeToString(applyColorsToSingleSvg(initialSvgElement.cloneNode(true), currentAnimatedSvgTargetColors, currentAnimatedSvgNewColor));
                Array.from(initialSvgElement.attributes).forEach(attr => {
                    animatedSvgWrapper.querySelector('svg').setAttribute(attr.name, attr.value);
                });
            } else {
                // Create wrapper and replace <img> if it's the first time
                animatedSvgWrapper = document.createElement('div');
                animatedSvgWrapper.classList.add('dynamic-svg-wrapper');
                animatedSvgWrapper.classList.add('animated-svg-wrapper');

                const computedStyle = getComputedStyle(animatedSvgImg);
                animatedSvgWrapper.style.width = computedStyle.width;
                animatedSvgWrapper.style.height = computedStyle.height;
                animatedSvgWrapper.style.margin = computedStyle.margin;
                animatedSvgWrapper.style.padding = computedStyle.padding;
                animatedSvgWrapper.style.float = computedStyle.float;
                animatedSvgWrapper.style.display = computedStyle.display;
                animatedSvgWrapper.style.verticalAlign = computedStyle.verticalAlign;
                animatedSvgWrapper.style.position = computedStyle.position;
                animatedSvgWrapper.style.top = computedStyle.top;
                animatedSvgWrapper.style.left = computedStyle.left;

                animatedSvgWrapper.innerHTML = serializer.serializeToString(applyColorsToSingleSvg(initialSvgElement.cloneNode(true), currentAnimatedSvgTargetColors, currentAnimatedSvgNewColor));

                animatedSvgImg.parentNode.replaceChild(animatedSvgWrapper, animatedSvgImg);
            }
            currentInlineAnimatedSvg = animatedSvgWrapper.querySelector('svg');

        } catch (error) {
            console.error('Error converting animated SVG to inline or updating:', error);
        }
    };

    // --- Update the static background SVG content ---
    const updateBgSvgContent = async (svgText) => {
        if (!svgBgElement || !svgText) {
            console.error("Background SVG element not found or SVG text missing.");
            return;
        }
        try {
            const svgDoc = parser.parseFromString(svgText, 'image/svg+xml');
            let newBgSvgElement = svgDoc.documentElement;

            // Preserve original viewBox and other attributes if the mobile SVG is different
            // Or ensure the mobile SVG has the same viewBox.
            // For simplicity, we'll just update innerHTML and attributes from the new SVG.
            svgBgElement.innerHTML = newBgSvgElement.innerHTML;
            Array.from(newBgSvgElement.attributes).forEach(attr => {
                // Only copy attributes that are not already set by CSS or are critical (like viewBox)
                if (attr.name !== 'class' && attr.name !== 'style') {
                    svgBgElement.setAttribute(attr.name, attr.value);
                }
            });
            // Reapply current active colors if any are set
            applyColorsToSingleSvg(svgBgElement, currentAnimatedSvgTargetColors, currentAnimatedSvgNewColor);

        } catch (error) {
            console.error('Error updating background SVG content:', error);
        }
    };

    // --- Animation loop: Swap inline SVG content ---
    function showNextFrame() {
        if (!currentInlineAnimatedSvg || preloadedAnimatedSvgTexts.length === 0) return;

        currentIndex = (currentIndex + 1) % preloadedAnimatedSvgTexts.length;
        const nextSvgText = preloadedAnimatedSvgTexts[currentIndex];

        if (nextSvgText) {
            const nextSvgDoc = parser.parseFromString(nextSvgText, 'image/svg+xml');
            let nextSvgElement = nextSvgDoc.documentElement;

            // Apply current active colors to the new frame before displaying it
            nextSvgElement = applyColorsToSingleSvg(nextSvgElement, currentAnimatedSvgTargetColors, currentAnimatedSvgNewColor);

            // Replace the content of the existing inline <svg>
            currentInlineAnimatedSvg.innerHTML = nextSvgElement.innerHTML;
            // Copy attributes like viewBox, width, height from the new SVG
            Array.from(nextSvgElement.attributes).forEach(attr => {
                currentInlineAnimatedSvg.setAttribute(attr.name, attr.value);
            });
        }
    }


    // --- updateSvgColors: Now applies colors to all inline SVGs, including background ---
    const updateSvgColors = async (targetColors, newColor) => {
        // Store the new color scheme so subsequent animation frames also get colored
        currentAnimatedSvgTargetColors = targetColors;
        currentAnimatedSvgNewColor = newColor;

        // Apply color changes to the animated SVG (if it exists and is inline)
        if (currentInlineAnimatedSvg) {
            applyColorsToSingleSvg(currentInlineAnimatedSvg, targetColors, newColor);
        }

        // Apply color changes to the static background SVG (if it exists)
        if (svgBgElement) { //
            applyColorsToSingleSvg(svgBgElement, targetColors, newColor); //
        }

        // --- Step 1: Process any *other* <img> tags with SVG sources that haven't been converted yet ---
        // EXCLUDE the animated SVG <img> element
        const imgSvgElements = document.querySelectorAll('img[src$=".svg"]:not(#animatedSvg)');

        for (const img of imgSvgElements) {
            // Check if it's already converted and wrapped by a dynamic-svg-wrapper
            if (!img.parentNode.classList.contains('dynamic-svg-wrapper')) { // Ensure we don't re-process already converted ones
                try {
                    const response = await fetch(img.src);
                    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status} - ${img.src}`);
                    const svgText = await response.text();
                    const svgDoc = parser.parseFromString(svgText, 'image/svg+xml');
                    let modifiedSvgElement = svgDoc.documentElement;

                    // Apply colors to the fetched SVG before inserting
                    modifiedSvgElement = applyColorsToSingleSvg(modifiedSvgElement, targetColors, newColor); //

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
            } else {
                // If it's already a wrapper, find its SVG and apply colors directly
                const inlineSvg = img.parentNode.querySelector('svg');
                if (inlineSvg) {
                    applyColorsToSingleSvg(inlineSvg, targetColors, newColor);
                }
            }
        }
    };


    // --- Main handler for SVG source and content swapping based on media query ---
    async function handleAllSvgSourceSwap(e) {
        // Handle Animated SVGs (mov_X.svg)
        if (e.matches) {
            currentAnimatedImagePaths = mobileImagePaths;
            currentBgSvgPath = mobileBgSvgPath; // Set mobile background SVG path
            console.log("Loading mobile animated SVGs and background SVG...");
        } else {
            currentAnimatedImagePaths = desktopImagePaths;
            currentBgSvgPath = desktopBgSvgPath; // Set desktop background SVG path
            console.log("Loading desktop animated SVGs and background SVG...");
        }

        // Stop current animation
        clearInterval(animationInterval);
        currentIndex = 0; // Reset index for new set of images

        // Preload the new set of animated images
        await preloadAllSvgs(currentAnimatedImagePaths);
        // Preload the new static background SVG
        await preloadBgSvg(currentBgSvgPath); //

        // Update the animated SVG display
        if (preloadedAnimatedSvgTexts.length > 0) {
            await convertAnimatedSvgToInline(preloadedAnimatedSvgTexts[0]);
            animationInterval = setInterval(showNextFrame, frameDuration);
        } else {
            console.error("Failed to preload any animated SVGs.");
        }

        // Update the static background SVG content
        if (preloadedBgSvgText) { //
            await updateBgSvgContent(preloadedBgSvgText); //
        } else {
            console.error("Failed to preload background SVG content.");
        }

        // Reapply current colors after source swap, ensuring all SVGs are colored correctly
        if (currentAnimatedSvgTargetColors.length > 0) {
            updateSvgColors(currentAnimatedSvgTargetColors, currentAnimatedSvgNewColor);
        }
    }


    // --- Initial Setup Execution ---
    // Listen for changes in the media query for all SVGs
    mediaQueryForSVGs.addListener(handleAllSvgSourceSwap);
    // Initial check for all SVGs
    await handleAllSvgSourceSwap(mediaQueryForSVGs);

    // Initial load for other non-animated <img> SVGs is now done by updateSvgColors directly
    // Call updateSvgColors with initial default colors if needed, or rely on button clicks
    // Example: To set initial colors to the "about" scheme
    // updateSvgColors(['#F5F5FA', '#46B4FF', '#8C8C96', '#F5FF00'], '#8C8C96'); // Uncomment if you want an initial color scheme


    // --- Button Click Events (same as your original) ---
    if (aboutBtn) {
        aboutBtn.addEventListener('click', () => {
            document.documentElement.style.setProperty('--SS-white', 'var(--SS-grey)');
            const targetColors = ['#F5F5FA', '#46B4FF', '#8C8C96', '#F5FF00'];
            const newColor = '#8C8C96';
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
});