document.addEventListener('DOMContentLoaded', () => {
    // Select all elements with the class 'privacy' (your clickable spans)
    const privacySpans = document.querySelectorAll('.privacy');
    // Select all elements with the class 'privacy-text'
    const privacyTexts = document.querySelectorAll('.privacy-text');
    // Select all checkboxes with the class 'agree'
    const privacyCheckboxes = document.querySelectorAll('.agree');

    // Ensure we have an equal number of each or handle mismatches
    if (privacySpans.length !== privacyTexts.length || privacySpans.length !== privacyCheckboxes.length) {
        console.error('Mismatch in the number of privacy elements. Check your HTML structure.');
        return;
    }

    // Loop through each set of elements
    privacySpans.forEach((span, index) => {
        const text = privacyTexts[index];
        const checkbox = privacyCheckboxes[index];

        // Ensure all elements for this set are found
        if (!span || !text || !checkbox) {
            console.error(`Missing element in set at index ${index}. Skipping this set.`);
            return;
        }

        // Add event listener to the privacySpan to toggle the privacyText visibility
        span.addEventListener('click', (event) => {
            // No need to prevent default here usually, as the label for="" handles the checkbox.
            // This listener just toggles the text visibility.
            text.classList.toggle('is-visible');
        });

        // Add event listener to the actual checkbox (for accessibility and other triggers)
        checkbox.addEventListener('change', () => {
            if (checkbox.checked) {
                text.classList.add('is-visible');
            } else {
                text.classList.remove('is-visible');
            }
        });

        // Initial state: If the checkbox is pre-checked, ensure the privacy text is also visible
        if (checkbox.checked) {
            text.classList.add('is-visible');
        }
    });
});