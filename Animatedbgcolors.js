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
    console.log('svgBgElement found:', svgBgElement); // Diagnostic log

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
        console.log('Preloaded animated SVG texts length:', preloadedAnimatedSvgTexts.length); // Diagnostic log
    };

    // --- Preload the static background SVG ---
    const preloadBgSvg = async (path) => {
        console.log('Preloading background SVG from path:', path); // Diagnostic log
        try {
            const response = await fetch(path);
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status} - ${path}`);
            preloadedBgSvgText = await response.text();
            console.log('Background SVG preloaded successfully. Text length:', preloadedBgSvgText ? preloadedBgSvgText.length : 0); // Diagnostic log
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
            console.log('Animated SVG converted to inline:', currentInlineAnimatedSvg); // Diagnostic log

        } catch (error) {
            console.error('Error converting animated SVG to inline or updating:', error);
        }
    };

    // --- Update the static background SVG content ---
    const updateBgSvgContent = async (svgText) => {
        if (!svgBgElement || !svgText) {
            console.error("Background SVG element not found or SVG text missing during update.");
            return;
        }
        console.log('Updating background SVG content. Text length:', svgText.length); // Diagnostic log
        try {
            const svgDoc = parser.parseFromString(svgText, 'image/svg+xml');
            let newBgSvgElement = svgDoc.documentElement;

            // Clear existing children of svgBgElement
            while (svgBgElement.firstChild) {
                svgBgElement.removeChild(svgBgElement.firstChild);
            }
            console.log('Existing background SVG children cleared.'); // Diagnostic log

            // Append children from the new SVG content
            // Using importNode to ensure elements are correctly owned by the document
            Array.from(newBgSvgElement.children).forEach(child => {
                const importedChild = document.importNode(child, true); // true for deep clone
                svgBgElement.appendChild(importedChild);
            });
            console.log('New background SVG children appended.'); // Diagnostic log

            // Copy attributes from newBgSvgElement to svgBgElement
            Array.from(newBgSvgElement.attributes).forEach(attr => {
                // Ensure xmlns is copied if necessary for IE/older browsers, though usually handled by importNode
                if (attr.name !== 'class' && attr.name !== 'style') {
                    svgBgElement.setAttribute(attr.name, attr.value);
                }
            });
            console.log('Background SVG attributes updated.'); // Diagnostic log

            // Reapply colors
            applyColorsToSingleSvg(svgBgElement, currentAnimatedSvgTargetColors, currentAnimatedSvgNewColor);
            console.log('Background SVG colors reapplied.'); // Diagnostic log

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

    // --- NEW: Function to handle initial conversion of other <img> SVGs to inline ---
    const convertOtherImageSvgsToInline = async (targetColors, newColor) => {
        const imgSvgElementsToConvert = document.querySelectorAll('img[src$=".svg"]:not(#animatedSvg)');

        for (const img of imgSvgElementsToConvert) {
            // Only convert if it hasn't been converted already
            if (!img.parentNode.classList.contains('dynamic-svg-wrapper')) {
                try {
                    const response = await fetch(img.src);
                    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status} - ${img.src}`);
                    const svgText = await response.text();
                    const svgDoc = parser.parseFromString(svgText, 'image/svg+xml');
                    let modifiedSvgElement = svgDoc.documentElement;

                    // Apply current colors during initial conversion
                    if (targetColors && targetColors.length > 0 && newColor) {
                        modifiedSvgElement = applyColorsToSingleSvg(modifiedSvgElement, targetColors, newColor);
                    }

                    const inlineSvgWrapper = document.createElement('div');
                    inlineSvgWrapper.classList.add('dynamic-svg-wrapper');
                    inlineSvgWrapper.innerHTML = serializer.serializeToString(modifiedSvgElement);

                    // Copy computed styles from the original <img> to the new wrapper
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
        }
    };

    // --- updateSvgColors: Now only applies colors to already inline SVGs ---
    const updateSvgColors = async (targetColors, newColor) => {
        // Store the new color scheme so subsequent animation frames also get colored
        currentAnimatedSvgTargetColors = targetColors;
        currentAnimatedSvgNewColor = newColor;

        // Apply color changes to the animated SVG (if it exists and is inline)
        if (currentInlineAnimatedSvg) {
            applyColorsToSingleSvg(currentInlineAnimatedSvg, targetColors, newColor);
        }

        // Apply color changes to the static background SVG (if it exists)
        if (svgBgElement) {
            applyColorsToSingleSvg(svgBgElement, targetColors, newColor);
        }

        // Apply color changes to ALL other inlined SVGs that were originally <img> tags
        // These will now be <svg> elements inside a .dynamic-svg-wrapper (excluding animatedSvgWrapper)
        const otherInlinedSvgs = document.querySelectorAll('.dynamic-svg-wrapper > svg:not(.animated-svg-wrapper > svg)');

        otherInlinedSvgs.forEach(svgEl => {
            applyColorsToSingleSvg(svgEl, targetColors, newColor);
        });
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
        await preloadBgSvg(currentBgSvgPath);

        // Update the animated SVG display
        if (preloadedAnimatedSvgTexts.length > 0) {
            await convertAnimatedSvgToInline(preloadedAnimatedSvgTexts[0]);
            animationInterval = setInterval(showNextFrame, frameDuration);
            console.log('Animation interval started.'); // Diagnostic log
        } else {
            console.error("Failed to preload any animated SVGs. Animation will not start."); // Modified error message
        }

        // Update the static background SVG content
        if (preloadedBgSvgText) {
            await updateBgSvgContent(preloadedBgSvgText);
        } else {
            console.error("Failed to preload background SVG content.");
        }

        // NEW: Convert any remaining <img> SVGs to inline and recolor them
        // This ensures they are inlined once during initial setup or media query change
        await convertOtherImageSvgsToInline(currentAnimatedSvgTargetColors, currentAnimatedSvgNewColor);

        // Reapply current colors to ensure all SVGs are colored correctly
        // This call will now only operate on already inlined SVGs.
        if (currentAnimatedSvgTargetColors.length > 0) {
            updateSvgColors(currentAnimatedSvgTargetColors, currentAnimatedSvgNewColor);
        }
    }


    // --- Initial Setup Execution ---
    // Listen for changes in the media query for all SVGs
    mediaQueryForSVGs.addListener(handleAllSvgSourceSwap);
    // Initial check for all SVGs
    await handleAllSvgSourceSwap(mediaQueryForSVGs);


    // --- Button Click Events ---
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

    // --- NEW: Scroll-triggered Color Transformations ---

    // Define color schemes for scroll triggers, mapping element IDs to their themes
    // These themes should ideally match the button click themes for consistency.
    // Ensure you have a CSS variable for '--SS-yellow' or use an existing one for 'feedback_btn'.
    const scrollColorSchemes = {
        'about': { // Assumed scroll target element ID from index.html
            cssVar: 'var(--SS-grey)',
            targetColors: ['#F5F5FA', '#46B4FF', '#8C8C96', '#F5FF00'],
            newColor: '#8C8C96'
        },
        'movement': { // Assumed scroll target element ID from index.html
            cssVar: 'var(--SS-sky)',
            targetColors: ['#F5F5FA', '#F5FF00', '#8C8C96', '#46B4FF'],
            newColor: '#46B4FF'
        },
        'plan': { // Assumed scroll target element ID from index.html
            cssVar: 'var(--SS-thunder)',
            targetColors: ['#F5F5FA', '#46B4FF', '#8C8C96', '#F5FF00'],
            newColor: '#F5FF00'
        },
        'feedback': { // Added feedback section to scroll triggers based on index.html
            cssVar: 'rgba(245, 245, 250, 1)', // Example: using a dummy color, define in CSS or choose existing
            targetColors: ['#F5F5FA', '#46B4FF', '#8C8C96', '#F5FF00'],
            newColor: '#F5FF00' // Example: using a dummy color
        }
    };

    // Select all target elements for observation
    const scrollTriggerElements = [];
    for (const id in scrollColorSchemes) {
        const el = document.getElementById(id);
        if (el) {
            scrollTriggerElements.push(el);
        } else {
            console.warn(`Scroll trigger element with ID '${id}' not found. Please ensure this ID exists in your HTML for scroll effects.`);
        }
    }

    // Intersection Observer setup
    const observerOptions = {
        root: null, // viewport as the root
        rootMargin: '0px', // No margin around the root
        threshold: 0.5 // Trigger when 50% of the element is visible
    };

    let activeColorSchemeIdOnScroll = null; // To track the currently active scheme from scroll

    const observerCallback = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const schemeId = entry.target.id;
                // Only update if it's a new scheme based on scroll
                if (schemeId !== activeColorSchemeIdOnScroll) {
                    const scheme = scrollColorSchemes[schemeId];
                    if (scheme) {
                        document.documentElement.style.setProperty('--SS-white', scheme.cssVar);
                        updateSvgColors(scheme.targetColors, scheme.newColor);
                        activeColorSchemeIdOnScroll = schemeId;
                        console.log(`Scrolled to '${schemeId}', applying colors.`);
                    }
                }
            }
        });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    // Start observing the target elements
    scrollTriggerElements.forEach(el => {
        observer.observe(el);
    });

});