
document.addEventListener('commonScriptsReady', () => {
    initializeContactPage();
});

function initializeContactPage() {
    const contactForm = document.getElementById('contactForm'); // Assuming contact.html has this form
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const statusDiv = document.getElementById('form-status-contact'); // Assuming this div exists
            if (!statusDiv) {
                console.warn('Contact form status_div not found.');
                return;
            }
            statusDiv.textContent = 'Sending message...';
            statusDiv.className = 'form-status-message'; // Clear previous states

            // Simulate form submission
            setTimeout(() => {
                const formData = new FormData(contactForm);
                const name = formData.get('name') || "User"; // Fallback for name
                console.log('Contact form submitted:', Object.fromEntries(formData));

                statusDiv.textContent = `Thank you, ${name}! Your message has been sent.`;
                statusDiv.classList.add('success');
                contactForm.reset();

                 setTimeout(() => {
                    statusDiv.textContent = '';
                    statusDiv.className = 'form-status-message';
                }, 5000);
            }, 1500);
        });
    }
}
