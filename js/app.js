// Rice Village Shops — Main Application Logic
// Search, filtering, card rendering, scroll effects, animations

(function() {
  'use strict';

  // ============================================
  // STATE
  // ============================================
  let currentCategory = 'all';
  let currentSearch = '';
  let visibleCount = 9; // 3 rows x 3 columns
  const PAGE_SIZE = 9;
  let currentFiltered = [];
  let currentModalListing = '';

  // Stripe Payment Link URLs (replace with your real Stripe Payment Links)
  const STRIPE_LINKS = {
    sidebar: 'https://buy.stripe.com/aFaeVc54Pcf676gaG15Rm03',
    banner: 'https://buy.stripe.com/dRmbJ0cxha6Y1LWbK55Rm04',
    premium: 'https://buy.stripe.com/bJedR840Lbb276g3dz5Rm05'
  };

  // Ad dimension requirements per package
  const AD_DIMENSIONS = {
    sidebar: { width: 300, height: 250, label: 'Sidebar image: 300 \u00d7 250 px' },
    banner: { width: 468, height: 60, label: 'Banner image: 468 \u00d7 60 px' },
    premium_sidebar: { width: 300, height: 250, label: 'Sidebar image: 300 \u00d7 250 px' },
    premium_banner: { width: 468, height: 60, label: 'Banner image: 468 \u00d7 60 px' }
  };

  const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2 MB

  // ============================================
  // DOM REFERENCES
  // ============================================
  const header = document.getElementById('header');
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');
  const directoryGrid = document.getElementById('directoryGrid');
  const directoryCount = document.getElementById('directoryCount');
  const directoryEmpty = document.getElementById('directoryEmpty');
  const directoryTabs = document.getElementById('directoryTabs');
  const directorySearch = document.getElementById('directorySearch');
  const heroSearch = document.getElementById('heroSearch');
  const navSearch = document.getElementById('navSearch');
  const mobileSearch = document.getElementById('mobileSearch');
  const clearSearchBtn = document.getElementById('clearSearch');

  // Category labels
  const categoryLabels = {
    restaurant: 'Restaurant',
    bar: 'Bar',
    coffee: 'Coffee',
    shopping: 'Shopping',
    museum: 'Museum'
  };

  // ============================================
  // INITIALIZATION
  // ============================================
  function init() {
    renderCards(listings);
    updateStats();
    setupEventListeners();
    setupScrollEffects();
  }

  // ============================================
  // CARD RENDERING
  // ============================================
  function renderCards(data) {
    if (!directoryGrid) return;

    currentFiltered = data;
    const loadMoreWrap = document.getElementById('loadMoreWrap');
    const remainingCount = document.getElementById('remainingCount');

    if (data.length === 0) {
      directoryGrid.style.display = 'none';
      directoryEmpty.style.display = 'flex';
      directoryCount.textContent = '';
      if (loadMoreWrap) loadMoreWrap.style.display = 'none';
      return;
    }

    directoryGrid.style.display = 'grid';
    directoryEmpty.style.display = 'none';

    const showing = Math.min(visibleCount, data.length);
    const categoryLabel = currentCategory === 'all' ? '' : ` ${categoryLabels[currentCategory] || currentCategory}`;
    const searchLabel = currentSearch ? ` matching "${currentSearch}"` : '';
    directoryCount.textContent = `Showing ${showing} of ${data.length}${categoryLabel} listing${data.length !== 1 ? 's' : ''}${searchLabel}`;

    const visible = data.slice(0, visibleCount);
    directoryGrid.innerHTML = visible.map(listing => createCard(listing)).join('');

    // Show/hide load more
    if (loadMoreWrap) {
      const remaining = data.length - visibleCount;
      if (remaining > 0) {
        loadMoreWrap.style.display = 'flex';
        if (remainingCount) remainingCount.textContent = `${remaining} more listing${remaining !== 1 ? 's' : ''}`;
      } else {
        loadMoreWrap.style.display = 'none';
      }
    }
  }

  function createCard(listing) {
    const badgeClass = `card__badge--${listing.category}`;
    const label = categoryLabels[listing.category] || listing.category;
    const imgSrc = getListingImage(listing);

    return `
      <article class="card" data-name="${escapeAttr(listing.name)}" onclick="openDetail('${escapeAttr(listing.name)}')" style="cursor:pointer;">
        <div class="card__image">
          <img src="${imgSrc}" alt="${escapeAttr(listing.name)} — ${escapeAttr(listing.subcategory)} in Rice Village Houston" loading="lazy" onerror="this.src='images/logos/Listing-Placeholder.png'">
          <span class="card__badge ${badgeClass}">${label}</span>
        </div>
        <div class="card__body">
          <h3 class="card__name">${escapeHtml(listing.name)}</h3>
          <div class="card__subcategory">${escapeHtml(listing.subcategory)}</div>
          <div class="card__address">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
            <span>${escapeHtml(listing.address)}</span>
          </div>
          <p class="card__desc">${escapeHtml(listing.description)}</p>
          <div class="card__actions">
            <span class="card__action">View Details &rarr;</span>
          </div>
        </div>
      </article>
    `;
  }

  // ============================================
  // FILTERING & SEARCH
  // ============================================
  function filterListings(resetPage) {
    if (resetPage !== false) visibleCount = PAGE_SIZE;

    let filtered = listings;

    // Category filter
    if (currentCategory !== 'all') {
      filtered = filtered.filter(l => l.category === currentCategory);
    }

    // Search filter
    if (currentSearch) {
      const query = currentSearch.toLowerCase();
      filtered = filtered.filter(l =>
        l.name.toLowerCase().includes(query) ||
        l.category.toLowerCase().includes(query) ||
        l.subcategory.toLowerCase().includes(query) ||
        l.description.toLowerCase().includes(query) ||
        l.address.toLowerCase().includes(query)
      );
    }

    renderCards(filtered);
  }

  function setCategory(category) {
    currentCategory = category;

    // Update tab active state
    if (directoryTabs) {
      directoryTabs.querySelectorAll('.directory__tab').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.category === category);
      });
    }

    // Update nav link active state
    document.querySelectorAll('.nav__link, .mobile-menu__link').forEach(link => {
      link.classList.toggle('active', link.dataset.category === category);
    });

    // Sync map
    if (typeof syncMapCategory === 'function') {
      syncMapCategory(category);
    }

    filterListings();
  }

  function setSearch(query) {
    currentSearch = query;

    // Sync all search inputs
    [directorySearch, heroSearch, navSearch, mobileSearch].forEach(input => {
      if (input && input !== document.activeElement) {
        input.value = query;
      }
    });

    filterListings();
  }

  // ============================================
  // STATS
  // ============================================
  function updateStats() {
    const counts = {
      restaurant: 0,
      bar: 0,
      coffee: 0,
      shopping: 0,
      museum: 0
    };

    listings.forEach(l => {
      if (counts[l.category] !== undefined) {
        counts[l.category]++;
      }
    });

    animateCounter('statRestaurants', counts.restaurant);
    animateCounter('statBars', counts.bar);
    animateCounter('statCoffee', counts.coffee);
    animateCounter('statShopping', counts.shopping);
    animateCounter('statMuseums', counts.museum);
  }

  function animateCounter(id, target) {
    const el = document.getElementById(id);
    if (!el) return;

    let current = 0;
    const duration = 1200;
    const step = target / (duration / 16);

    function tick() {
      current += step;
      if (current >= target) {
        el.textContent = target;
        return;
      }
      el.textContent = Math.floor(current);
      requestAnimationFrame(tick);
    }

    // Start animation when element is visible
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        tick();
        observer.disconnect();
      }
    }, { threshold: 0.5 });

    observer.observe(el);
  }

  // ============================================
  // SCROLL EFFECTS
  // ============================================
  function setupScrollEffects() {
    let lastScroll = 0;

    window.addEventListener('scroll', () => {
      const scrollY = window.scrollY;

      // Header shadow on scroll
      if (header) {
        header.classList.toggle('header--scrolled', scrollY > 20);
      }

      lastScroll = scrollY;
    }, { passive: true });
  }

  // ============================================
  // EVENT LISTENERS
  // ============================================
  function setupEventListeners() {
    // Hamburger menu
    if (hamburger) {
      hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        mobileMenu.classList.toggle('active');
        document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
      });
    }

    // Directory tabs
    if (directoryTabs) {
      directoryTabs.addEventListener('click', (e) => {
        const tab = e.target.closest('.directory__tab');
        if (!tab) return;
        setCategory(tab.dataset.category);
      });
    }

    // Nav links (category)
    document.querySelectorAll('.nav__link, .mobile-menu__link').forEach(link => {
      link.addEventListener('click', (e) => {
        if (link.dataset.category) {
          setCategory(link.dataset.category);

          // Close mobile menu
          if (hamburger && mobileMenu) {
            hamburger.classList.remove('active');
            mobileMenu.classList.remove('active');
            document.body.style.overflow = '';
          }
        }
      });
    });

    // Footer category links
    document.querySelectorAll('.footer__links a[data-category]').forEach(link => {
      link.addEventListener('click', (e) => {
        setCategory(link.dataset.category);
      });
    });

    // Search inputs — debounced
    const searchHandler = debounce((e) => {
      setSearch(e.target.value.trim());
    }, 200);

    [directorySearch, heroSearch, navSearch, mobileSearch].forEach(input => {
      if (input) {
        input.addEventListener('input', searchHandler);

        // Enter key scrolls to directory
        input.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') {
            const dir = document.getElementById('directory');
            if (dir) dir.scrollIntoView({ behavior: 'smooth' });
          }
        });
      }
    });

    // Clear search button
    if (clearSearchBtn) {
      clearSearchBtn.addEventListener('click', () => {
        setSearch('');
        setCategory('all');
      });
    }

    // Load More button
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    if (loadMoreBtn) {
      loadMoreBtn.addEventListener('click', () => {
        visibleCount += PAGE_SIZE;
        filterListings(false);
      });
    }

    // Hero scroll CTA
    const heroScroll = document.querySelector('.hero__scroll');
    if (heroScroll) {
      heroScroll.addEventListener('click', () => {
        const mapSection = document.getElementById('map-section');
        if (mapSection) mapSection.scrollIntoView({ behavior: 'smooth' });
      });
    }
  }

  // ============================================
  // UTILITIES
  // ============================================
  function debounce(fn, ms) {
    let timer;
    return function(...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), ms);
    };
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function escapeAttr(str) {
    return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\\/g, '&#92;').replace(/`/g, '&#96;');
  }

  // ============================================
  // DETAIL MODAL
  // ============================================
  const modalOverlay = document.getElementById('modalOverlay');
  const modal = document.getElementById('modal');
  const modalClose = document.getElementById('modalClose');
  const modalImage = document.getElementById('modalImage');
  const modalBadge = document.getElementById('modalBadge');
  const modalName = document.getElementById('modalName');
  const modalSubcategory = document.getElementById('modalSubcategory');
  const modalDesc = document.getElementById('modalDesc');
  const modalAddressText = document.getElementById('modalAddressText');
  const modalMapBtn = document.getElementById('modalMapBtn');
  const modalDirections = document.getElementById('modalDirections');
  const modalGBP = document.getElementById('modalGBP');
  const modalContact = document.getElementById('modalContact');
  const modalWebsite = document.getElementById('modalWebsite');
  const modalWebsiteText = document.getElementById('modalWebsiteText');
  const modalPhone = document.getElementById('modalPhone');
  const modalPhoneText = document.getElementById('modalPhoneText');

  const badgeColorClasses = {
    restaurant: 'card__badge--restaurant',
    bar: 'card__badge--bar',
    coffee: 'card__badge--coffee',
    shopping: 'card__badge--shopping',
    museum: 'card__badge--museum'
  };

  const modalPhotosGrid = document.getElementById('modalPhotosGrid');
  const photosCache = {}; // cache by listing name

  function openModal(listing) {
    currentModalListing = listing.name;
    // Set image
    const imgSrc = getListingImage(listing);
    modalImage.src = imgSrc;
    modalImage.alt = listing.name + ' — ' + listing.subcategory + ' in Rice Village Houston';
    modalImage.onerror = function() { this.src = 'images/logos/Listing-Placeholder.png'; };

    // Set content
    modalName.textContent = listing.name;
    modalSubcategory.textContent = listing.subcategory;
    modalAddressText.textContent = listing.address;
    modalDesc.textContent = listing.description;

    // Badge
    const label = categoryLabels[listing.category] || listing.category;
    modalBadge.textContent = label;
    modalBadge.className = 'modal__badge ' + (badgeColorClasses[listing.category] || '');

    // Website & phone
    if (modalContact) {
      var hasContact = false;
      if (listing.website && modalWebsite) {
        modalWebsite.href = listing.website;
        modalWebsiteText.textContent = listing.website.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');
        modalWebsite.style.display = 'flex';
        hasContact = true;
      } else if (modalWebsite) {
        modalWebsite.style.display = 'none';
      }
      if (listing.phone && modalPhone) {
        modalPhone.href = 'tel:' + listing.phone.replace(/[^+\d]/g, '');
        modalPhoneText.textContent = listing.phone;
        modalPhone.style.display = 'flex';
        hasContact = true;
      } else if (modalPhone) {
        modalPhone.style.display = 'none';
      }
      modalContact.style.display = hasContact ? 'flex' : 'none';
    }

    // Directions link
    const q = encodeURIComponent(listing.name + ', ' + listing.address);
    modalDirections.href = 'https://www.google.com/maps/search/?api=1&query=' + q;

    // Google Business Profile embed (free embed, no API key needed)
    if (modalGBP) {
      const gbpQuery = encodeURIComponent(listing.name + ', ' + listing.address);
      modalGBP.src = 'https://www.google.com/maps?q=' + gbpQuery + '&output=embed';
    }

    // Fetch Google Business Photos
    fetchGBPPhotos(listing);

    // Map button
    modalMapBtn.onclick = function() {
      closeModal();
      showOnMapFn(listing.name);
    };

    // Show
    modalOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function fetchGBPPhotos(listing) {
    if (!modalPhotosGrid) return;

    // Check cache first
    if (photosCache[listing.name]) {
      renderPhotos(photosCache[listing.name]);
      return;
    }

    // Show loading
    modalPhotosGrid.innerHTML = '<div class="modal__photos-loading"><div class="spinner"></div> Loading photos...</div>';
    modalPhotosGrid.classList.remove('empty');

    // Wait for Google Maps to be ready
    if (typeof google === 'undefined' || !google.maps || !google.maps.places) {
      modalPhotosGrid.innerHTML = '';
      modalPhotosGrid.classList.add('empty');
      return;
    }

    // Use Places service to find the business
    const service = new google.maps.places.PlacesService(document.createElement('div'));
    const request = {
      query: listing.name + ', ' + listing.address,
      fields: ['photos', 'name', 'place_id']
    };

    service.findPlaceFromQuery(request, function(results, status) {
      if (status === google.maps.places.PlacesServiceStatus.OK && results && results[0]) {
        const place = results[0];

        if (place.photos && place.photos.length > 0) {
          // Get up to 3 photos
          const photos = place.photos.slice(0, 3).map(photo => ({
            url: photo.getUrl({ maxWidth: 600, maxHeight: 450 }),
            attribution: photo.html_attributions && photo.html_attributions[0]
              ? photo.html_attributions[0].replace(/<[^>]*>/g, '')
              : ''
          }));

          photosCache[listing.name] = photos;
          renderPhotos(photos);

          // Also update the hero image with the first Google photo
          if (photos[0] && modalImage) {
            modalImage.src = photos[0].url;
          }
        } else {
          modalPhotosGrid.innerHTML = '';
          modalPhotosGrid.classList.add('empty');
        }
      } else {
        modalPhotosGrid.innerHTML = '';
        modalPhotosGrid.classList.add('empty');
      }
    });
  }

  function renderPhotos(photos) {
    if (!modalPhotosGrid || !photos.length) return;

    modalPhotosGrid.classList.remove('empty');
    modalPhotosGrid.innerHTML = photos.map(photo => `
      <div class="modal__photo-item">
        <img src="${photo.url}" alt="Photo of ${escapeAttr(currentModalListing)} in Rice Village Houston" loading="lazy">
        ${photo.attribution ? '<span class="modal__photo-attr">' + escapeHtml(photo.attribution) + '</span>' : ''}
      </div>
    `).join('');
  }

  function closeModal() {
    modalOverlay.classList.remove('active');
    document.body.style.overflow = '';
    // Stop GBP iframe loading
    if (modalGBP) modalGBP.src = '';
    // Clear photos
    if (modalPhotosGrid) {
      modalPhotosGrid.innerHTML = '';
      modalPhotosGrid.classList.add('empty');
    }
  }

  // Close on overlay click
  if (modalOverlay) {
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) closeModal();
    });
  }

  // Close on X button
  if (modalClose) {
    modalClose.addEventListener('click', closeModal);
  }

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeModal();
      closeFormOverlay('submitOverlay');
      closeFormOverlay('advertiseOverlay');
    }
  });

  // ============================================
  // SUBMIT LISTING & ADVERTISE MODALS
  // ============================================
  function openFormOverlay(id) {
    const overlay = document.getElementById(id);
    if (overlay) {
      overlay.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeFormOverlay(id) {
    const overlay = document.getElementById(id);
    if (overlay && overlay.classList.contains('active')) {
      overlay.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  // Close on overlay click
  ['submitOverlay', 'advertiseOverlay'].forEach(id => {
    const overlay = document.getElementById(id);
    if (overlay) {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closeFormOverlay(id);
      });
    }
  });

  // Close buttons
  const submitCloseBtn = document.getElementById('submitClose');
  const advertiseCloseBtn = document.getElementById('advertiseClose');
  if (submitCloseBtn) submitCloseBtn.addEventListener('click', () => closeFormOverlay('submitOverlay'));
  if (advertiseCloseBtn) advertiseCloseBtn.addEventListener('click', () => closeFormOverlay('advertiseOverlay'));

  // Open triggers — footer links
  const submitListingFooter = document.getElementById('submitListingFooter');
  const advertiseFooter = document.getElementById('advertiseFooter');
  if (submitListingFooter) {
    submitListingFooter.addEventListener('click', (e) => {
      e.preventDefault();
      openFormOverlay('submitOverlay');
    });
  }
  if (advertiseFooter) {
    advertiseFooter.addEventListener('click', (e) => {
      e.preventDefault();
      openFormOverlay('advertiseOverlay');
    });
  }

  // Submit Listing Form
  const submitForm = document.getElementById('submitForm');
  const submitSuccess = document.getElementById('submitSuccess');
  const submitAnother = document.getElementById('submitAnother');

  if (submitForm) {
    submitForm.addEventListener('submit', (e) => {
      e.preventDefault();

      // Collect form data
      const formData = new FormData(submitForm);
      const data = Object.fromEntries(formData.entries());
      data.status = 'pending_approval';
      data.submitted_at = new Date().toISOString();

      // Store in localStorage for admin review
      const pending = JSON.parse(localStorage.getItem('rv_pending_listings') || '[]');
      pending.push(data);
      localStorage.setItem('rv_pending_listings', JSON.stringify(pending));

      // Show success
      submitForm.style.display = 'none';
      submitSuccess.style.display = 'block';
    });
  }

  if (submitAnother) {
    submitAnother.addEventListener('click', () => {
      submitForm.reset();
      submitForm.style.display = 'block';
      submitSuccess.style.display = 'none';
    });
  }

  // ============================================
  // ADVERTISE FORM — Image Upload + Stripe Payment
  // ============================================
  const advertiseForm = document.getElementById('advertiseForm');
  const advertiseSuccess = document.getElementById('advertiseSuccess');
  const advertiseAnother = document.getElementById('advertiseAnother');
  const adSelectedPackage = document.getElementById('adSelectedPackage');
  const adUploadSection = document.getElementById('adUploadSection');

  // Image data storage
  const adImageData = { image1: null, image2: null };

  // Show/hide upload section and set dimension info based on package selection
  document.querySelectorAll('input[name="ad_package"]').forEach(radio => {
    radio.addEventListener('change', () => {
      if (adSelectedPackage) adSelectedPackage.value = radio.value;
      if (!adUploadSection) return;

      adUploadSection.style.display = 'block';
      const group2 = document.getElementById('adUploadGroup2');
      const info1 = document.getElementById('adUploadInfo1');

      if (radio.value === 'sidebar') {
        info1.textContent = AD_DIMENSIONS.sidebar.label;
        group2.style.display = 'none';
      } else if (radio.value === 'banner') {
        info1.textContent = AD_DIMENSIONS.banner.label;
        group2.style.display = 'none';
      } else if (radio.value === 'premium') {
        info1.textContent = AD_DIMENSIONS.premium_sidebar.label;
        group2.style.display = 'block';
      }

      // Clear previous uploads when switching packages
      clearUpload(1);
      clearUpload(2);
    });
  });

  // Image upload handling for both zones
  function setupUploadZone(zoneNum) {
    const zone = document.getElementById('adUploadZone' + zoneNum);
    const input = document.getElementById('adFileInput' + zoneNum);
    const prompt = document.getElementById('adUploadPrompt' + zoneNum);
    const preview = document.getElementById('adPreview' + zoneNum);
    const previewImg = document.getElementById('adPreviewImg' + zoneNum);
    const error = document.getElementById('adUploadError' + zoneNum);
    const remove = document.getElementById('adRemove' + zoneNum);

    if (!zone) return;

    // Drag and drop
    zone.addEventListener('dragover', (e) => { e.preventDefault(); zone.classList.add('ad-upload--active'); });
    zone.addEventListener('dragleave', () => zone.classList.remove('ad-upload--active'));
    zone.addEventListener('drop', (e) => {
      e.preventDefault();
      zone.classList.remove('ad-upload--active');
      if (e.dataTransfer.files.length) handleFile(e.dataTransfer.files[0], zoneNum);
    });

    // File input change
    input.addEventListener('change', () => {
      if (input.files.length) handleFile(input.files[0], zoneNum);
    });

    // Remove button
    if (remove) {
      remove.addEventListener('click', (e) => {
        e.stopPropagation();
        clearUpload(zoneNum);
      });
    }
  }

  function handleFile(file, zoneNum) {
    const error = document.getElementById('adUploadError' + zoneNum);
    const prompt = document.getElementById('adUploadPrompt' + zoneNum);
    const preview = document.getElementById('adPreview' + zoneNum);
    const previewImg = document.getElementById('adPreviewImg' + zoneNum);

    error.style.display = 'none';

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      showUploadError(zoneNum, 'Invalid file type. Please upload JPG, PNG, GIF, or WebP.');
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      showUploadError(zoneNum, 'File too large. Maximum size is 2 MB.');
      return;
    }

    // Read and validate dimensions
    const reader = new FileReader();
    reader.onload = function(e) {
      const img = new Image();
      img.onload = function() {
        const pkg = document.querySelector('input[name="ad_package"]:checked');
        if (!pkg) return;

        let requiredDims;
        if (pkg.value === 'premium') {
          requiredDims = zoneNum === 1 ? AD_DIMENSIONS.premium_sidebar : AD_DIMENSIONS.premium_banner;
        } else {
          requiredDims = AD_DIMENSIONS[pkg.value];
        }

        if (img.width !== requiredDims.width || img.height !== requiredDims.height) {
          showUploadError(zoneNum,
            'Image dimensions must be ' + requiredDims.width + '\u00d7' + requiredDims.height +
            ' px. Your image is ' + img.width + '\u00d7' + img.height + ' px.');
          return;
        }

        // Valid — show preview
        adImageData['image' + zoneNum] = e.target.result;
        previewImg.src = e.target.result;
        prompt.style.display = 'none';
        preview.style.display = 'inline-block';
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  function showUploadError(zoneNum, msg) {
    const error = document.getElementById('adUploadError' + zoneNum);
    error.textContent = msg;
    error.style.display = 'block';
  }

  function clearUpload(zoneNum) {
    const input = document.getElementById('adFileInput' + zoneNum);
    const prompt = document.getElementById('adUploadPrompt' + zoneNum);
    const preview = document.getElementById('adPreview' + zoneNum);
    const error = document.getElementById('adUploadError' + zoneNum);
    if (!input) return;

    input.value = '';
    adImageData['image' + zoneNum] = null;
    if (prompt) prompt.style.display = 'flex';
    if (preview) preview.style.display = 'none';
    if (error) error.style.display = 'none';
  }

  setupUploadZone(1);
  setupUploadZone(2);

  // Form submit — save data + redirect to Stripe
  if (advertiseForm) {
    advertiseForm.addEventListener('submit', (e) => {
      e.preventDefault();

      // Validate package selection
      const selectedPkg = document.querySelector('input[name="ad_package"]:checked');
      if (!selectedPkg) {
        alert('Please select an ad package before submitting.');
        return;
      }

      // Validate image uploads
      if (!adImageData.image1) {
        showUploadError(1, 'Please upload your ad image before proceeding.');
        return;
      }
      if (selectedPkg.value === 'premium' && !adImageData.image2) {
        showUploadError(2, 'Please upload your banner image before proceeding.');
        return;
      }

      // Generate unique ad ID
      const adId = 'ad_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);

      // Collect form data
      const formData = new FormData(advertiseForm);
      const data = Object.fromEntries(formData.entries());
      data.ad_id = adId;
      data.status = 'pending_payment';
      data.submitted_at = new Date().toISOString();
      data.image1 = adImageData.image1;
      if (selectedPkg.value === 'premium') {
        data.image2 = adImageData.image2;
      }

      // Store in localStorage
      const ads = JSON.parse(localStorage.getItem('rv_ads') || '[]');
      ads.push(data);
      localStorage.setItem('rv_ads', JSON.stringify(ads));

      // Redirect to Stripe Payment Link
      const stripeUrl = STRIPE_LINKS[selectedPkg.value];
      const separator = stripeUrl.includes('?') ? '&' : '?';
      window.location.href = stripeUrl + separator + 'client_reference_id=' + encodeURIComponent(adId);
    });
  }

  if (advertiseAnother) {
    advertiseAnother.addEventListener('click', () => {
      advertiseForm.reset();
      advertiseForm.style.display = 'block';
      document.getElementById('adPackages').style.display = 'grid';
      if (adUploadSection) adUploadSection.style.display = 'none';
      advertiseSuccess.style.display = 'none';
      document.querySelectorAll('input[name="ad_package"]').forEach(r => r.checked = false);
      clearUpload(1);
      clearUpload(2);
    });
  }

  // ============================================
  // PAYMENT RETURN HANDLER
  // ============================================
  function handlePaymentReturn() {
    const params = new URLSearchParams(window.location.search);
    if (params.get('payment_success') !== 'true') return;

    const adId = params.get('ad_id');
    if (!adId) return;

    // Mark the ad as active in localStorage
    const ads = JSON.parse(localStorage.getItem('rv_ads') || '[]');
    let found = false;
    for (let i = 0; i < ads.length; i++) {
      if (ads[i].ad_id === adId && ads[i].status === 'pending_payment') {
        ads[i].status = 'active';
        found = true;
        break;
      }
    }
    if (found) {
      localStorage.setItem('rv_ads', JSON.stringify(ads));
    }

    // Clean the URL
    const cleanUrl = window.location.origin + window.location.pathname;
    window.history.replaceState({}, '', cleanUrl);

    // Show success toast
    const toast = document.createElement('div');
    toast.className = 'payment-toast';
    toast.textContent = 'Payment successful! Your ad is now live.';
    document.body.appendChild(toast);
    setTimeout(() => { if (toast.parentNode) toast.remove(); }, 5000);
  }

  handlePaymentReturn();

  // ============================================
  // ACTIVE AD RENDERING
  // ============================================
  function renderActiveAds() {
    const ads = JSON.parse(localStorage.getItem('rv_ads') || '[]');
    const activeAds = ads.filter(a => a.status === 'active');
    if (!activeAds.length) return;

    // Find ads for each slot type
    const sidebarAds = activeAds.filter(a => a.selected_package === 'sidebar' || a.selected_package === 'premium');
    const bannerAds = activeAds.filter(a => a.selected_package === 'banner' || a.selected_package === 'premium');

    // Populate sidebar slots
    const sidebar1 = document.getElementById('adSidebar1');
    const sidebar2 = document.getElementById('adSidebar2');
    if (sidebar1 && sidebarAds.length > 0) {
      populateAdSlot(sidebar1, sidebarAds[0].image1, sidebarAds[0].website);
    }
    if (sidebar2 && sidebarAds.length > 1) {
      populateAdSlot(sidebar2, sidebarAds[1].image1, sidebarAds[1].website);
    }

    // Populate banner slot
    const banner = document.getElementById('adBanner');
    if (banner && bannerAds.length > 0) {
      const ad = bannerAds[0];
      const imgSrc = ad.selected_package === 'premium' ? ad.image2 : ad.image1;
      populateAdSlot(banner, imgSrc, ad.website);
    }
  }

  function isValidUrl(url) {
    try {
      const parsed = new URL(url);
      return parsed.protocol === 'https:' || parsed.protocol === 'http:';
    } catch (e) {
      return false;
    }
  }

  function populateAdSlot(slotContent, imageSrc, linkUrl) {
    if (!imageSrc) return;
    const slot = slotContent.closest('.ad-slot');
    if (slot) {
      slot.classList.add('ad-slot--active');
      slot.onclick = null; // remove "openAdvertise" click
    }

    slotContent.innerHTML = '';
    const img = document.createElement('img');
    img.src = imageSrc;
    img.alt = 'Advertisement';

    if (linkUrl && isValidUrl(linkUrl)) {
      const a = document.createElement('a');
      a.href = linkUrl;
      a.target = '_blank';
      a.rel = 'noopener sponsored';
      a.appendChild(img);
      slotContent.appendChild(a);
    } else {
      slotContent.appendChild(img);
    }
  }

  renderActiveAds();

  // ============================================
  // GLOBAL FUNCTIONS (called from HTML onclick)
  // ============================================
  function showOnMapFn(name) {
    const mapSection = document.getElementById('map-section');
    if (mapSection) {
      mapSection.scrollIntoView({ behavior: 'smooth' });
    }
    setTimeout(() => {
      if (typeof highlightMarker === 'function') {
        highlightMarker(name);
      }
    }, 500);
  }

  window.showOnMap = showOnMapFn;

  window.openDetail = function(name) {
    const listing = listings.find(l => l.name === name);
    if (listing) openModal(listing);
  };

  window.openSubmitListing = function() { openFormOverlay('submitOverlay'); };
  window.openAdvertise = function() {
    closeModal(); // close the listing detail modal first
    setTimeout(() => openFormOverlay('advertiseOverlay'), 200);
  };

  // ============================================
  // BOOT
  // ============================================
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
