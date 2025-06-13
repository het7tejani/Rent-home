

document.addEventListener('commonScriptsReady', () => {
    initializeAdminPage();
});

// This readFileAsBase64 function is specific to admin-page.js
// If common.js also defines it, ensure this one is used or they are identical.
function readFileAsBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
        reader.readAsDataURL(file);
    });
}


function initializeAdminPage() {
    const addPropertyForm = document.getElementById('addPropertyForm');

    // File input, URL input, preview containers, and filename display elements
    const mainImageFileInput = document.getElementById('propertyMainImageFile');
    const mainImageURLInput = document.getElementById('propertyMainImageURL');
    const mainImagePreviewContainer = document.getElementById('mainImagePreviewContainer');
    const mainImageFilenameDisplay = document.getElementById('mainImageFilename');

    const galleryImageFilesInput = document.getElementById('propertyGalleryImageFiles');
    const galleryImageURLsInput = document.getElementById('propertyGalleryImageURLs');
    const galleryImagesPreviewContainer = document.getElementById('galleryImagesPreviewContainer');
    const galleryImagesFilenamesDisplay = document.getElementById('galleryImagesFilenames');

    const videoFileInput = document.getElementById('propertyVideoFile');
    const videoURLInput = document.getElementById('propertyVideoURL');
    const videoPreviewContainer = document.getElementById('videoPreviewContainer');
    const videoFilenameDisplay = document.getElementById('videoFilename');

    const allFilenameDisplays = [mainImageFilenameDisplay, galleryImagesFilenamesDisplay, videoFilenameDisplay];
    const allPreviewContainers = [mainImagePreviewContainer, galleryImagesPreviewContainer, videoPreviewContainer];
    
    const managePropertiesGrid = document.getElementById('manage-properties-grid');
    const adminActionStatusDiv = document.getElementById('admin-action-status');


    // --- Event Listeners for Main Image ---
    if (mainImageFileInput && mainImagePreviewContainer && mainImageURLInput && mainImageFilenameDisplay) {
        mainImageFileInput.addEventListener('change', async function(event) {
            mainImagePreviewContainer.innerHTML = ''; 
            mainImageURLInput.value = ''; 

            if (event.target.files && event.target.files[0]) {
                const file = event.target.files[0];
                mainImageFilenameDisplay.textContent = file.name;
                mainImageFilenameDisplay.style.display = 'block';

                if (file.type.startsWith('image/')) {
                    try {
                        const fileDataUrl = await readFileAsBase64(file);
                        const img = document.createElement('img');
                        img.src = fileDataUrl;
                        img.alt = 'Main image preview';
                        mainImagePreviewContainer.appendChild(img);
                    } catch (error) {
                        console.error("Error reading main image file for preview:", error);
                        mainImagePreviewContainer.textContent = 'Error previewing image.';
                    }
                } else {
                    mainImagePreviewContainer.textContent = 'Selected file is not an image.';
                }
            } else {
                mainImageFilenameDisplay.textContent = '';
                mainImageFilenameDisplay.style.display = 'none';
            }
        });

        mainImageURLInput.addEventListener('input', function() {
            if (mainImageURLInput.value.trim() !== '') {
                mainImageFileInput.value = null; 
                mainImagePreviewContainer.innerHTML = ''; 
                mainImageFilenameDisplay.textContent = '';
                mainImageFilenameDisplay.style.display = 'none';
            }
        });
    }

    // --- Event Listeners for Gallery Images ---
    if (galleryImageFilesInput && galleryImagesPreviewContainer && galleryImageURLsInput && galleryImagesFilenamesDisplay) {
        galleryImageFilesInput.addEventListener('change', async function(event) {
            galleryImagesPreviewContainer.innerHTML = ''; 
            galleryImageURLsInput.value = ''; 

            if (event.target.files && event.target.files.length > 0) {
                const files = event.target.files;
                if (files.length === 1) {
                    galleryImagesFilenamesDisplay.textContent = files[0].name;
                } else {
                    galleryImagesFilenamesDisplay.textContent = `${files.length} files selected`;
                }
                galleryImagesFilenamesDisplay.style.display = 'block';

                for (const file of files) {
                    if (file.type.startsWith('image/')) {
                        try {
                            const fileDataUrl = await readFileAsBase64(file);
                            const img = document.createElement('img');
                            img.src = fileDataUrl;
                            img.alt = 'Gallery image preview';
                            galleryImagesPreviewContainer.appendChild(img);
                        } catch (error)                            {
                            console.error("Error reading gallery image file for preview:", error);
                        }
                    }
                }
            } else {
                galleryImagesFilenamesDisplay.textContent = '';
                galleryImagesFilenamesDisplay.style.display = 'none';
            }
        });
        galleryImageURLsInput.addEventListener('input', function() {
            if (galleryImageURLsInput.value.trim() !== '') {
                galleryImageFilesInput.value = null; 
                galleryImagesPreviewContainer.innerHTML = ''; 
                galleryImagesFilenamesDisplay.textContent = '';
                galleryImagesFilenamesDisplay.style.display = 'none';
            }
        });
    }

    // --- Event Listeners for Video ---
    if (videoFileInput && videoPreviewContainer && videoURLInput && videoFilenameDisplay) {
        videoFileInput.addEventListener('change', async function(event) {
            videoPreviewContainer.innerHTML = ''; 
            videoURLInput.value = ''; 

            if (event.target.files && event.target.files[0]) {
                const file = event.target.files[0];
                videoFilenameDisplay.textContent = file.name;
                videoFilenameDisplay.style.display = 'block';

                if (file.type.startsWith('video/')) {
                    try {
                        const fileDataUrl = await readFileAsBase64(file);
                        const video = document.createElement('video');
                        video.src = fileDataUrl;
                        video.controls = true;
                        videoPreviewContainer.appendChild(video);
                    } catch (error) {
                        console.error("Error reading video file for preview:", error);
                        videoPreviewContainer.textContent = 'Error previewing video.';
                    }
                } else {
                    videoPreviewContainer.textContent = 'Selected file is not a video.';
                }
            } else {
                videoFilenameDisplay.textContent = '';
                videoFilenameDisplay.style.display = 'none';
            }
        });
        videoURLInput.addEventListener('input', function() {
            if (videoURLInput.value.trim() !== '') {
                videoFileInput.value = null; 
                videoPreviewContainer.innerHTML = ''; 
                videoFilenameDisplay.textContent = '';
                videoFilenameDisplay.style.display = 'none';
            }
        });
    }

    function resetMediaPreviewsAndFilenames() {
        allPreviewContainers.forEach(container => {
            if (container) container.innerHTML = '';
        });
        allFilenameDisplays.forEach(display => {
            if (display) {
                display.textContent = '';
                display.style.display = 'none';
            }
        });
    }


    // --- Form Submission Logic ---
    if (addPropertyForm) {
        addPropertyForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const statusDiv = document.getElementById('form-status-admin');
            statusDiv.textContent = 'Submitting...';
            statusDiv.className = 'form-status-message';
            let tempNewHouse = null; 

            try {
                const formData = new FormData(addPropertyForm);
                const newHouseId = housesData.length > 0 ? Math.max(...housesData.map(h => h.id)) + 1 : 1;

                let mainImageSource = formData.get('propertyMainImageURL');
                const mainImageFile = formData.get('propertyMainImageFile');
                if (mainImageFile && mainImageFile.size > 0) {
                    mainImageSource = await readFileAsBase64(mainImageFile); 
                }

                if (!mainImageSource) {
                    throw new Error("Main Image is required. Please upload a file or provide a URL.");
                }

                let galleryImageSources = [];
                const galleryImageFiles = formData.getAll('propertyGalleryImageFiles');
                if (galleryImageFiles && galleryImageFiles.length > 0 && galleryImageFiles.some(file => file.size > 0)) {
                    for (const file of galleryImageFiles) {
                        if (file.size > 0) {
                             galleryImageSources.push(await readFileAsBase64(file)); 
                        }
                    }
                }
                const galleryImageURLsRaw = formData.get('propertyGalleryImageURLs');
                if (galleryImageURLsRaw) {
                    const urls = galleryImageURLsRaw.split(',').map(url => url.trim()).filter(url => url);
                    galleryImageSources.push(...urls);
                }
                
                if (galleryImageSources.length === 0) {
                    galleryImageSources.push(mainImageSource);
                } else if (!galleryImageSources.includes(mainImageSource)) {
                    galleryImageSources.unshift(mainImageSource);
                }


                let videoSource = formData.get('propertyVideoURL');
                const videoFile = formData.get('propertyVideoFile');
                if (videoFile && videoFile.size > 0) {
                    videoSource = await readFileAsBase64(videoFile); 
                }

                tempNewHouse = {
                    id: newHouseId,
                    name: formData.get('propertyName'),
                    address: formData.get('propertyAddress'),
                    price: formData.get('propertyPrice'),
                    beds: parseInt(formData.get('propertyBeds'), 10),
                    baths: parseFloat(formData.get('propertyBaths')),
                    sqft: formData.get('propertySqft'),
                    type: formData.get('propertyType'),
                    image: mainImageSource,
                    images: galleryImageSources,
                    videoUrl: videoSource || "",
                    description: formData.get('propertyDescription'),
                    features: formData.get('keyFeatures') ? formData.get('keyFeatures').split(',').map(f => f.trim()).filter(f => f) : [],
                    details: {
                        superBuiltUpAreaSqft: formData.get('superBuiltUpAreaSqft') || "N/A",
                        furnishing: formData.get('furnishing') || "N/A",
                        bachelorsAllowed: formData.get('bachelorsAllowed') || "N/A",
                        carpetAreaSqft: formData.get('carpetAreaSqft') || "N/A",
                        floorNo: formData.get('floorNo') || "N/A",
                        carParking: formData.get('carParking') || "N/A",
                        listedBy: formData.get('listedBy') || "N/A",
                        facing: formData.get('facing') || "N/A",
                        maintenanceMonthly: formData.get('maintenanceMonthly') || "N/A",
                        totalFloors: formData.get('totalFloors') || "N/A",
                        projectName: formData.get('projectName') || "N/A"
                    }
                };
                
                if (!tempNewHouse.name || !tempNewHouse.address || !tempNewHouse.price || isNaN(tempNewHouse.beds) || isNaN(tempNewHouse.baths) || !tempNewHouse.sqft || !tempNewHouse.type || !tempNewHouse.description) {
                    throw new Error("Please fill in all required fields: Name, Address, Price, Beds, Baths, Sqft, Type, Description.");
                }
                
                // const originalHousesData = [...housesData]; 
                housesData.push(tempNewHouse); 

                await saveHousesDataToDB(housesData); 

                statusDiv.textContent = 'Property added successfully!';
                statusDiv.classList.add('success');
                addPropertyForm.reset();
                resetMediaPreviewsAndFilenames(); // Clear previews and filenames after successful submission
                displayAdminProperties(); // Refresh the list of manageable properties
                
                tempNewHouse = null; 

                setTimeout(() => {
                    statusDiv.textContent = '';
                    statusDiv.className = 'form-status-message';
                }, 4000);

            } catch (error) {
                let userMessage = `Error: ${error.message || "Could not add property."}`;
                let isQuotaError = false;

                if (error.name === 'QuotaExceededError' || (error.message && error.message.toLowerCase().includes('quota'))) {
                    userMessage = 'Error: Browser storage quota exceeded! Property not saved. Please reduce image/video file sizes or clear some existing properties. This message will persist until your next action.';
                    isQuotaError = true;
                    if (tempNewHouse) { // Rollback optimistic addition
                        const indexToRemove = housesData.findIndex(h => h.id === tempNewHouse.id);
                        if (indexToRemove > -1) {
                            housesData.splice(indexToRemove, 1);
                            console.warn(`Rolled back addition of property ID ${tempNewHouse.id} from in-memory array due to quota error.`);
                        }
                    }
                    addPropertyForm.reset(); 
                    resetMediaPreviewsAndFilenames(); 

                } else if (tempNewHouse) { // Rollback for other errors during save
                     const indexToRemove = housesData.findIndex(h => h.id === tempNewHouse.id);
                        if (indexToRemove > -1) {
                            housesData.splice(indexToRemove, 1);
                             console.warn(`Rolled back addition of property ID ${tempNewHouse.id} from in-memory array due to save error.`);
                        }
                }


                statusDiv.textContent = userMessage;
                statusDiv.classList.add('error');

                if (!isQuotaError) {
                    setTimeout(() => {
                        statusDiv.textContent = '';
                        statusDiv.className = 'form-status-message';
                    }, 8000);
                }
            }
        });
    }

    // --- Manage Properties Section ---
    function createAdminPropertyCard(house) {
        const card = document.createElement('div');
        card.className = 'property-card';
        
        const secondaryInfo = `${house.type || 'N/A'} - ${house.sqft || 'N/A'}`;

        card.innerHTML = `
            <a href="house-detail.html?id=${house.id}" class="property-card-image-link" aria-label="View details for ${house.name}" target="_blank">
                <img src="${house.image || 'https://via.placeholder.com/400x250.png?text=No+Image'}" alt="${house.name}" class="property-card-image">
            </a>
            <hr class="property-card-divider">
            <div class="property-card-details">
                <div class="property-card-info">
                    <h3 class="property-card-name"><a href="house-detail.html?id=${house.id}" class="property-card-name-link" target="_blank">${house.name}</a></h3>
                    <p class="property-card-secondary-info">${secondaryInfo}</p>
                </div>
                <p class="property-card-price">${house.price}</p>
            </div>
            <div class="property-card-actions">
                <a href="house-detail.html?id=${house.id}" class="btn btn-secondary property-card-button" target="_blank">View Details</a>
                <button class="btn btn-delete" data-property-id="${house.id}">Delete</button>
            </div>
        `;
        return card;
    }

    async function handleDeleteProperty(event) {
        if (!event.target.classList.contains('btn-delete')) return;

        const propertyId = parseInt(event.target.dataset.propertyId);
        const propertyToDelete = housesData.find(h => h.id === propertyId);

        if (!propertyToDelete) {
            console.error("Property to delete not found in housesData.");
            if(adminActionStatusDiv) {
                adminActionStatusDiv.textContent = 'Error: Property not found.';
                adminActionStatusDiv.className = 'form-status-message error';
            }
            return;
        }

        if (window.confirm(`Are you sure you want to delete the property "${propertyToDelete.name}"? This action cannot be undone.`)) {
            if(adminActionStatusDiv) {
                adminActionStatusDiv.textContent = 'Deleting property...';
                adminActionStatusDiv.className = 'form-status-message';
            }
            
            const originalHousesData = [...housesData]; // For potential rollback
            housesData = housesData.filter(h => h.id !== propertyId);

            try {
                await saveHousesDataToDB(housesData);
                if(adminActionStatusDiv) {
                    adminActionStatusDiv.textContent = `Property "${propertyToDelete.name}" deleted successfully.`;
                    adminActionStatusDiv.className = 'form-status-message success';
                }
                displayAdminProperties(); // Refresh the list
            } catch (error) {
                console.error('Error deleting property from DB:', error);
                housesData = originalHousesData; // Rollback in-memory change
                if(adminActionStatusDiv) {
                    adminActionStatusDiv.textContent = 'Error: Could not delete property. Please try again.';
                    adminActionStatusDiv.className = 'form-status-message error';
                }
            } finally {
                if(adminActionStatusDiv && !adminActionStatusDiv.classList.contains('error')) { // Don't auto-clear critical error
                    setTimeout(() => {
                        if(adminActionStatusDiv) {
                            adminActionStatusDiv.textContent = '';
                            adminActionStatusDiv.className = 'form-status-message';
                        }
                    }, 4000);
                }
            }
        }
    }

    function displayAdminProperties() {
        if (!managePropertiesGrid) return;
        managePropertiesGrid.innerHTML = ''; // Clear existing cards

        if (housesData.length === 0) {
            managePropertiesGrid.innerHTML = '<p class="text-center" style="grid-column: 1 / -1;">No properties available to manage.</p>';
            return;
        }

        housesData.forEach(house => {
            const card = createAdminPropertyCard(house);
            managePropertiesGrid.appendChild(card);
        });

        // Add event listeners to delete buttons after they are rendered
        managePropertiesGrid.removeEventListener('click', handleDeleteProperty); // Remove old listener to prevent duplicates
        managePropertiesGrid.addEventListener('click', handleDeleteProperty);
    }
    
    // Initial display of properties to manage
    displayAdminProperties(); 
}

// In your admin-page.js, modify the form submission:
addPropertyForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const formData = new FormData(addPropertyForm);
    
    try {
        const response = await fetch('save_property.php', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (result.success) {
            // Handle success
        } else {
            // Handle errors
        }
    } catch (error) {
        // Handle network errors
    }
});