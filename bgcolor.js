const changeVarBtn = document.getElementById('about_btn');
const rootStyles = document.documentElement.style; // Get the style object for the :root element

let isWhite = true; // To toggle back and forth

changeVarBtn.addEventListener('click', () => {
    if (isWhite) {
        // Option 1: Set --SS-white directly to the value of --SS-grey
        // You would need to know the actual value of --SS-grey.
        // This is less dynamic if --SS-grey itself might change.
        // rootStyles.setProperty('--SS-white', '#cccccc'); // Assuming --SS-grey is #cccccc

        // Option 2 (Recommended): Get the computed value of --SS-grey and set --SS-white to it
        // This is more robust as it doesn't require hardcoding --SS-grey's value.
        const ssGreyValue = getComputedStyle(document.documentElement).getPropertyValue('--SS-grey');
        rootStyles.setProperty('--SS-white', ssGreyValue);
        
        // Change the button text for clarity
        // changeVarBtn.textContent = 'Change --SS-white back to original';
        isWhite = false;
    } else {
        // Revert --SS-white back to its original value (or another value)
        rootStyles.setProperty('--SS-white', 'rgba(245, 245, 250, 1)'); // Assuming original SS-white was #ffffff

        // Change the button text for clarity
        //changeVarBtn.textContent = 'Change --SS-white to --SS-grey';
        isWhite = true;
    }
});

// Optional: You could also dynamically change the value of --SS-grey if needed
// For example, if you wanted to change --SS-grey to --SS-blue
// const ssBlueValue = getComputedStyle(document.documentElement).getPropertyValue('--SS-blue');
// rootStyles.setProperty('--SS-grey', ssBlueValue);