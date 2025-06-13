

// --- IndexedDB Setup ---
const DB_NAME = 'buyHomeDB_v3'; // Incremented version for potential schema changes
const STORE_NAME = 'properties_v1';
let db;

// --- Global housesData (in-memory cache, synced with IndexedDB) ---
let housesData = []; // Starts empty, will be populated from IndexedDB or defaults

// --- Default Data (used if DB is empty) ---
const defaultInitialHousesData = [
    {
        id: 1,
        name: "Elegant Family Villa",
        address: "123 Sunshine Avenue, Pleasantville",
        price: "$750,000",
        beds: 2,
        baths: 2,
        sqft: "2,500 sqft",
        type: "Flats / Apartments",
        image: "https://via.placeholder.com/800x500.png?text=Elegant+Villa+Main",
        images: [
            "https://via.placeholder.com/800x500.png?text=Elegant+Villa+Main",
            "https://via.placeholder.com/800x500.png?text=Villa+Garden",
            "https://via.placeholder.com/800x500.png?text=Villa+Interior",
            "https://via.placeholder.com/800x500.png?text=Villa+Pool"
        ],
        videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
        description: "Discover timeless elegance in this stunning family villa located in the serene neighborhood of Pleasantville. Boasting spacious interiors, high-end finishes, and a beautifully landscaped garden, this home is perfect for families seeking comfort and luxury. The open-plan living area flows seamlessly to an outdoor patio, ideal for entertaining.",
        features: ["Hardwood Floors Throughout", "Gourmet Kitchen with Granite Countertops", "Master Suite with Walk-in Closet", "Private Landscaped Garden", "Swimming Pool", "Smart Home System", "Two-car Garage"],
        details: {
            superBuiltUpAreaSqft: "811",
            furnishing: "Semi-Furnished",
            bachelorsAllowed: "Yes",
            carpetAreaSqft: "484",
            floorNo: "4",
            carParking: "1",
            listedBy: "Dealer",
            facing: "East",
            maintenanceMonthly: "1000",
            totalFloors: "5",
            projectName: "Swapna Srushti"
        }
    },
    {
        id: 2,
        name: "Modern City Apartment",
        address: "456 Urban Drive, Metropolis Center",
        price: "$450,000",
        beds: 2,
        baths: 2,
        sqft: "1,200 sqft",
        type: "Apartment",
        image: "https://via.placeholder.com/800x500.png?text=Modern+Apt+Main",
        images: [
            "https://via.placeholder.com/800x500.png?text=Modern+Apt+View",
            "https://via.placeholder.com/800x500.png?text=Modern+Apt+Interior",
            "https://via.placeholder.com/800x500.png?text=Modern+Apt+Balcony"
        ],
        videoUrl: "https://www.youtube.com/embed/5qap5aO4i9A",
        description: "Experience chic urban living in this sleek and stylish apartment. Located in the heart of Metropolis Center, this property offers breathtaking city views, contemporary design, and access to premium building amenities including a rooftop terrace and fitness center. Ideal for professionals and couples.",
        features: ["Floor-to-ceiling windows", "Stainless Steel Appliances", "Private Balcony with City Views", "Concierge Service", "Rooftop Terrace Access", "Fitness Center", "Secure Parking"],
        details: {
            superBuiltUpAreaSqft: "1200",
            furnishing: "Furnished",
            bachelorsAllowed: "No",
            carpetAreaSqft: "1000",
            floorNo: "15",
            carParking: "1",
            listedBy: "Owner",
            facing: "North",
            maintenanceMonthly: "500",
            totalFloors: "25",
            projectName: "Urban Heights"
        }
    },
    {
        id: 3,
        name: "Charming Suburban Home",
        address: "789 Oak Lane, Greendale",
        price: "$580,000",
        beds: 3,
        baths: 2.5,
        sqft: "1,800 sqft",
        type: "House",
        image: "https://via.placeholder.com/800x500.png?text=Suburban+Home+Main",
        images: [
            "https://via.placeholder.com/800x500.png?text=Suburban+Home+Main",
            "https://via.placeholder.com/800x500.png?text=Suburban+Home+Living",
            "https://via.placeholder.com/800x500.png?text=Suburban+Home+Yard"
        ],
        videoUrl: "",
        description: "A delightful suburban home nestled in the quiet and friendly Greendale community. Features a spacious layout, a cozy fireplace, and a large fenced backyard perfect for children and pets. Close to parks and excellent schools.",
        features: ["Cozy Fireplace", "Large Fenced Backyard", "Updated Kitchen", "Hardwood Floors", "Attached Two-Car Garage", "Close to Schools and Parks"],
        details: {
            superBuiltUpAreaSqft: "1800",
            furnishing: "Unfurnished",
            bachelorsAllowed: "Yes",
            carpetAreaSqft: "1650",
            floorNo: "N/A",
            carParking: "2",
            listedBy: "Agent",
            facing: "South",
            maintenanceMonthly: "N/A",
            totalFloors: "2",
            projectName: "Greendale Estates"
        }
    }
];


function initDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, 1); // Version 1

        request.onupgradeneeded = (event) => {
            const tempDb = event.target.result;
            if (!tempDb.objectStoreNames.contains(STORE_NAME)) {
                tempDb.createObjectStore(STORE_NAME, { keyPath: 'id' });
            }
        };

        request.onsuccess = (event) => {
            db = event.target.result;
            console.log("Database initialized successfully.");
            resolve(db);
        };

        request.onerror = (event) => {
            console.error("Database error:", event.target.error);
            reject(event.target.error);
        };
    });
}

function loadHousesDataFromDB() {
    return new Promise((resolve, reject) => {
        if (!db) {
            console.error("DB not initialized. Cannot load data.");
            // Potentially initialize with defaults if DB connection failed earlier
            housesData = [...defaultInitialHousesData];
            initializeAppUI(); // Attempt to initialize UI with defaults
            return reject("DB not initialized.");
        }

        const transaction = db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const getAllRequest = store.getAll();

        getAllRequest.onsuccess = () => {
            const dataFromDB = getAllRequest.result;
            if (dataFromDB && dataFromDB.length > 0) {
                housesData = dataFromDB;
                console.log("Data loaded from IndexedDB.");
            } else {
                // DB is empty, populate with default data and save to DB
                housesData = [...defaultInitialHousesData]; // Use a copy
                console.log("No data in DB, initializing with defaults.");
                saveHousesDataToDB(housesData) // Save defaults to DB
                    .then(() => console.log("Default data saved to IndexedDB."))
                    .catch(err => console.error("Error saving default data to DB:", err));
            }
            resolve(housesData);
        };

        getAllRequest.onerror = (event) => {
            console.error("Error fetching data from DB:", event.target.error);
            // Fallback to default data in case of read error
            housesData = [...defaultInitialHousesData];
            reject(event.target.error);
        };
    });
}

function saveHousesDataToDB(dataToSave) {
    return new Promise((resolve, reject) => {
        if (!db) {
            console.error("DB not initialized. Cannot save data.");
            return reject("DB not initialized.");
        }
        try {
            const transaction = db.transaction([STORE_NAME], 'readwrite');
            const store = transaction.objectStore(STORE_NAME);

            // Clear existing data before saving all new data to simplify sync
            // For more complex scenarios, you might update individual items.
            const clearRequest = store.clear(); 
            clearRequest.onsuccess = () => {
                let itemsProcessed = 0;
                if (dataToSave.length === 0) { // If clearing and saving an empty array
                    resolve();
                    return;
                }
                dataToSave.forEach(house => {
                    const putRequest = store.put(house);
                    putRequest.onsuccess = () => {
                        itemsProcessed++;
                        if (itemsProcessed === dataToSave.length) {
                            // All items saved
                        }
                    };
                    putRequest.onerror = (event) => {
                        console.error(`Error putting item ID ${house.id} into DB:`, event.target.error);
                        // Don't reject immediately, try to save other items
                    };
                });
            };
            clearRequest.onerror = (event) => {
                 console.error("Error clearing store:", event.target.error);
                 reject(event.target.error);
                 return; // Stop further processing if clear fails
            }


            transaction.oncomplete = () => {
                console.log("Data saved to IndexedDB successfully.");
                resolve();
            };

            transaction.onerror = (event) => {
                console.error("Transaction error while saving data to DB:", event.target.error);
                reject(event.target.error);
            };
        } catch (error) {
            console.error("General error in saveHousesDataToDB:", error);
            reject(error);
        }
    });
}


function readFileAsBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
        reader.readAsDataURL(file);
    });
}

// --- App Initialization Logic ---
async function initializeApp() {
    try {
        await initDB();
        await loadHousesDataFromDB();
    } catch (error) {
        console.error("Failed to initialize app with DB, using defaults:", error);
        // housesData would have been set to defaults by loadHousesDataFromDB's error path
        // or if initDB failed, it might still be empty. Ensure it has defaults.
        if (housesData.length === 0) {
            housesData = [...defaultInitialHousesData];
        }
    }
    // All UI initializations that depend on housesData
    initializeAppUI();
}


function initializeAppUI() {
    // Common UI setup
    const header = document.querySelector('header');
    const scrollThreshold = 50;

    const handleHeaderScroll = () => {
        if (header && window.scrollY > scrollThreshold) {
            header.classList.add('scrolled');
        } else if (header) {
            header.classList.remove('scrolled');
        }
    };
    window.addEventListener('scroll', handleHeaderScroll);
    handleHeaderScroll();

    const navLinks = document.querySelectorAll('nav ul li a');
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    navLinks.forEach(link => {
        const linkPath = link.getAttribute('href').split('/').pop();
        if (linkPath === currentPath) {
            link.classList.add('active');
            link.setAttribute('aria-current', 'page');
        } else {
            link.classList.remove('active');
            link.removeAttribute('aria-current');
        }
    });

    const elementsToAnimate = document.querySelectorAll('.scroll-animate');
    const animateOnScroll = () => {
        elementsToAnimate.forEach(element => {
            if (element.getBoundingClientRect().top < window.innerHeight - 100) {
                element.classList.add('visible');
            }
        });
    };
    window.addEventListener('scroll', animateOnScroll);
    animateOnScroll();

    // Page-specific UI setup
    if (document.getElementById('page-admin')) {
        initializeAdminPage();
    }
    if (document.body.classList.contains('page-houses-listing')) { // Add class to houses.html body
        initializeHousesPage();
    }
    if (document.getElementById('house-detail-container')) {
        initializeHouseDetailPage();
    }
    if (document.getElementById('contactForm')) {
        initializeContactPage();
    }
}


function initializeAdminPage() {
    const addPropertyForm = document.getElementById('addPropertyForm');
    if (addPropertyForm) {
        addPropertyForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const statusDiv = document.getElementById('form-status-admin');
            statusDiv.textContent = 'Submitting...';
            statusDiv.className = 'form-status-message';
            let newHouseId = -1;
            let tempNewHouse = null; // Store the new house temporarily for rollback

            try {
                const formData = new FormData(addPropertyForm);
                newHouseId = housesData.length > 0 ? Math.max(...housesData.map(h => h.id)) + 1 : 1;

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
                if (galleryImageFiles && galleryImageFiles.length > 0) {
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
                
                // Ensure main image is first in gallery if gallery is otherwise empty or doesn't contain it
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

                housesData.push(tempNewHouse); // Optimistically update in-memory array
                await saveHousesDataToDB(housesData); // Attempt to save to IndexedDB

                statusDiv.textContent = 'Property added successfully!';
                statusDiv.classList.add('success');
                addPropertyForm.reset();
                tempNewHouse = null; // Clear temporary holder

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
                    // Rollback: Remove the optimistically added property from in-memory array
                    if (tempNewHouse) {
                        const indexToRemove = housesData.findIndex(h => h.id === tempNewHouse.id);
                        if (indexToRemove > -1) {
                            housesData.splice(indexToRemove, 1);
                            console.warn(`Rolled back addition of property ID ${tempNewHouse.id} from in-memory array due to quota error.`);
                        }
                    }
                    addPropertyForm.reset();
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
}


function initializeHousesPage() {
    const propertyGridHouses = document.getElementById('property-grid-houses');
    const filterTypeSelect = document.getElementById('filter-type');
    const sortPriceSelect = document.getElementById('sort-price');
    const applyFiltersButton = document.getElementById('apply-filters');

    function createPropertyCard(house) {
        const card = document.createElement('div');
        card.className = 'property-card';
        card.innerHTML = `
            <img src="${house.image || 'https://via.placeholder.com/400x250.png?text=No+Image'}" alt="${house.name}">
            <div class="card-content">
                <h3>${house.name}</h3>
                <p class="price">${house.price}</p>
                <p class="specs">${house.beds} Beds | ${house.baths} Baths | ${house.sqft}</p>
                <a href="house-detail.html?id=${house.id}" class="btn btn-secondary">View Details</a>
            </div>
        `;
        return card;
    }

    function displayProperties(propertiesToDisplay) {
        if (!propertyGridHouses) return;
        propertyGridHouses.innerHTML = '';
        if (propertiesToDisplay.length === 0) {
            propertyGridHouses.innerHTML = '<p class="text-center" style="grid-column: 1 / -1;">No properties match your criteria.</p>';
            return;
        }
        propertiesToDisplay.forEach((house) => {
            const card = createPropertyCard(house);
            propertyGridHouses.appendChild(card);
        });
    }

    function applyHouseFiltersAndSort() {
        if (!propertyGridHouses) return;
        let filteredHouses = [...housesData];
        const typeFilter = filterTypeSelect ? filterTypeSelect.value : 'all';
        if (typeFilter !== 'all') {
            filteredHouses = filteredHouses.filter(house => house.type && house.type.toLowerCase() === typeFilter.toLowerCase());
        }
        const priceSort = sortPriceSelect ? sortPriceSelect.value : 'default';
        if (priceSort === 'low-to-high') {
            filteredHouses.sort((a, b) => parseFloat(String(a.price).replace(/[$,]/g, '')) - parseFloat(String(b.price).replace(/[$,]/g, '')));
        } else if (priceSort === 'high-to-low') {
            filteredHouses.sort((a, b) => parseFloat(String(b.price).replace(/[$,]/g, '')) - parseFloat(String(a.price).replace(/[$,]/g, '')));
        }
        displayProperties(filteredHouses);
    }

    if (propertyGridHouses) applyHouseFiltersAndSort();
    if (applyFiltersButton) applyFiltersButton.addEventListener('click', applyHouseFiltersAndSort);
    if (filterTypeSelect) filterTypeSelect.addEventListener('change', applyHouseFiltersAndSort);
    if (sortPriceSelect) sortPriceSelect.addEventListener('change', applyHouseFiltersAndSort);
}

function initializeHouseDetailPage() {
    const urlParams = new URLSearchParams(window.location.search);
    const houseId = parseInt(urlParams.get('id'));
    const house = housesData.find(h => h.id === houseId);
    const container = document.getElementById('house-detail-container');
    const loadingPlaceholder = container.querySelector('.loading-placeholder');

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
            } else if (house.details && typeof house.details[item.key] !== 'undefined' && house.details[item.key] !== null && house.details[item.key] !== "N/A" && house.details[item.key] !== "") {
                value = house.details[item.key];
            }

            if (value || value === 0) {
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

        const propertyInquiryForm = document.getElementById('propertyInquiryForm');
        if (propertyInquiryForm) {
            propertyInquiryForm.addEventListener('submit', function(e) {
                e.preventDefault();
                const statusDiv = document.getElementById('inquiry-status');
                statusDiv.textContent = 'Sending...';
                statusDiv.className = 'form-status-message';

                setTimeout(() => {
                    statusDiv.textContent = 'Inquiry sent successfully! We will contact you shortly.';
                    statusDiv.classList.add('success');
                    propertyInquiryForm.reset();
                    const messageTextarea = document.getElementById('inquiry-message');
                    if (messageTextarea && house) {
                         messageTextarea.value = `I'm interested in ${house.name} at ${house.address}. Please provide more information.`;
                    }
                    setTimeout(() => {
                       statusDiv.textContent = '';
                       statusDiv.className = 'form-status-message';
                    }, 5000);
                }, 1500);
            });
        }

    } else {
        container.innerHTML = `
            <h1 class="text-center" style="margin-top: 2rem;">Property Not Found</h1>
            <p class="text-center">Sorry, the property you are looking for does not exist or the ID is incorrect.</p>
            <div class="text-center" style="margin-top: 2rem;"><a href="houses.html" class="btn btn-primary">Back to Listings</a></div>
        `;
    }
}


function initializeContactPage() {
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const statusDiv = document.getElementById('form-status-contact');
            statusDiv.textContent = 'Sending message...';
            statusDiv.className = 'form-status-message';

            setTimeout(() => {
                const formData = new FormData(contactForm);
                const name = formData.get('name');
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

// --- Start the App ---
document.addEventListener('DOMContentLoaded', initializeApp);
    