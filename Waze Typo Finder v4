// ==UserScript==
// @name         Waze Typo Finder v4
// @namespace    http://tampermonkey.net/
// @version      2026.01.31.4.0
// @description  Megkeresi az elírt városneveket és város nélküli POI-kat vizuális panellel
// @match        https://www.waze.com/editor*
// @match        https://www.waze.com/*/editor*
// @grant        none
// @author       cukkini
// ==/UserScript==

(function() {
    'use strict';

    let foundItems = [];

    function waitForWaze(tries = 1) {
        if (typeof W !== 'undefined' && W.model) {
            initUI();
            console.log('Waze Typo Finder betöltve!');
        } else if (tries < 100) {
            setTimeout(() => waitForWaze(tries + 1), 200);
        }
    }

    function initUI() {

        const style = document.createElement('style');
        style.textContent = `
            .typo-floating-panel {
                position: fixed;
                top: 150px;
                right: 20px;
                background: white;
                border: 2px solid #e74c3c;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                z-index: 10000;
                min-width: 350px;
                max-width: 500px;
                font-family: Arial, sans-serif;
            }
            .typo-header {
                background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
                color: white;
                padding: 10px 15px;
                cursor: move;
                border-radius: 6px 6px 0 0;
                display: flex;
                justify-content: space-between;
                align-items: center;
                user-select: none;
            }
            .typo-header-title {
                font-weight: bold;
                font-size: 14px;
            }
            .typo-minimize {
                cursor: pointer;
                font-size: 18px;
                padding: 0 5px;
                background: rgba(255,255,255,0.2);
                border-radius: 3px;
            }
            .typo-minimize:hover {
                background: rgba(255,255,255,0.3);
            }
            .typo-content {
                padding: 15px;
                max-height: 500px;
                overflow-y: auto;
            }
            .typo-content.minimized {
                display: none;
            }
            .typo-input-group {
                margin-bottom: 10px;
            }
            .typo-label {
                display: block;
                font-weight: bold;
                font-size: 12px;
                color: #333;
                margin-bottom: 5px;
            }
            .typo-checkboxes {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 8px;
                margin-bottom: 10px;
                padding: 10px;
                background: #f8f9fa;
                border-radius: 4px;
            }
            .typo-checkbox-item {
                display: flex;
                align-items: center;
                font-size: 12px;
            }
            .typo-checkbox-item input {
                margin-right: 5px;
                cursor: pointer;
            }
            .typo-checkbox-item label {
                cursor: pointer;
                user-select: none;
            }
            .typo-search-box {
                display: flex;
                gap: 10px;
            }
            .typo-input {
                flex: 1;
                padding: 8px;
                border: 1px solid #ddd;
                border-radius: 4px;
                font-size: 13px;
            }
            .typo-input:focus {
                outline: none;
                border-color: #e74c3c;
                box-shadow: 0 0 0 2px rgba(231,76,60,0.1);
            }
            .typo-btn {
                padding: 8px 15px;
                background: #e74c3c;
                color: white;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                font-size: 13px;
                font-weight: bold;
            }
            .typo-btn:hover {
                background: #c0392b;
            }
            .typo-btn:active {
                transform: scale(0.98);
            }
            .typo-results {
                margin-top: 15px;
            }
            .typo-count {
                font-size: 12px;
                color: #666;
                margin-bottom: 10px;
                padding: 5px;
                background: #f8f9fa;
                border-radius: 3px;
            }
            .typo-list {
                list-style: none;
                padding: 0;
                margin: 0;
            }
            .typo-item {
                padding: 10px;
                margin-bottom: 5px;
                background: #f8f9fa;
                border: 1px solid #e0e0e0;
                border-radius: 4px;
                cursor: pointer;
                transition: all 0.2s;
            }
            .typo-item:hover {
                background: #e8f4f8;
                border-color: #3498db;
                transform: translateX(3px);
            }
            .typo-item-type {
                display: inline-block;
                padding: 2px 6px;
                background: #3498db;
                color: white;
                font-size: 10px;
                border-radius: 3px;
                margin-right: 8px;
                font-weight: bold;
            }
            .typo-item-type.segment { background: #9b59b6; }
            .typo-item-type.venue { background: #e67e22; }
            .typo-item-type.city { background: #1abc9c; }
            .typo-item-type.no-city { background: #e74c3c; }
            .typo-item-name {
                font-weight: bold;
                font-size: 13px;
                color: #333;
            }
            .typo-item-city {
                font-size: 11px;
                color: #666;
                margin-top: 3px;
            }
            .typo-no-results {
                padding: 20px;
                text-align: center;
                color: #999;
                font-size: 13px;
            }
        `;
        document.head.appendChild(style);

        // Panel
        const panel = document.createElement('div');
        panel.className = 'typo-floating-panel';
        panel.innerHTML = `
            <div class="typo-header" id="typo-header">
                <span class="typo-header-title">🔍 Elírás Kereső v4</span>
                <span class="typo-minimize" id="typo-minimize">−</span>
            </div>
            <div class="typo-content" id="typo-content">
                <div class="typo-input-group">
                    <label class="typo-label">Keresendő szöveg:</label>
                    <div class="typo-search-box">
                        <input type="text"
                               id="typo-search-input"
                               class="typo-input"
                               placeholder="pl: Móricgáz">
                        <button id="typo-search-btn" class="typo-btn">Keresés</button>
                    </div>
                </div>
                <div class="typo-input-group">
                    <button id="typo-clear-btn" class="typo-btn" style="background: #95a5a6; width: 100%;">
                        🗑️ Lista törlése
                    </button>
                </div>
                <div class="typo-checkboxes">
                    <div class="typo-checkbox-item">
                        <input type="checkbox" id="search-city" checked>
                        <label for="search-city">🏙️ Városnév</label>
                    </div>
                    <div class="typo-checkbox-item">
                        <input type="checkbox" id="search-street" checked>
                        <label for="search-street">🛣️ Utcanév</label>
                    </div>
                    <div class="typo-checkbox-item">
                        <input type="checkbox" id="search-poi-name" checked>
                        <label for="search-poi-name">📍 POI név</label>
                    </div>
                    <div class="typo-checkbox-item">
                        <input type="checkbox" id="search-poi-desc" checked>
                        <label for="search-poi-desc">📝 POI leírás</label>
                    </div>
                    <div class="typo-checkbox-item">
                        <input type="checkbox" id="search-poi-no-city">
                        <label for="search-poi-no-city">🚫 POI város nélkül</label>
                    </div>
                </div>
                <div class="typo-results" id="typo-results" style="display:none;">
                    <div class="typo-count" id="typo-count">Találatok: 0</div>
                    <ul class="typo-list" id="typo-list"></ul>
                </div>
                <div class="typo-no-results" id="typo-no-results" style="display:none;">
                    Nincs találat
                </div>
            </div>
        `;

        document.body.appendChild(panel);


        document.getElementById('typo-search-btn').addEventListener('click', performSearch);
        document.getElementById('typo-search-input').addEventListener('keypress', function(e) {
            if (e.key === 'Enter') performSearch();
        });

        document.getElementById('typo-clear-btn').addEventListener('click', clearResults);


        const minimizeBtn = document.getElementById('typo-minimize');
        const content = document.getElementById('typo-content');
        minimizeBtn.addEventListener('click', function() {
            if (content.classList.contains('minimized')) {
                content.classList.remove('minimized');
                minimizeBtn.textContent = '−';
            } else {
                content.classList.add('minimized');
                minimizeBtn.textContent = '+';
            }
        });


        makeDraggable(panel);
    }


    const EXCLUDED_CATEGORIES = [
        'RIVER_STREAM',
        'CANAL',
        'LAKE_POND',
        'FOREST_GROVE',
        'JUNCTION',
        'SEA_LAKE_POOL',
        'ISLAND'
    ];

    function clearResults() {
        foundItems = [];
        document.getElementById('typo-results').style.display = 'none';
        document.getElementById('typo-no-results').style.display = 'none';
        //console.log('🗑️ Találatok törölve');
    }

    function performSearch() {
        const searchText = document.getElementById('typo-search-input').value.trim();

        // Checkboxok 
        const searchCity = document.getElementById('search-city').checked;
        const searchStreet = document.getElementById('search-street').checked;
        const searchPoiName = document.getElementById('search-poi-name').checked;
        const searchPoiDesc = document.getElementById('search-poi-desc').checked;
        const searchPoiNoCity = document.getElementById('search-poi-no-city').checked;

        // Ha "POI város nélkül" van kiválasztva, nem kell szöveg
        if (!searchPoiNoCity && !searchText) {
            alert('Kérlek írj be egy keresendő szöveget, vagy válaszd a "POI város nélkül" opciót!');
            return;
        }

        if (!searchCity && !searchStreet && !searchPoiName && !searchPoiDesc && !searchPoiNoCity) {
            alert('Legalább egy keresési területet válassz ki!');
            return;
        }

        foundItems = [];

        // Szegmensek keresése (csak ha van szöveg)
        if (searchText && (searchCity || searchStreet)) {
            for (let segId in W.model.segments.objects) {
                const segment = W.model.segments.objects[segId];
                const address = segment.attributes.primaryStreetID ?
                    W.model.streets.getObjectById(segment.attributes.primaryStreetID) : null;

                if (address) {
                    // Utcanév keresése
                    if (searchStreet && address.attributes.name && address.attributes.name.includes(searchText)) {
                        foundItems.push({
                            type: 'segment',
                            displayType: 'Utcanév',
                            id: segId,
                            name: address.attributes.name,
                            city: '',
                            obj: segment
                        });
                    }

                    // Városnév keresése
                    if (searchCity && address.attributes.cityID) {
                        const city = W.model.cities.getObjectById(address.attributes.cityID);
                        if (city && city.attributes.name && city.attributes.name.includes(searchText)) {
                            foundItems.push({
                                type: 'segment',
                                displayType: 'Szegment város',
                                id: segId,
                                name: address.attributes.name || 'Névtelen út',
                                city: city.attributes.name,
                                obj: segment
                            });
                        }
                    }
                }

                // Alternatív címek
                if (segment.attributes.streetIDs && (searchCity || searchStreet)) {
                    for (let i = 0; i < segment.attributes.streetIDs.length; i++) {
                        const altStreet = W.model.streets.getObjectById(segment.attributes.streetIDs[i]);
                        if (altStreet) {
                            // Alt utcanév
                            if (searchStreet && altStreet.attributes.name && altStreet.attributes.name.includes(searchText)) {
                                foundItems.push({
                                    type: 'segment',
                                    displayType: 'Utcanév (Alt)',
                                    id: segId,
                                    name: altStreet.attributes.name,
                                    city: '',
                                    obj: segment
                                });
                            }

                            // Alt városnév
                            if (searchCity && altStreet.attributes.cityID) {
                                const altCity = W.model.cities.getObjectById(altStreet.attributes.cityID);
                                if (altCity && altCity.attributes.name && altCity.attributes.name.includes(searchText)) {
                                    foundItems.push({
                                        type: 'segment',
                                        displayType: 'Szegment város (Alt)',
                                        id: segId,
                                        name: altStreet.attributes.name || 'Névtelen út',
                                        city: altCity.attributes.name,
                                        obj: segment
                                    });
                                }
                            }
                        }
                    }
                }
            }
        }

        // Poi eresése
        for (let venueId in W.model.venues.objects) {
            const venue = W.model.venues.objects[venueId];

            // Kizárjuk a területi POI-kat
            const hasExcludedCategory = venue.attributes.categories.some(cat =>
                EXCLUDED_CATEGORIES.includes(cat)
            );

            if (hasExcludedCategory) {
                continue; // Ugorjuk át ezt a POI-t
            }

            // POI kategória meghatározása (első kategória)
            const poiCategory = venue.attributes.categories[0] || 'UNKNOWN';

            // POI név keresése (ha van szöveg)
            if (searchText && searchPoiName && venue.attributes.name && venue.attributes.name.includes(searchText)) {
                foundItems.push({
                    type: 'venue',
                    displayType: 'POI név',
                    id: venueId,
                    name: venue.attributes.name,
                    category: poiCategory,
                    city: '',
                    obj: venue
                });
            }

            // POI város nélkül keresése
            if (searchPoiNoCity) {
                const venueAddress = venue.getAddress(W.model);
                let hasCity = false;

                if (venueAddress && venueAddress.attributes) {
                    // van-e cityName vagy city objektum
                    if (venueAddress.attributes.cityName) {
                        hasCity = true;
                    } else if (venueAddress.attributes.city && venueAddress.attributes.city.attributes && venueAddress.attributes.city.attributes.name) {
                        hasCity = true;
                    }
                }

                if (!hasCity) {
                    foundItems.push({
                        type: 'venue',
                        displayType: 'POI város nélkül',
                        className: 'no-city',
                        id: venueId,
                        name: venue.attributes.name || 'Névtelen POI',
                        category: poiCategory,
                        city: '⚠️ Nincs város beállítva',
                        obj: venue
                    });
                }
            }

            // POI cím városnév keresése (ha van szöveg)
            if (searchText && searchCity) {
                const venueAddress = venue.getAddress(W.model);
                if (venueAddress && venueAddress.attributes.city) {
                    const cityName = venueAddress.attributes.city.attributes.name;
                    if (cityName && cityName.includes(searchText)) {
                        foundItems.push({
                            type: 'venue',
                            displayType: 'POI város',
                            id: venueId,
                            name: venue.attributes.name || 'Névtelen',
                            category: poiCategory,
                            city: cityName,
                            obj: venue
                        });
                    }
                }
            }

            // POI leírás keresése (ha van szöveg)
            if (searchText && searchPoiDesc && venue.attributes.description && venue.attributes.description.includes(searchText)) {
                foundItems.push({
                    type: 'venue',
                    displayType: 'POI leírás',
                    id: venueId,
                    name: venue.attributes.name || 'Névtelen',
                    category: poiCategory,
                    city: '',
                    obj: venue
                });
            }
        }

        // Városok keresése (önálló város objektumok) (ha van szöveg)
        if (searchText && searchCity) {
            for (let cityId in W.model.cities.objects) {
                const city = W.model.cities.objects[cityId];
                if (city.attributes.name && city.attributes.name.includes(searchText)) {
                    foundItems.push({
                        type: 'city',
                        displayType: 'Város objektum',
                        id: cityId,
                        name: city.attributes.name,
                        city: '',
                        obj: city
                    });
                }
            }
        }

        displayResults();
    }

    function displayResults() {
        const resultsDiv = document.getElementById('typo-results');
        const noResultsDiv = document.getElementById('typo-no-results');
        const countDiv = document.getElementById('typo-count');
        const listDiv = document.getElementById('typo-list');

        if (foundItems.length === 0) {
            resultsDiv.style.display = 'none';
            noResultsDiv.style.display = 'block';
            return;
        }

        noResultsDiv.style.display = 'none';
        resultsDiv.style.display = 'block';
        countDiv.textContent = `Találatok: ${foundItems.length} db`;

        listDiv.innerHTML = '';
        foundItems.forEach((item, index) => {
            const li = document.createElement('li');
            li.className = 'typo-item';
            const typeClass = item.className || item.type;

            // POI kategória megjelenítése ha van
            const categoryBadge = item.category ?
                `<span class="typo-item-type" style="background: #16a085;">${item.category}</span>` : '';

            li.innerHTML = `
                <span class="typo-item-type ${typeClass}">${item.displayType}</span>
                ${categoryBadge}
                <div class="typo-item-name">${item.name}</div>
                ${item.city ? `<div class="typo-item-city">📍 ${item.city}</div>` : ''}
            `;
            li.addEventListener('click', () => selectFoundItem(index));
            listDiv.appendChild(li);
        });
    }

    function selectFoundItem(index) {
        const item = foundItems[index];
        //console.log(`🎯 Kiválasztva: ${item.name}`);

        if (item.type === 'segment') {
            W.selectionManager.setSelectedModels([item.obj]);
            const center = item.obj.geometry.getCentroid();
            W.map.setCenter([center.x, center.y]);
            W.map.zoomTo(5);
        } else if (item.type === 'venue') {
            W.selectionManager.setSelectedModels([item.obj]);
            const geom = item.obj.geometry;
            if (geom.getCentroid) {
                const center = geom.getCentroid();
                W.map.setCenter([center.x, center.y]);
            } else {
                W.map.setCenter([geom.x, geom.y]);
            }
            W.map.zoomTo(5);
        }
    }

    function makeDraggable(element) {
        const header = element.querySelector('#typo-header');
        let isDragging = false;
        let currentX, currentY, initialX, initialY;
        let xOffset = 0, yOffset = 0;

        header.addEventListener('mousedown', dragStart);
        document.addEventListener('mousemove', drag);
        document.addEventListener('mouseup', dragEnd);

        function dragStart(e) {
            initialX = e.clientX - xOffset;
            initialY = e.clientY - yOffset;
            if (e.target === header || header.contains(e.target)) {
                isDragging = true;
            }
        }

        function drag(e) {
            if (isDragging) {
                e.preventDefault();
                currentX = e.clientX - initialX;
                currentY = e.clientY - initialY;
                xOffset = currentX;
                yOffset = currentY;
                element.style.transform = `translate(${currentX}px, ${currentY}px)`;
            }
        }

        function dragEnd(e) {
            initialX = currentX;
            initialY = currentY;
            isDragging = false;
        }
    }

    waitForWaze();
})();
