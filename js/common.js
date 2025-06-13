
// --- IndexedDB Setup ---
const DB_NAME = 'buyHomeDB_v3';
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
        const request = indexedDB.open(DB_NAME, 1); 

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
            housesData = [...defaultInitialHousesData];
             document.dispatchEvent(new CustomEvent('commonScriptsReady', { detail: { housesData, db: null } }));
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
                housesData = [...defaultInitialHousesData];
                console.log("No data in DB, initializing with defaults.");
                saveHousesDataToDB(housesData) 
                    .then(() => console.log("Default data saved to IndexedDB."))
                    .catch(err => console.error("Error saving default data to DB:", err));
            }
            resolve(housesData);
        };

        getAllRequest.onerror = (event) => {
            console.error("Error fetching data from DB:", event.target.error);
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
            const clearRequest = store.clear(); 
            
            clearRequest.onsuccess = () => {
                let itemsProcessed = 0;
                if (dataToSave.length === 0) {
                    resolve();
                    return;
                }
                dataToSave.forEach(house => {
                    const putRequest = store.put(house);
                    putRequest.onsuccess = () => {
                        itemsProcessed++;
                        // No specific action needed here per item, transaction.oncomplete handles overall success
                    };
                    putRequest.onerror = (event) => {
                        console.error(`Error putting item ID ${house.id} into DB:`, event.target.error);
                        // Don't reject immediately for single item failure in this batch operation
                    };
                });
            };
            clearRequest.onerror = (event) => {
                 console.error("Error clearing store:", event.target.error);
                 reject(event.target.error);
                 return; 
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

function initializeCommonDOMStuff() {
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
    handleHeaderScroll(); // Initial check

    const navLinks = document.querySelectorAll('nav ul li a');
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    navLinks.forEach(link => {
        const linkAttribute = link.getAttribute('href');
        if (linkAttribute) {
            const linkPath = linkAttribute.split('/').pop();
             if (linkPath === currentPath) {
                link.classList.add('active');
                link.setAttribute('aria-current', 'page');
            } else {
                link.classList.remove('active');
                link.removeAttribute('aria-current');
            }
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
    animateOnScroll(); // Initial check
}

document.addEventListener('DOMContentLoaded', async () => {
    try {
        await initDB();
        await loadHousesDataFromDB(); 
        initializeCommonDOMStuff();
        document.dispatchEvent(new CustomEvent('commonScriptsReady', { detail: { housesData, db } }));
    } catch (error) {
        console.error("Failed to initialize common scripts with DB, using defaults and attempting UI init:", error);
        if (housesData.length === 0) { // Ensure housesData has defaults if DB load failed catastrophically
            housesData = [...defaultInitialHousesData];
        }
        initializeCommonDOMStuff(); 
        document.dispatchEvent(new CustomEvent('commonScriptsReady', { detail: { housesData, db: null } }));
    }
});
