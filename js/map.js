// Rice Village Shops — Google Maps Integration
// Custom styled map with category-colored markers, info popups, and filtering

let map;
let markers = [];
let infoWindow;
let currentMapCategory = 'all';

// Category colors for markers
const categoryColors = {
  restaurant: '#ef4444',
  bar: '#8b5cf6',
  coffee: '#f59e0b',
  shopping: '#10b981',
  museum: '#3b82f6'
};

// Category labels
const categoryLabels = {
  restaurant: 'Restaurant',
  bar: 'Bar',
  coffee: 'Coffee',
  shopping: 'Shopping',
  museum: 'Museum'
};

// Custom map styles — clean, minimal look
const mapStyles = [
  { elementType: 'geometry', stylers: [{ color: '#f5f5f5' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#ffffff' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#616161' }] },
  { featureType: 'administrative', elementType: 'geometry', stylers: [{ visibility: 'off' }] },
  { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#e8f5e9' }] },
  { featureType: 'poi.park', elementType: 'labels.text.fill', stylers: [{ color: '#9e9e9e' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#ffffff' }] },
  { featureType: 'road', elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
  { featureType: 'road.arterial', elementType: 'geometry', stylers: [{ color: '#fafafa' }] },
  { featureType: 'road.arterial', elementType: 'labels.text.fill', stylers: [{ color: '#757575' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#f0f0f0' }] },
  { featureType: 'road.highway', elementType: 'labels.text.fill', stylers: [{ color: '#616161' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#e0e7ff' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#9e9e9e' }] }
];

// Initialize the map
function initMap() {
  const riceVillageCenter = { lat: 29.7165, lng: -95.4115 };

  map = new google.maps.Map(document.getElementById('map'), {
    center: riceVillageCenter,
    zoom: 15,
    styles: mapStyles,
    disableDefaultUI: true,
    zoomControl: true,
    zoomControlOptions: {
      position: google.maps.ControlPosition.RIGHT_CENTER
    },
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: true,
    fullscreenControlOptions: {
      position: google.maps.ControlPosition.RIGHT_TOP
    },
    gestureHandling: 'cooperative'
  });

  infoWindow = new google.maps.InfoWindow();

  // Create markers for all listings
  createMarkers();

  // Set up map filter buttons
  setupMapFilters();
}

// Create a custom SVG marker icon
function createMarkerIcon(color) {
  return {
    path: 'M12 0C7.58 0 4 3.58 4 8c0 5.25 8 13 8 13s8-7.75 8-13c0-4.42-3.58-8-8-8zm0 11c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z',
    fillColor: color,
    fillOpacity: 1,
    strokeColor: '#ffffff',
    strokeWeight: 2,
    scale: 1.5,
    anchor: new google.maps.Point(12, 21),
    labelOrigin: new google.maps.Point(12, 8)
  };
}

// Create markers for all listings
function createMarkers() {
  listings.forEach((listing, index) => {
    const color = categoryColors[listing.category] || '#6b7280';
    const marker = new google.maps.Marker({
      position: { lat: listing.lat, lng: listing.lng },
      map: map,
      icon: createMarkerIcon(color),
      title: listing.name,
      animation: google.maps.Animation.DROP,
      optimized: true
    });

    // Stagger drop animation
    marker.setAnimation(null);
    setTimeout(() => {
      marker.setAnimation(google.maps.Animation.DROP);
    }, index * 10);

    // Store category on the marker for filtering
    marker.category = listing.category;
    marker.listingData = listing;

    // Click handler for info popup
    marker.addListener('click', () => {
      const content = createInfoContent(listing);
      infoWindow.setContent(content);
      infoWindow.open(map, marker);
    });

    markers.push(marker);
  });
}

// Create info window HTML content
function createInfoContent(listing) {
  const categoryClass = `map-info__category--${listing.category}`;
  const label = categoryLabels[listing.category] || listing.category;

  return `
    <div class="map-info">
      <div class="map-info__name">${listing.name}</div>
      <span class="map-info__category ${categoryClass}">${label} &middot; ${listing.subcategory}</span>
      <div class="map-info__address">${listing.address}</div>
      <div class="map-info__desc">${listing.description}</div>
      <a href="#directory" class="map-info__link" onclick="scrollToListing('${listing.name.replace(/'/g, "\\'")}')">View in Directory &rarr;</a>
    </div>
  `;
}

// Filter markers by category
function filterMarkers(category) {
  currentMapCategory = category;

  markers.forEach(marker => {
    if (category === 'all' || marker.category === category) {
      marker.setVisible(true);
    } else {
      marker.setVisible(false);
    }
  });

  // Close any open info window
  infoWindow.close();
}

// Set up map filter button click handlers
function setupMapFilters() {
  const filtersContainer = document.getElementById('mapFilters');
  if (!filtersContainer) return;

  filtersContainer.addEventListener('click', (e) => {
    const btn = e.target.closest('.map-filter');
    if (!btn) return;

    const category = btn.dataset.category;

    // Update active state
    filtersContainer.querySelectorAll('.map-filter').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    // Filter markers
    filterMarkers(category);
  });
}

// Scroll to a listing card in the directory
function scrollToListing(name) {
  // Trigger search in the directory
  const searchInput = document.getElementById('directorySearch');
  if (searchInput) {
    searchInput.value = name;
    searchInput.dispatchEvent(new Event('input'));
  }

  // Scroll to directory
  const directorySection = document.getElementById('directory');
  if (directorySection) {
    setTimeout(() => {
      directorySection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }
}

// Highlight a specific marker on the map (called from directory cards)
function highlightMarker(name) {
  markers.forEach(marker => {
    if (marker.listingData.name === name) {
      map.panTo(marker.getPosition());
      map.setZoom(17);
      const content = createInfoContent(marker.listingData);
      infoWindow.setContent(content);
      infoWindow.open(map, marker);
      marker.setAnimation(google.maps.Animation.BOUNCE);
      setTimeout(() => marker.setAnimation(null), 1500);
    }
  });
}

// Sync map filters with directory category (called from app.js)
function syncMapCategory(category) {
  const filtersContainer = document.getElementById('mapFilters');
  if (!filtersContainer) return;

  filtersContainer.querySelectorAll('.map-filter').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.category === category);
  });

  filterMarkers(category);
}
