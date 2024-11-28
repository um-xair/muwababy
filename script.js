var storeData = {
    johor: {
        johor_bahru_ulu_tiram: [
            { lat: 1.5447444806203974, lng: 103.77255911483483, name: 'Little Genius (Tebrau)', address: 'Johor Bahru, Johor', photo: 'https://shorturl.at/wxWiP' },
            { lat: 1.552259247971418, lng: 103.7474106101468, name: 'Fabbie Baby Mart (Adda Height)', address: 'Johor Bahru, Johor', photo: 'https://shorturl.at/wxWiP' }
        ],
        batu_pahat: [
            { lat: 1.8541701249651763, lng: 102.92954834734908, name: 'Baby Shop Batu Pahat', address: 'Batu Pahat, Johor', photo: 'https://shorturl.at/wxWiP' },
            { lat: 1.8613476570539162, lng: 102.9291523473625, name: 'Cute Baby Store (Batu Pahat)', address: 'Batu Pahat, Johor', photo: 'https://shorturl.at/wxWiP' },
            { lat: 1.874467793633227, lng: 102.94333730190726, name: 'Mom & Baby Love Trading', address: 'Batu Pahat, Johor', photo: 'https://shorturl.at/wxWiP' },
            { lat: 1.8669001460492949, lng: 102.93112970188905, name: 'Sunshine Baby Shop', address: 'Batu Pahat, Johor', photo: 'https://shorturl.at/wxWiP' }
        ],
        kluang_yong_peng: [
            { lat: 2.019211528266188, lng: 103.0693452250456, name: 'Little Kid Nest (Yong Peng)', address: 'Yong Peng, Johor', photo: 'https://shorturl.at/wxWiP' }
        ]
    },
    kuala_lumpur: {
        shah_alam: [
            { lat: 3.0738, lng: 101.5183, name: 'Store in Shah Alam', address: 'Shah Alam, Kuala Lumpur', photo: 'https://shorturl.at/wxWiP' }
        ],
        bukit_bintang: [
            { lat: 3.1455, lng: 101.7100, name: 'Store in Bukit Bintang', address: 'Bukit Bintang, Kuala Lumpur', photo: 'https://shorturl.at/wxWiP' }
        ]
    }
};

var map;
var directionsService;
var directionsRenderer;
var markers = [];

function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 7,
        center: { lat: 3.1390, lng: 101.6869 }
    });
    directionsService = new google.maps.DirectionsService();
    directionsRenderer = new google.maps.DirectionsRenderer();
    directionsRenderer.setMap(map);
}

function updateDistricts() {
    var selectedState = document.getElementById('stateDropdown').value;
    var districtDropdown = document.getElementById('districtDropdown');
    districtDropdown.innerHTML = '<option value="">Select District</option>'; // Clear districts

    if (selectedState) {
        var districts = Object.keys(storeData[selectedState]);
        districts.forEach(function(district) {
            var option = document.createElement('option');
            option.value = district;
            option.textContent = district.replace(/_/g, ' ').toUpperCase(); // Format for display
            districtDropdown.appendChild(option);
        });

        // Clear store container and reset map
        clearMarkers();
        resetMap();
        document.getElementById('storeList').innerHTML = ''; // Clear store list
    }
}

function showStores() {
    var selectedDistrict = document.getElementById('districtDropdown').value;
    var selectedState = document.getElementById('stateDropdown').value;

    if (selectedDistrict && selectedState) {
        var stores = storeData[selectedState][selectedDistrict];
        
        // Clear previous markers and reset the store container
        clearMarkers();
        document.getElementById('storeList').innerHTML = ''; // Clear previous store list

        // Center the map
        map.setCenter({ lat: 1.5, lng: 103.5 });
        map.setZoom(7);

        // Update the store container with all stores
        updateStoreContainer(stores);

        // Create markers on the map
        stores.forEach(function(store) {
            var marker = new google.maps.Marker({
                position: { lat: store.lat, lng: store.lng },
                map: map,
                title: store.name
            });

            google.maps.event.addListener(marker, 'click', function() {
                getStoreAddress(store.lat, store.lng, function(address) {
                    var infoWindowContent = 
                        '<img src="' + store.photo + '" alt="' + store.name + '" style="width: 100px; height: auto;"><br>' +
                        '<div><strong>' + store.name + '</strong><br>' +
                        'Address: ' + address + '</div>';
                    
                    var infoWindow = new google.maps.InfoWindow({
                        content: '<div class="info-window">' + infoWindowContent + '</div>'
                    });

                    infoWindow.open(map, marker);
                });
            });
        });
    }
}

function updateStoreContainer(stores) {
    var storeList = document.getElementById('storeList');
    storeList.innerHTML = ''; // Clear previous content

    stores.forEach(function(store) {
        var storeDetail = document.createElement('div');
        storeDetail.className = 'store-detail';
        storeDetail.innerHTML = 
            '<img src="' + store.photo + '" alt="' + store.name + '" class="store-photo">' +
            '<div class="store-info">' +
                '<strong>' + store.name + '</strong><br>' +
                'Address: <span class="store-address" data-lat="' + store.lat + '" data-lng="' + store.lng + '">' + store.address + '</span>' +
                '<button class="getDirectionsButton" data-lat="' + store.lat + '" data-lng="' + store.lng + '">Get Directions</button>' +
            '</div>';
        storeList.appendChild(storeDetail);

        storeDetail.addEventListener('click', function() {
            clearMarkers();
            var marker = new google.maps.Marker({
                position: { lat: store.lat, lng: store.lng },
                map: map,
                title: store.name
            });

            map.setCenter(marker.getPosition());
            map.setZoom(15); // Set zoom level for selected store

            getStoreAddress(store.lat, store.lng, function(address) {
                var infoWindowContent = 
                    '<div><strong>' + store.name + '</strong><br>' +
                    'Address: ' + address + '</div>';
                var infoWindow = new google.maps.InfoWindow({
                    content: '<div class="info-window">' + infoWindowContent + '</div>'
                });

                infoWindow.open(map, marker);
            });
        });

        // Add event listeners for "Get Directions" buttons
        var buttons = storeDetail.querySelectorAll('.getDirectionsButton');
        buttons.forEach(function(button) {
            button.addEventListener('click', function(event) {
                event.stopPropagation();
                var lat = parseFloat(this.getAttribute('data-lat'));
                var lng = parseFloat(this.getAttribute('data-lng'));
                getDirections(lat, lng, store.name);
            });
        });
    });
}


function getStoreAddress(lat, lng, callback) {
    var geocoder = new google.maps.Geocoder();
    geocoder.geocode({ location: { lat: lat, lng: lng } }, function(results, status) {
        if (status === google.maps.GeocoderStatus.OK && results[0]) {
            callback(results[0].formatted_address);
        } else {
            callback('Address not found');
        }
    });
}

function getDirections(lat, lng, storeName) {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            var userLocation = { lat: position.coords.latitude, lng: position.coords.longitude };

            var request = {
                origin: userLocation,
                destination: { lat: lat, lng: lng },
                travelMode: google.maps.TravelMode.DRIVING
            };

            directionsService.route(request, function(result, status) {
                if (status === google.maps.DirectionsStatus.OK) {
                    directionsRenderer.setDirections(result);

                    var duration = result.routes[0].legs[0].duration.text;
                    var distance = result.routes[0].legs[0].distance.text;

                    alert('Directions to ' + storeName + ':\n' + distance + ' - ' + duration);
                } else {
                    alert('Could not get directions. Please try again.');
                }
            });
        });
    } else {
        alert('Geolocation is not supported by your browser.');
    }
}

function clearMarkers() {
    markers.forEach(function(marker) {
        marker.setMap(null);
    });
    markers = [];
}

function resetMap() {
    map.setCenter({ lat: 3.1390, lng: 101.6869 });
    map.setZoom(7);
}

// Initialize map on page load
window.onload = initMap;

