document.addEventListener('DOMContentLoaded', () => {
    const animatedSvg = document.getElementById('animatedSvg');

    // Define all your SVG image paths
    const imagePaths = [
        'img/mov_1.svg',
        'img/mov_2.svg',
        'img/mov_3.svg',
        'img/mov_4.svg',
        'img/mov_5.svg',
        'img/mov_6.svg',
        'img/mov_7.svg',
        'img/mov_8.svg',
        'img/mov_9.svg',
        'img/mov_10.svg',
        'img/mov_11.svg',
        'img/mov_12.svg',
        'img/mov_13.svg',
        'img/mov_14.svg',
        'img/mov_15.svg',
        'img/mov_16.svg',
        'img/mov_17.svg',
        'img/mov_18.svg',
        'img/mov_19.svg',
        'img/mov_20.svg'
    ];

    let currentIndex = 0;
    const frameDuration = 500; // 500 milliseconds = 0.5 seconds per frame

    // Optional: Preload images to prevent flickering
    const preloadedImages = [];
    imagePaths.forEach((path) => {
        const img = new Image();
        img.src = path;
        preloadedImages.push(img);
    });
    
    // Initial display
    animatedSvg.src = imagePaths[currentIndex];

    function showNextFrame() {
        currentIndex = (currentIndex + 1) % imagePaths.length; // Loop back to 0
        animatedSvg.src = imagePaths[currentIndex];
    }

    // Start the animation loop
    setInterval(showNextFrame, frameDuration);
});