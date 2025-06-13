

document.addEventListener('commonScriptsReady', () => {
    initializeHousesPage();
});

function initializeHousesPage() {
    const propertyGridHouses = document.getElementById('property-grid-houses');
    const filterTypeSelect = document.getElementById('filter-type');
    const sortPriceSelect = document.getElementById('sort-price');
    const applyFiltersButton = document.getElementById('apply-filters');

    function createPropertyCard(house) {
        const card = document.createElement('div');
        card.className = 'property-card';
        
        const secondaryInfo = `${house.type || 'N/A'} - ${house.sqft || 'N/A'}`;

        // Main card content (image, divider, details)
        let cardHTML = `
            <a href="house-detail.html?id=${house.id}" class="property-card-image-link" aria-label="View details for ${house.name}">
                <img src="${house.image || 'https://via.placeholder.com/400x250.png?text=No+Image'}" alt="${house.name}" class="property-card-image">
            </a>
            <hr class="property-card-divider">
            <div class="property-card-details">
                <div class="property-card-info">
                    <h3 class="property-card-name"><a href="house-detail.html?id=${house.id}" class="property-card-name-link">${house.name}</a></h3>
                    <p class="property-card-secondary-info">${secondaryInfo}</p>
                </div>
                <p class="property-card-price">${house.price}</p>
            </div>
        `;
        
        // Action button
        const actionHTML = `
            <div class="property-card-action">
                <a href="house-detail.html?id=${house.id}" class="btn btn-secondary property-card-button">View Details</a>
            </div>
        `;

        card.innerHTML = cardHTML + actionHTML;
        return card;
    }

    function displayProperties(propertiesToDisplay) {
        if (!propertyGridHouses) return;
        propertyGridHouses.innerHTML = '';
        if (propertiesToDisplay.length === 0) {
            propertyGridHouses.innerHTML = '<p class="text-center" style="grid-column: 1 / -1;">No properties match your criteria.</p>';
            return;
        }
        propertiesToDisplay.forEach((house, index) => {
            const card = createPropertyCard(house);
            // Apply staggered animation delay if desired (can be complex with filtering)
            // card.style.animationDelay = `${index * 0.1}s`; 
            propertyGridHouses.appendChild(card);
        });
    }

    function applyHouseFiltersAndSort() {
        if (!propertyGridHouses || !housesData) return; // Wait for housesData
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

    if (propertyGridHouses) applyHouseFiltersAndSort(); // Initial display
    if (applyFiltersButton) applyFiltersButton.addEventListener('click', applyHouseFiltersAndSort);
    if (filterTypeSelect) filterTypeSelect.addEventListener('change', applyHouseFiltersAndSort);
    if (sortPriceSelect) sortPriceSelect.addEventListener('change', applyHouseFiltersAndSort);
}