
document.addEventListener('commonScriptsReady', () => {
    initializeHouseDetailPage();
});

function initializeHouseDetailPage() {
    const urlParams = new URLSearchParams(window.location.search);
    const houseId = parseInt(urlParams.get('id'));
    const container = document.getElementById('house-detail-container');

    if (!container) return;
    const loadingPlaceholder = container.querySelector('.loading-placeholder');

    const house = housesData.find(h => h.id === houseId);

    if (loadingPlaceholder) loadingPlaceholder.style.display = 'none';

    if (house) {
        document.title = `${house.name} - Buy Home`;

        const detailsOrder = [
            { key: 'type', label: 'Type' },
            { key: 'beds', label: 'Bedrooms' },
            { key: 'baths', label: 'Bathrooms' },
            { key: 'sqft', label: 'Area' },
            { key: 'superBuiltUpAreaSqft', label: 'Super Built-up Area' },
            { key: 'carpetAreaSqft', label: 'Carpet Area' },
            { key: 'furnishing', label: 'Furnishing' },
            { key: 'facing', label: 'Facing' },
            { key: 'floorNo', label: 'Floor No.' },
            { key: 'totalFloors', label: 'Total Floors' },
            { key: 'carParking', label: 'Car Parking' },
            { key: 'bachelorsAllowed', label: 'Bachelors Allowed' },
            { key: 'maintenanceMonthly', label: 'Maintenance (Monthly)' },
            { key: 'listedBy', label: 'Listed By' },
            { key: 'projectName', label: 'Project Name' }
        ];

        let detailsHtml = '';
        detailsOrder.forEach(item => {
            let value;
            if (['type', 'beds', 'baths', 'sqft'].includes(item.key)) {
                value = house[item.key];
            } else if (house.details && typeof house.details[item.key] !== 'undefined' && house.details[item.key] !== null && String(house.details[item.key]).trim() !== "N/A" && String(house.details[item.key]).trim() !== "") {
                value = house.details[item.key];
            }

            if (value || value === 0) { // Check for 0 as well
                detailsHtml += `
                    <div class="detail-item">
                        <span class="detail-label">${item.label}:</span>
                        <span class="detail-value">${value} ${['sqft', 'superBuiltUpAreaSqft', 'carpetAreaSqft'].includes(item.key) ? 'sqft' : ''}</span>
                    </div>
                `;
            }
        });

        const mainImageSrc = house.image || 'https://via.placeholder.com/800x500.png?text=Image+Not+Available';
        const galleryImagesHtml = (house.images && house.images.length > 0 ? house.images : [mainImageSrc])
            .map((imgUrl, index) => `
                <img src="${imgUrl}" alt="${house.name} Gallery Image ${index + 1}" class="${(imgUrl === mainImageSrc && index === 0 && house.images && house.images.includes(mainImageSrc)) || (index === 0 && (!house.images || !house.images.includes(mainImageSrc))) ? 'active-thumb' : ''}" data-fullimage="${imgUrl}">
            `).join('');


        let videoPlayerHtml = '';
        if (house.videoUrl) {
            if (house.videoUrl.startsWith('data:video/')) {
                const videoType = house.videoUrl.substring(5, house.videoUrl.indexOf(';'));
                videoPlayerHtml = `
                    <video controls width="100%" style="border-radius: var(--border-radius); max-height: 450px; background-color: #000;">
                        <source src="${house.videoUrl}" type="${videoType}">
                        Your browser does not support the video tag.
                    </video>
                `;
            } else if (house.videoUrl.includes('youtube.com/') || house.videoUrl.includes('youtu.be/')) {
                const videoIdMatch = house.videoUrl.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
                const videoId = videoIdMatch ? videoIdMatch[1] : null;
                if (videoId) {
                    videoPlayerHtml = `
                        <div class="video-container">
                            <iframe src="https://www.youtube.com/embed/${videoId}"
                                    title="YouTube video player for ${house.name}"
                                    frameborder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowfullscreen>
                            </iframe>
                        </div>`;
                } else {
                    videoPlayerHtml = '<p>Could not extract YouTube video ID from URL.</p>';
                }
            } else if (house.videoUrl.match(/\.(webm|mp4|ogg|mov)$/i)) {
                const videoTypeMatch = house.videoUrl.match(/\.([^.]+)$/);
                const videoType = videoTypeMatch ? videoTypeMatch[1].toLowerCase() : 'mp4';
                videoPlayerHtml = `
                    <video controls width="100%" style="border-radius: var(--border-radius); max-height: 450px; background-color: #000;">
                        <source src="${house.videoUrl}" type="video/${videoType === 'mov' ? 'quicktime' : videoType}">
                        Your browser does not support the video tag or this video format.
                    </video>
                `;
            } else {
                videoPlayerHtml = '<p>Video format not recognized or URL is invalid.</p>';
            }
        }

        container.innerHTML = `
            <h1 class="house-title">${house.name}</h1>
            <p class="house-address">${house.address}</p>
            <p class="house-price-main">${house.price}</p>

            <div class="detail-grid">
                <div class="main-content">
                    ${detailsHtml ? `
                    <div class="property-details-section">
                        <h3 class="details-title">Details</h3>
                        <div class="details-grid">${detailsHtml}</div>
                    </div>` : ''}

                    <div class="image-gallery">
                        <div class="main-image-container">
                            <img src="${mainImageSrc}" alt="${house.name} Main View" id="main-house-image">
                        </div>
                        ${(house.images && house.images.length > 1) || (house.images && house.images.length === 1 && house.images[0] !== mainImageSrc) ? `
                        <div class="thumbnail-container" id="thumbnail-images">
                            ${galleryImagesHtml}
                        </div>` : ''}
                    </div>

                    <div class="property-section property-description">
                        <h3>Property Overview</h3>
                        <p>${house.description || "No description available."}</p>
                    </div>

                    ${house.features && house.features.length > 0 ? `
                    <div class="property-section property-features">
                        <h3>Key Features</h3>
                        <ul class="key-features">
                            ${house.features.map(feature => `<li>${feature}</li>`).join('')}
                        </ul>
                    </div>` : ''}

                    ${videoPlayerHtml ? `
                    <div class="property-section property-video">
                        <h3>Virtual Tour / Video</h3>
                        ${videoPlayerHtml}
                    </div>` : ''}
                </div>

                <aside class="sidebar">
                    <div class="inquiry-form">
                        <h3>Interested? Contact Us!</h3>
                        <form id="propertyInquiryForm">
                            <div class="form-group">
                                <label for="inquiry-name">Full Name</label>
                                <input type="text" id="inquiry-name" name="name" required>
                            </div>
                            <div class="form-group">
                                <label for="inquiry-email">Email</label>
                                <input type="email" id="inquiry-email" name="email" required>
                            </div>
                            <div class="form-group">
                                <label for="inquiry-phone">Phone (Optional)</label>
                                <input type="tel" id="inquiry-phone" name="phone">
                            </div>
                            <div class="form-group">
                                <label for="inquiry-message">Message</label>
                                <textarea id="inquiry-message" name="message" rows="4" required>I'm interested in ${house.name} at ${house.address}. Please provide more information.</textarea>
                            </div>
                            <button type="submit" class="btn btn-primary">Send Inquiry</button>
                            <div id="inquiry-status" class="form-status-message" aria-live="polite"></div>
                        </form>
                    </div>
                </aside>
            </div>
        `;

        const thumbnails = container.querySelectorAll('.thumbnail-container img');
        const mainImageEl = container.querySelector('#main-house-image');
        thumbnails.forEach(thumb => {
            thumb.addEventListener('click', () => {
                if (mainImageEl) {
                    mainImageEl.src = thumb.dataset.fullimage;
                    mainImageEl.alt = thumb.alt.replace('Gallery Image', 'Main view');
                }
                thumbnails.forEach(t => t.classList.remove('active-thumb'));
                thumb.classList.add('active-thumb');
            });
        });

        propertyInquiryForm.addEventListener('submit', async function (e) {
            e.preventDefault();
            const statusDiv = document.getElementById('inquiry-status');
            statusDiv.textContent = 'Sending...';
            statusDiv.className = 'form-status-message';

            const formData = new FormData(propertyInquiryForm);

            try {
                const response = await fetch('/hwd/php/save_inquiry.php', {
                    method: 'POST',
                    body: formData
                });

                const result = await response.json();

                if (result.status === 'success') {
                    statusDiv.textContent = 'Inquiry sent successfully!';
                    statusDiv.classList.add('success');
                    propertyInquiryForm.reset();
                } else {
                    throw new Error(result.error || 'Unknown error');
                }
            } catch (err) {
                statusDiv.textContent = 'Error: ' + err.message;
                statusDiv.classList.add('error');
            }

            setTimeout(() => {
                statusDiv.textContent = '';
                statusDiv.className = 'form-status-message';
            }, 5000);
        });

        // const propertyInquiryForm = document.getElementById('propertyInquiryForm');
        // if (propertyInquiryForm) {
        //     propertyInquiryForm.addEventListener('submit', function(e) {
        //         e.preventDefault();
        //         const statusDiv = document.getElementById('inquiry-status');
        //         statusDiv.textContent = 'Sending...';
        //         statusDiv.className = 'form-status-message';

        //         setTimeout(() => {
        //             statusDiv.textContent = 'Inquiry sent successfully! We will contact you shortly.';
        //             statusDiv.classList.add('success');
        //             propertyInquiryForm.reset();
        //             const messageTextarea = document.getElementById('inquiry-message');
        //             if (messageTextarea && house) {
        //                  messageTextarea.value = `I'm interested in ${house.name} at ${house.address}. Please provide more information.`;
        //             }
        //             setTimeout(() => {
        //                statusDiv.textContent = '';
        //                statusDiv.className = 'form-status-message';
        //             }, 5000);
        //         }, 1500);
        //     });
        // }

    } else {
        container.innerHTML = `
            <h1 class="text-center" style="margin-top: 2rem;">Property Not Found</h1>
            <p class="text-center">Sorry, the property you are looking for does not exist or the ID is incorrect.</p>
            <div class="text-center" style="margin-top: 2rem;"><a href="houses.html" class="btn btn-primary">Back to Listings</a></div>
        `;
    }
}
