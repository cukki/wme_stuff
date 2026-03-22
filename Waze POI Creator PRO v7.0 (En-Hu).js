// ==UserScript==
// @name         Waze POI Creator PRO v7.0 (En-Hu)
// @namespace    http://tampermonkey.net/
// @version      2026.01.16.7.0
// @description  Create POI with F9 key, point or area. 
// @match        https://www.waze.com/editor*
// @match        https://www.waze.com/*/editor*
// @grant        none
// @author       cukkini
// ==/UserScript==

(function() {
    'use strict';
    // nyelv észlelés
    const userLang = navigator.language || navigator.userLanguage;
    const isHungarian = userLang.startsWith('hu');
    // fordítások
    const t = isHungarian ? {
        title: "WME POI Creator PRO v7.1",
        poiName: "POI neve:",
        poiNamePlaceholder: "POI név",
        cityName: "Városnév:",
        cityNamePlaceholder: "Város neve",
        forestMode: "🌳 Erdő rajzolás (gyors)",
        postOfficeMode: "📦 Csomagautomata (gyors)",
        advancedToggle: "⚙️ Haladó: Egyéni POI választása",
        advancedToggleActive: "⚙️ Haladó mód aktív",
        poiType: "POI típus:",
        poiTypePoint: "📍 Pont alapú",
        poiTypeArea: "🗺️ Terület alapú (rajzolás)",
        poiCategory: "POI kategória:",
        usageTitle: "Használat:",
        usageFast: "• <strong>Gyors módok:</strong> Pipáld be, nyomd meg F9",
        usageAdvanced: "• <strong>Haladó mód:</strong> Nyisd ki, válassz kategóriát, F9",
        usageDrawing: "• <strong>Rajzolás:</strong> Kurzorral elhelyezed a pontokat, utolsónál duplaklikk.",
        alertNoName: "⚠️ Add meg a POI nevét!",
        alreadyDrawing: "⚠️ Már rajzolás módban vagy!"
    } : {
        title: "WME POI Creator PRO v7.1",
        poiName: "POI name:",
        poiNamePlaceholder: "POI name",
        cityName: "City name:",
        cityNamePlaceholder: "City name",
        forestMode: "🌳 Draw forest (quick-mode)",
        postOfficeMode: "📦 Package locker (quick-mode)",
        advancedToggle: "⚙️ Advanced: Choose custom POI",
        advancedToggleActive: "⚙️ Advanced mode active",
        poiType: "POI type:",
        poiTypePoint: "📍 Point-based",
        poiTypeArea: "🗺️ Area-based (drawing)",
        poiCategory: "POI category:",
        usageTitle: "Usage:",
        usageFast: "• <strong>Quick modes:</strong> Check box, press F9",
        usageAdvanced: "• <strong>Advanced mode:</strong> Open, select category, F9",
        usageDrawing: "• <strong>Drawing:</strong> Click, draw the desired area on last point double click",
        alertNoName: "⚠️ Please enter POI name!",
        alreadyDrawing: "⚠️ Already in drawing mode!"
    };
    // POI CAT (Bilingual, ABC)
    const POI_CATEGORIES_HU = [
        {value: "AIRPORT", label: "Repülőtér"},
        {value: "ARTS_ENTERTAINMENT", label: "Művészet és szórakozás"},
        {value: "ATM", label: "ATM / Bankautomata"},
        {value: "BANK_FINANCIAL", label: "Bank / Pénzügy"},
        {value: "BAR", label: "Bár / Kocsma"},
        {value: "BEACH", label: "Strand"},
        {value: "BOOKSTORE", label: "Könyvesbolt"},
        {value: "BRIDGE", label: "Híd"},
        {value: "BUS_STATION", label: "Buszpályaudvar"},
        {value: "CAFE", label: "Kávézó"},
        {value: "CAR_DEALER", label: "Autókereskedés"},
        {value: "CAR_REPAIR", label: "Autószerelő"},
        {value: "CAR_WASH", label: "Autómosó"},
        {value: "CEMETERY", label: "Temető"},
        {value: "CINEMA", label: "Mozi"},
        {value: "CLOTHING_STORE", label: "Ruházati bolt"},
        {value: "COLLEGE_UNIVERSITY", label: "Főiskola / Egyetem"},
        {value: "CONSTRUCTION_SITE", label: "Építkezés"},
        {value: "CONVENIENCE_STORE", label: "Kisbolt / ABC"},
        {value: "ELECTRONICS_STORE", label: "Elektronikai bolt"},
        {value: "EMBASSY_CONSULATE", label: "Nagykövetség / Konzulátus"},
        {value: "FACTORY_INDUSTRIAL", label: "Gyár / Ipari létesítmény"},
        {value: "FARM", label: "Tanya"},
        {value: "FAST_FOOD", label: "Gyorsétterem"},
        {value: "FIRE_DEPARTMENT", label: "Tűzoltóság"},
        {value: "FOREST_GROVE", label: "Erdő"},
        {value: "FURNITURE_HOME_STORE", label: "Bútor / Lakberendezés"},
        {value: "GAS_STATION", label: "Benzinkút"},
        {value: "GIFT_SHOP", label: "Ajándékbolt"},
        {value: "GOVERNMENT", label: "Kormányhivatal"},
        {value: "GYM_FITNESS", label: "Edzőterem / Fitness"},
        {value: "HOSPITAL_MEDICAL_CARE", label: "Kórház"},
        {value: "HOSPITAL_URGENT_CARE", label: "Sürgősségi ellátás"},
        {value: "HOTEL", label: "Szálloda"},
        {value: "JUNCTION", label: "Csomópont"},
        {value: "LIBRARY", label: "Könyvtár"},
        {value: "MARKET", label: "Piac"},
        {value: "MOTORCYCLE_DEALER", label: "Motorkereskedés"},
        {value: "MUSEUM", label: "Múzeum"},
        {value: "OFFICES", label: "Irodaház"},
        {value: "ORGANIZATION", label: "Szervezet"},
        {value: "PARK", label: "Park"},
        {value: "PARKING_LOT", label: "Parkoló"},
        {value: "PET_STORE", label: "Állateledel bolt"},
        {value: "PHARMACY", label: "Gyógyszertár"},
        {value: "PLAYGROUND", label: "Játszótér"},
        {value: "POLICE_STATION", label: "Rendőrség"},
        {value: "POST_OFFICE", label: "Posta / Csomagautomata"},
        {value: "PROFESSIONAL_OTHER_SERVICES", label: "Szakmai szolgáltatások"},
        {value: "RELIGIOUS_CENTER", label: "Vallási központ"},
        {value: "RESTAURANT", label: "Étterem"},
        {value: "SCHOOL", label: "Iskola"},
        {value: "SEAPORT", label: "Kikötő"},
        {value: "SHOPPING_CENTER", label: "Bevásárlóközpont"},
        {value: "SPORTING_GOODS", label: "Sportbolt"},
        {value: "SPORTS_COURT", label: "Sportpálya"},
        {value: "SPORTS_FIELD", label: "Sportterület"},
        {value: "STADIUM_ARENA", label: "Stadion / Aréna"},
        {value: "SUBWAY_STATION", label: "Metróállomás"},
        {value: "SUPERMARKET_GROCERY", label: "Szupermarket"},
        {value: "SWIMMING_POOL", label: "Uszoda"},
        {value: "TAXI_STATION", label: "Taxiállomás"},
        {value: "THEATER", label: "Színház"},
        {value: "TOURIST_ATTRACTION", label: "Látnivaló"},
        {value: "TOURIST_SITE", label: "Turista hely"},
        {value: "TRAIN_STATION", label: "Vasútállomás"},
        {value: "TRUCK_DEALER", label: "Teherautó kereskedés"},
        {value: "TUNNEL", label: "Alagút"}
    ].sort((a, b) => a.label.localeCompare(b.label, 'hu'));

    const POI_CATEGORIES_EN = [
        {value: "AIRPORT", label: "Airport"},
        {value: "ARTS_ENTERTAINMENT", label: "Arts & Entertainment"},
        {value: "ATM", label: "ATM"},
        {value: "BANK_FINANCIAL", label: "Bank / Financial"},
        {value: "BAR", label: "Bar"},
        {value: "BEACH", label: "Beach"},
        {value: "BOOKSTORE", label: "Bookstore"},
        {value: "BRIDGE", label: "Bridge"},
        {value: "BUS_STATION", label: "Bus Station"},
        {value: "CAFE", label: "Cafe"},
        {value: "CAR_DEALER", label: "Car Dealer"},
        {value: "CAR_REPAIR", label: "Car Repair"},
        {value: "CAR_WASH", label: "Car Wash"},
        {value: "CEMETERY", label: "Cemetery"},
        {value: "CINEMA", label: "Cinema"},
        {value: "CLOTHING_STORE", label: "Clothing Store"},
        {value: "COLLEGE_UNIVERSITY", label: "College / University"},
        {value: "CONSTRUCTION_SITE", label: "Construction Site"},
        {value: "CONVENIENCE_STORE", label: "Convenience Store"},
        {value: "ELECTRONICS_STORE", label: "Electronics Store"},
        {value: "EMBASSY_CONSULATE", label: "Embassy / Consulate"},
        {value: "FACTORY_INDUSTRIAL", label: "Factory / Industrial"},
        {value: "FARM", label: "Farm"},
        {value: "FAST_FOOD", label: "Fast Food"},
        {value: "FIRE_DEPARTMENT", label: "Fire Department"},
        {value: "FOREST_GROVE", label: "Forest / Grove"},
        {value: "FURNITURE_HOME_STORE", label: "Furniture / Home Store"},
        {value: "GAS_STATION", label: "Gas Station"},
        {value: "GIFT_SHOP", label: "Gift Shop"},
        {value: "GOVERNMENT", label: "Government"},
        {value: "GYM_FITNESS", label: "Gym / Fitness"},
        {value: "HOSPITAL_MEDICAL_CARE", label: "Hospital"},
        {value: "HOSPITAL_URGENT_CARE", label: "Urgent Care"},
        {value: "HOTEL", label: "Hotel"},
        {value: "JUNCTION", label: "Junction"},
        {value: "LIBRARY", label: "Library"},
        {value: "MARKET", label: "Market"},
        {value: "MOTORCYCLE_DEALER", label: "Motorcycle Dealer"},
        {value: "MUSEUM", label: "Museum"},
        {value: "OFFICES", label: "Offices"},
        {value: "ORGANIZATION", label: "Organization"},
        {value: "PARK", label: "Park"},
        {value: "PARKING_LOT", label: "Parking Lot"},
        {value: "PET_STORE", label: "Pet Store"},
        {value: "PHARMACY", label: "Pharmacy"},
        {value: "PLAYGROUND", label: "Playground"},
        {value: "POLICE_STATION", label: "Police Station"},
        {value: "POST_OFFICE", label: "Post Office / Package Locker"},
        {value: "PROFESSIONAL_OTHER_SERVICES", label: "Professional Services"},
        {value: "RELIGIOUS_CENTER", label: "Religious Center"},
        {value: "RESTAURANT", label: "Restaurant"},
        {value: "SCHOOL", label: "School"},
        {value: "SEAPORT", label: "Seaport"},
        {value: "SHOPPING_CENTER", label: "Shopping Center"},
        {value: "SPORTING_GOODS", label: "Sporting Goods"},
        {value: "SPORTS_COURT", label: "Sports Court"},
        {value: "SPORTS_FIELD", label: "Sports Field"},
        {value: "STADIUM_ARENA", label: "Stadium / Arena"},
        {value: "SUBWAY_STATION", label: "Subway Station"},
        {value: "SUPERMARKET_GROCERY", label: "Supermarket / Grocery"},
        {value: "SWIMMING_POOL", label: "Swimming Pool"},
        {value: "TAXI_STATION", label: "Taxi Station"},
        {value: "THEATER", label: "Theater"},
        {value: "TOURIST_ATTRACTION", label: "Tourist Attraction"},
        {value: "TOURIST_SITE", label: "Tourist Site"},
        {value: "TRAIN_STATION", label: "Train Station"},
        {value: "TRUCK_DEALER", label: "Truck Dealer"},
        {value: "TUNNEL", label: "Tunnel"}
    ].sort((a, b) => a.label.localeCompare(b.label, 'en'));

    const POI_CATEGORIES = isHungarian ? POI_CATEGORIES_HU : POI_CATEGORIES_EN;

    // ========================================
    // WAZE INITIALIZATION
    // ========================================

    function waitForWaze(tries = 1) {
        if (typeof W !== 'undefined' && W.map) {
            initUI();
        } else if (tries < 100) {
            setTimeout(() => waitForWaze(tries + 1), 200);
        }
    }

    // ========================================
    // UI INITIALIZATION
    // ========================================

    function initUI() {
        const style = document.createElement('style');
        style.textContent = `
            .tanya-floating-panel {
                position: fixed;
                top: 80px;
                right: 20px;
                background: linear-gradient(135deg, #2d2d2d 0%, #1a1a1a 100%);
                border: 2px solid #3a3a3a;
                border-radius: 8px;
                box-shadow: 0 8px 24px rgba(0,0,0,0.4);
                z-index: 10000;
                min-width: 320px;
                max-width: 400px;
                font-family: 'Rubik', sans-serif;
            }
            .tanya-header {
                background: linear-gradient(135deg, #4a4a4a 0%, #2d2d2d 100%);
                color: #e0e0e0;
                padding: 10px 15px;
                cursor: move;
                border-radius: 6px 6px 0 0;
                display: flex;
                justify-content: space-between;
                align-items: center;
                user-select: none;
                border-bottom: 1px solid #555;
            }
            .tanya-header-title {
                font-weight: 600;
                font-size: 14px;
            }
            .tanya-minimize {
                cursor: pointer;
                font-size: 18px;
                padding: 0 8px;
                background: rgba(255,255,255,0.1);
                border-radius: 3px;
                color: #d0d0d0;
            }
            .tanya-minimize:hover {
                background: rgba(255,255,255,0.2);
            }
            .tanya-content {
                padding: 15px;
                max-height: 70vh;
                overflow-y: auto;
                background: #1a1a1a;
                border-radius: 0 0 6px 6px;
            }
            .tanya-input-group {
                margin-bottom: 12px;
            }
            .tanya-label {
                display: block;
                font-weight: 600;
                font-size: 12px;
                color: #c0c0c0;
                margin-bottom: 6px;
            }
            .tanya-input {
                width: 100%;
                padding: 8px;
                border: 1px solid #3a3a3a;
                border-radius: 4px;
                font-size: 13px;
                box-sizing: border-box;
                background: #2d2d2d;
color: #ffffff !important;
            }
            .tanya-input:focus {
                outline: none;
                border-color: #555;
                box-shadow: 0 0 0 2px rgba(85,85,85,0.3);
            }
            .tanya-input::placeholder {
                color: #666;
            }
            .tanya-checkbox-group {
                margin-bottom: 12px;
                padding: 12px;
                background: #2d2d2d;
                border-radius: 4px;
                border: 1px solid #3a3a3a;
            }
            .tanya-checkbox-item {
                display: flex;
                align-items: center;
                font-size: 12px;
                margin-bottom: 8px;
                color: #c0c0c0;
            }
            .tanya-checkbox-item:last-child {
                margin-bottom: 0;
            }
            .tanya-checkbox-item input {
                margin-right: 8px;
                cursor: pointer;
            }
            .tanya-checkbox-item label {
                cursor: pointer;
                user-select: none;
            }
            .tanya-advanced-toggle {
                background: linear-gradient(135deg, #4a4a4a 0%, #3a3a3a 100%);
                color: #e0e0e0;
                border: 1px solid #555;
                padding: 10px;
                border-radius: 6px;
                cursor: pointer;
                font-size: 13px;
                font-weight: 600;
                width: 100%;
                margin-bottom: 12px;
                transition: all 0.2s;
            }
            .tanya-advanced-toggle:hover {
                background: linear-gradient(135deg, #555 0%, #444 100%);
            }
            .tanya-advanced-toggle.active {
                background: linear-gradient(135deg, #666 0%, #555 100%);
                border-color: #777;
            }
            .tanya-advanced-section {
                display: none;
                border: 2px solid #3a3a3a;
                border-radius: 6px;
                padding: 12px;
                margin-bottom: 12px;
                background: #2d2d2d;
            }
            .tanya-advanced-section.visible {
                display: block;
            }
            .tanya-radio-group {
                margin-bottom: 12px;
            }
            .tanya-radio-item {
                display: flex;
                align-items: center;
                margin-bottom: 8px;
                font-size: 12px;
                color: #c0c0c0;
            }
            .tanya-radio-item input {
                margin-right: 8px;
                cursor: pointer;
            }
            .tanya-radio-item label {
                cursor: pointer;
                user-select: none;
            }
            .tanya-select {
                width: 100%;
                padding: 8px;
                border: 1px solid #3a3a3a;
                border-radius: 4px;
                font-size: 12px;
                max-height: 200px;
                cursor: pointer;
                background: #2d2d2d;
                color: #e0e0e0;
            }
            .tanya-select:focus {
                outline: none;
                border-color: #555;
                box-shadow: 0 0 0 2px rgba(85,85,85,0.3);
            }
            .tanya-select option {
                background: #2d2d2d;
                color: #e0e0e0;
            }
            .tanya-info {
                font-size: 11px;
                color: #999;
                margin-top: 10px;
                padding: 10px;
                background: #2d2d2d;
                border-radius: 4px;
                border-left: 3px solid #555;
            }
            .tanya-content.minimized {
                display: none;
            }

            /* Scrollbar styling for dark theme */
            .tanya-content::-webkit-scrollbar {
                width: 8px;
            }
            .tanya-content::-webkit-scrollbar-track {
                background: #1a1a1a;
            }
            .tanya-content::-webkit-scrollbar-thumb {
                background: #3a3a3a;
                border-radius: 4px;
            }
            .tanya-content::-webkit-scrollbar-thumb:hover {
                background: #4a4a4a;
            }
        `;
        document.head.appendChild(style);

        // Generate POI category options
        const poiOptions = POI_CATEGORIES.map(cat =>
            `<option value="${cat.value}">${cat.label}</option>`
        ).join('');

        // Floating panel
        const panel = document.createElement('div');
        panel.className = 'tanya-floating-panel';
        panel.innerHTML = `
            <div class="tanya-header" id="tanya-header">
                <span class="tanya-header-title">${t.title}</span>
                <span class="tanya-minimize" id="tanya-minimize">−</span>
            </div>
            <div class="tanya-content" id="tanya-content">
                <div class="tanya-input-group">
                    <label class="tanya-label">${t.poiName}</label>
                    <input type="text"
                           id="tanya-name-input"
                           class="tanya-input"
                           placeholder="${t.poiNamePlaceholder}">
                </div>
                <div class="tanya-input-group">
                    <label class="tanya-label">${t.cityName}</label>
                    <input type="text"
                           id="tanya-city-input"
                           class="tanya-input"
                           placeholder="${t.cityNamePlaceholder}">
                </div>

<div class="tanya-checkbox-group">
    <div class="tanya-radio-item">
        <input type="radio" id="draw-forest-mode" name="quick-mode" value="forest">
        <label for="draw-forest-mode">${t.forestMode}</label>
    </div>
    <div class="tanya-radio-item">
        <input type="radio" id="add-post-office-mode" name="quick-mode" value="post">
        <label for="add-post-office-mode">${t.postOfficeMode}</label>
    </div>
    <div class="tanya-radio-item">
        <input type="radio" id="default-farm-mode" name="quick-mode" value="farm" checked>
        <label for="default-farm-mode">${isHungarian ? '🏠 Tanya (alapértelmezett)' : '🏠 Farm (default)'}</label>
    </div>
</div>

                <button class="tanya-advanced-toggle" id="advanced-toggle">
                    ${t.advancedToggle}
                </button>

                <div class="tanya-advanced-section" id="advanced-section">
                    <div class="tanya-radio-group">
                        <label class="tanya-label">${t.poiType}</label>
                        <div class="tanya-radio-item">
                            <input type="radio" id="poi-type-point" name="poi-type" value="point" checked>
                            <label for="poi-type-point">${t.poiTypePoint}</label>
                        </div>
                        <div class="tanya-radio-item">
                            <input type="radio" id="poi-type-area" name="poi-type" value="area">
                            <label for="poi-type-area">${t.poiTypeArea}</label>
                        </div>
                    </div>

                    <div class="tanya-input-group">
                        <label class="tanya-label">${t.poiCategory}</label>
                        <select id="poi-category-select" class="tanya-select" size="8">
                            ${poiOptions}
                        </select>
                    </div>
                </div>

                <div class="tanya-info">
                    <strong>${t.usageTitle}</strong><br>
                    ${t.usageFast}<br>
                    ${t.usageAdvanced}<br>
                    ${t.usageDrawing}
                </div>
            </div>
        `;

        document.body.appendChild(panel);

        // Advanced toggle
        const advancedToggle = document.getElementById('advanced-toggle');
        const advancedSection = document.getElementById('advanced-section');

        advancedToggle.addEventListener('click', function() {
            if (advancedSection.classList.contains('visible')) {
                advancedSection.classList.remove('visible');
                advancedToggle.classList.remove('active');
                advancedToggle.textContent = t.advancedToggle;
            } else {
                advancedSection.classList.add('visible');
                advancedToggle.classList.add('active');
                advancedToggle.textContent = t.advancedToggleActive;
            }
        });

        // Minimize/Maximize
        const minimizeBtn = document.getElementById('tanya-minimize');
        const content = document.getElementById('tanya-content');

        minimizeBtn.addEventListener('click', function() {
            if (content.classList.contains('minimized')) {
                content.classList.remove('minimized');
                minimizeBtn.textContent = '−';
            } else {
                content.classList.add('minimized');
                minimizeBtn.textContent = '+';
            }
        });

        // Drag & Drop
        makeDraggable(panel);

       // console.log(`Betöltve (${isHungarian ? 'Magyar' : 'English'})`);
    }

    // ========================================
    // DRAGGABLE PANEL
    // ========================================

    function makeDraggable(element) {
        const header = element.querySelector('#tanya-header');
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
                setTranslate(currentX, currentY, element);
            }
        }

        function dragEnd(e) {
            initialX = currentX;
            initialY = currentY;
            isDragging = false;
        }

        function setTranslate(xPos, yPos, el) {
            el.style.transform = `translate(${xPos}px, ${yPos}px)`;
        }
    }

    // Rajz
    let isDrawing = false;
    let drawControl = null;
    let tempLayer = null;
    let pendingCategory = null;
    // F9, de ezt belehet állítani bármire
   document.addEventListener('keydown', function(e) {
    if (e.key === 'F9' || e.keyCode === 120) {
        e.preventDefault();

        if (typeof W === 'undefined' || !W.map) return;
        //Haladó mód (ha nyitva van, akkor az a radio érvényesül)
        const advancedSection = document.getElementById('advanced-section');
        if (advancedSection && advancedSection.classList.contains('visible')) {
            const categorySelect = document.getElementById('poi-category-select');
            const selectedCategory = categorySelect.value;

            const poiTypeArea = document.getElementById('poi-type-area');
            const isArea = poiTypeArea && poiTypeArea.checked;

            if (isArea) {
                startDrawing(selectedCategory);
            } else {
                createPOI(selectedCategory, false);
            }
            return; // kilép, nem megy tovább!
        }

        //Gyors módok radio
        const quickMode = document.querySelector('input[name="quick-mode"]:checked');

        if (quickMode) {
            const mode = quickMode.value;

            if (mode === 'forest') {
                startDrawing('FOREST_GROVE');
                return;
            } else if (mode === 'post') {
                createPOI('POST_OFFICE', false);
                return;
            } else if (mode === 'farm') {
                createPOI('FARM', false);
                return;
            }
        }
        // fallback semmi nincs kiválasztva
        createPOI('FARM', false);

    } else if (e.key === 'Escape' && isDrawing) {
        stopDrawing();
    }
}, true);
    // poi létrehozás, sdk nélkül
    function createPOI(category, isArea) {
        const nameInput = document.getElementById('tanya-name-input');
        let poiName = nameInput ? nameInput.value.trim() : 'POI';

        const cityInput = document.getElementById('tanya-city-input');
        let cityName = cityInput ? cityInput.value.trim() : '';

        if (!poiName) {
            alert(t.alertNoName);
            return;
        }
        // Extra space, wme kiveszi... Ennek a xy tanya 345 nél van jelentösége, f9 után elegendő csak a számot beírni.
        if (category === 'FARM' && !poiName.endsWith(' ')) {
            poiName = poiName + ' ';
        }

        const center = W.map.getCenter();
        const centerPoint = new OpenLayers.Geometry.Point(center.lon, center.lat);

        const PlaceObject = require("Waze/Feature/Vector/Landmark");
        const AddPlace = require("Waze/Action/AddLandmark");

        const newPlace = new PlaceObject({
            geoJSONGeometry: W.userscripts.toGeoJSONGeometry(centerPoint)
        });

        newPlace.attributes.categories.push(category);
        newPlace.attributes.name = poiName;
        newPlace.attributes.lockRank = 0;

        W.model.actionManager.add(new AddPlace(newPlace));

        if (cityName) {
            setPlaceCity(newPlace, cityName, centerPoint);
        } else {
            //console.log(`${category} POI létrehozva: ${poiName} (no city)`);
        }

        W.selectionManager.setSelectedModels([newPlace]);
    }

    function setPlaceCity(place, cityName, centerPoint) {
        let closestSegment = null;
        let closestDistance = Infinity;

        for (let segId in W.model.segments.objects) {
            const segment = W.model.segments.objects[segId];
            if (segment.geometry) {
                const segmentCenter = segment.geometry.getCentroid();
                const distance = centerPoint.distanceTo(segmentCenter);

                if (distance < closestDistance) {
                    closestDistance = distance;
                    closestSegment = segment;
                }
            }
        }

        if (closestSegment && closestSegment.attributes.primaryStreetID) {
            const street = W.model.streets.getObjectById(closestSegment.attributes.primaryStreetID);
            if (street && street.attributes.cityID) {
                const city = W.model.cities.getObjectById(street.attributes.cityID);
                if (city) {
                    const UpdateFeatureAddress = require('Waze/Action/UpdateFeatureAddress');
                    const MultiAction = require('Waze/Action/MultiAction');
                    const multiaction = new MultiAction();

                    const newAttributes = {
                        countryID: city.attributes.countryID,
                        stateID: city.attributes.stateID,
                        cityName: cityName,
                        emptyCity: null,
                        emptyStreet: true
                    };

                    const UFA = new UpdateFeatureAddress(place, newAttributes);
                    multiaction.doSubAction(W.model, UFA);
                    W.model.actionManager.add(multiaction);

                    //console.log(`${place.attributes.categories[0]} POI létrehozva: ${place.attributes.name} (${cityName})`);
                }
            }
        }
    }

    // ========================================
    // DRAWING FUNCTIONS
    // ========================================

    function startDrawing(category) {
        if (isDrawing) {
            console.log(t.alreadyDrawing);
            return;
        }

        pendingCategory = category;
        isDrawing = true;
        //console.log(`${category} rajzolás mód aktív`);

        tempLayer = new OpenLayers.Layer.Vector("TempDrawLayer", {
            displayInLayerSwitcher: false,
            uniqueName: "__TempDrawLayer"
        });
        W.map.addLayer(tempLayer);

        drawControl = new OpenLayers.Control.DrawFeature(tempLayer, OpenLayers.Handler.Polygon, {
            callbacks: {
                done: onDrawingDone
            }
        });

        W.map.addControl(drawControl);
        drawControl.activate();

        document.addEventListener('keydown', drawKeyHandler);
    }

    function drawKeyHandler(e) {
        if (!isDrawing) return;

        if (e.key === 'Enter') {
            if (drawControl && drawControl.handler) {
                drawControl.handler.finishGeometry();
            }
        } else if (e.key === 'z' && e.ctrlKey) {
            if (drawControl && drawControl.handler) {
                drawControl.undo();
            }
        }
    }

    function onDrawingDone(geometry) {
        console.log(`🖊️ ${pendingCategory} area drawn, creating...`);

        const nameInput = document.getElementById('tanya-name-input');
        let poiName = nameInput ? nameInput.value.trim() : pendingCategory;

        const cityInput = document.getElementById('tanya-city-input');
        let cityName = cityInput ? cityInput.value.trim() : '';

        const PlaceObject = require("Waze/Feature/Vector/Landmark");
        const AddPlace = require("Waze/Action/AddLandmark");

        const newPlace = new PlaceObject({
            geoJSONGeometry: W.userscripts.toGeoJSONGeometry(geometry)
        });

        newPlace.attributes.categories.push(pendingCategory);
        newPlace.attributes.name = poiName;
        newPlace.attributes.lockRank = 0;

        W.model.actionManager.add(new AddPlace(newPlace));

        if (cityName) {
            const centroid = geometry.getCentroid();
            setPlaceCity(newPlace, cityName, centroid);
        }

        W.selectionManager.setSelectedModels([newPlace]);

        stopDrawing();
    }

    function stopDrawing() {
        if (!isDrawing) return;

        isDrawing = false;
        pendingCategory = null;

        if (drawControl) {
            drawControl.deactivate();
            W.map.removeControl(drawControl);
            drawControl = null;
        }

        if (tempLayer) {
            W.map.removeLayer(tempLayer);
            tempLayer = null;
        }

        document.removeEventListener('keydown', drawKeyHandler);
    }

    waitForWaze();
})();
