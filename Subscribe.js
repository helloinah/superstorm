const webAppUrl = 'https://script.google.com/macros/s/AKfycbzh4WubZ7gFxfYB96Xb5t65QFHBew4uV3Gc9wvy4AjnPgYGQSo5tjXBA3ZoqJKZBgwUmw/exec'; // <--- PASTE YOUR WEB APP URL HERE

    // Get references to the modal elements (these can still use IDs as they are global)
    const thankYouModal = document.getElementById('thankYouModal');
    const closeModalBtn = document.getElementById('closeModalBtn');

    // Get all forms with the class 'my-form'
    const forms = document.querySelectorAll('.my-form');

    // Loop through each form and attach the event listener
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault(); // Prevent the default form submission (page reload)

            // Get the specific submit button for *this* form
            const submitButton = form.querySelector('.submit-button'); // Use class if you have one

            submitButton.disabled = true;
            submitButton.textContent = '친구 추가 중...';

            const formData = new FormData(form); // formData is created from *this* specific form

            fetch(webAppUrl, {
                method: 'POST',
                body: formData,
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok ' + response.statusText);
                }
                //return response.text();
                alert('친구 추가 완료!');
            })
            .then(data => {
                console.log(data);
                form.reset(); // Clear the fields of *this* form
                //thankYouModal.style.display = 'block'; // Show the pop-up
            })
            .catch(error => {
                console.error('Error:', error);
                alert('에러 발생...! heewon@superstorm.cc로 연락주세요.');
            })
            .finally(() => {
                // Re-enable the button and reset text regardless of success or error
                submitButton.disabled = false;
                // You might need to store the original text if buttons have different labels
                // For now, let's assume a generic reset or use a common class for buttons
                submitButton.textContent = '메일친구 되기'; // Or '메일친구 되기' if all are same
            });
        });
    });

    // Event listener to close the modal when the button is clicked
    closeModalBtn.addEventListener('click', function() {
        thankYouModal.style.display = 'none';
    });

    // Optional: Close the modal if the user clicks outside the content box
    thankYouModal.addEventListener('click', function(e) {
        if (e.target === thankYouModal) {
            thankYouModal.style.display = 'none';
        }
    });