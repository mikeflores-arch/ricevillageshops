// Rice Village Shops — Admin Dashboard
// Single-page admin panel with login, listings CRUD, submissions, blog CMS

(function() {
  'use strict';

  const app = document.getElementById('app');
  let token = sessionStorage.getItem('rv_admin_token');
  let refreshToken = sessionStorage.getItem('rv_admin_refresh');
  let currentView = 'dashboard';

  // ============================================
  // API HELPER
  // ============================================
  async function api(path, options = {}) {
    const headers = { 'Content-Type': 'application/json', ...options.headers };
    if (token) headers['Authorization'] = 'Bearer ' + token;

    const res = await fetch('/api/' + path, { ...options, headers });

    if (res.status === 401 && refreshToken) {
      const refreshed = await refreshAuth();
      if (refreshed) {
        headers['Authorization'] = 'Bearer ' + token;
        return fetch('/api/' + path, { ...options, headers });
      }
    }

    return res;
  }

  async function refreshAuth() {
    try {
      const res = await fetch('/api/admin-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'refresh', refresh_token: refreshToken })
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      token = data.token;
      refreshToken = data.refresh_token;
      sessionStorage.setItem('rv_admin_token', token);
      sessionStorage.setItem('rv_admin_refresh', refreshToken);
      return true;
    } catch {
      logout();
      return false;
    }
  }

  function esc(s) {
    if (!s) return '';
    const d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
  }

  function toast(msg) {
    const t = document.createElement('div');
    t.className = 'toast';
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 3000);
  }

  // ============================================
  // AUTH
  // ============================================
  function renderLogin() {
    app.innerHTML = `
      <div class="login">
        <div class="login__card">
          <div class="login__logo">&#9670; Rice Village Admin</div>
          <p class="login__subtitle">Sign in to manage your site</p>
          <div class="login__error" id="loginError"></div>
          <form id="loginForm">
            <div class="form-group">
              <label>Email</label>
              <input type="email" id="loginEmail" required placeholder="admin@ricevillageshops.com">
            </div>
            <div class="form-group">
              <label>Password</label>
              <input type="password" id="loginPassword" required placeholder="Your password">
            </div>
            <button type="submit" class="btn btn--primary" style="width:100%;justify-content:center;margin-top:8px;">Sign In</button>
          </form>
        </div>
      </div>
    `;

    document.getElementById('loginForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('loginEmail').value;
      const password = document.getElementById('loginPassword').value;
      const errEl = document.getElementById('loginError');

      try {
        const res = await fetch('/api/admin-auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'login', email, password })
        });
        const data = await res.json();

        if (!res.ok) {
          errEl.textContent = data.error || 'Login failed';
          errEl.style.display = 'block';
          return;
        }

        token = data.token;
        refreshToken = data.refresh_token;
        sessionStorage.setItem('rv_admin_token', token);
        sessionStorage.setItem('rv_admin_refresh', refreshToken);
        renderApp();
      } catch (err) {
        errEl.textContent = 'Connection error';
        errEl.style.display = 'block';
      }
    });
  }

  function logout() {
    token = null;
    refreshToken = null;
    sessionStorage.removeItem('rv_admin_token');
    sessionStorage.removeItem('rv_admin_refresh');
    renderLogin();
  }

  // ============================================
  // APP SHELL
  // ============================================
  function renderApp() {
    app.innerHTML = `
      <div class="layout">
        <aside class="sidebar">
          <div class="sidebar__logo">&#9670; Rice Village</div>
          <ul class="sidebar__nav" id="sidebarNav">
            <li><a class="sidebar__link active" data-view="dashboard">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
              Dashboard
            </a></li>
            <li><a class="sidebar__link" data-view="listings">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              Listings
            </a></li>
            <li><a class="sidebar__link" data-view="submissions">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>
              Submissions
            </a></li>
            <li><a class="sidebar__link" data-view="blog">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
              Blog
            </a></li>
          </ul>
          <div class="sidebar__bottom">
            <a class="sidebar__link" id="logoutBtn">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              Sign Out
            </a>
          </div>
        </aside>
        <main class="main" id="mainContent"></main>
      </div>
    `;

    // Nav events
    document.getElementById('sidebarNav').addEventListener('click', (e) => {
      const link = e.target.closest('.sidebar__link');
      if (!link) return;
      const view = link.dataset.view;
      if (!view) return;

      document.querySelectorAll('.sidebar__link').forEach(l => l.classList.remove('active'));
      link.classList.add('active');
      currentView = view;
      loadView(view);
    });

    document.getElementById('logoutBtn').addEventListener('click', logout);

    loadView('dashboard');
  }

  function loadView(view) {
    const main = document.getElementById('mainContent');
    switch (view) {
      case 'dashboard': loadDashboard(main); break;
      case 'listings': loadListings(main); break;
      case 'submissions': loadSubmissions(main); break;
      case 'blog': loadBlog(main); break;
    }
  }

  // ============================================
  // DASHBOARD
  // ============================================
  async function loadDashboard(container) {
    container.innerHTML = '<div class="main__header"><h1 class="main__title">Dashboard</h1></div><div class="stats" id="dashStats"><p>Loading...</p></div>';

    const [listingsRes, subsRes, blogRes] = await Promise.all([
      api('admin-listings'),
      api('admin-submissions'),
      api('admin-blog')
    ]);

    const listings = listingsRes.ok ? await listingsRes.json() : [];
    const submissions = subsRes.ok ? await subsRes.json() : [];
    const posts = blogRes.ok ? await blogRes.json() : [];

    const pendingSubs = submissions.filter(s => s.status === 'pending');

    document.getElementById('dashStats').innerHTML = `
      <div class="stat-card">
        <div class="stat-card__label">Active Listings</div>
        <div class="stat-card__value">${listings.filter(l => l.is_active).length}</div>
      </div>
      <div class="stat-card">
        <div class="stat-card__label">Pending Submissions</div>
        <div class="stat-card__value" style="color:${pendingSubs.length > 0 ? 'var(--warning)' : 'inherit'}">${pendingSubs.length}</div>
      </div>
      <div class="stat-card">
        <div class="stat-card__label">Blog Posts</div>
        <div class="stat-card__value">${posts.filter(p => p.is_published).length}</div>
      </div>
      <div class="stat-card">
        <div class="stat-card__label">Drafts</div>
        <div class="stat-card__value">${posts.filter(p => !p.is_published).length}</div>
      </div>
    `;
  }

  // ============================================
  // LISTINGS
  // ============================================
  async function loadListings(container) {
    container.innerHTML = `
      <div class="main__header">
        <h1 class="main__title">Listings</h1>
        <button class="btn btn--primary" id="addListingBtn">+ Add Listing</button>
      </div>
      <div class="toolbar">
        <input type="text" class="toolbar__search" id="listingsSearch" placeholder="Search listings...">
      </div>
      <div class="table-wrap"><table class="table" id="listingsTable"><thead><tr><th>Name</th><th>Category</th><th>Address</th><th>Active</th><th>Actions</th></tr></thead><tbody><tr><td colspan="5">Loading...</td></tr></tbody></table></div>
    `;

    const res = await api('admin-listings');
    const listings = res.ok ? await res.json() : [];

    function renderTable(data) {
      const tbody = document.querySelector('#listingsTable tbody');
      if (data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="empty"><p>No listings found</p></td></tr>';
        return;
      }
      tbody.innerHTML = data.map(l => `
        <tr>
          <td><strong>${esc(l.name)}</strong><br><small style="color:var(--text-muted)">${esc(l.subcategory)}</small></td>
          <td><span class="badge badge--${l.is_active ? 'active' : 'draft'}">${esc(l.category)}</span></td>
          <td style="max-width:200px;overflow:hidden;text-overflow:ellipsis;">${esc(l.address)}</td>
          <td>${l.is_active ? '<span class="badge badge--active">Yes</span>' : '<span class="badge badge--draft">No</span>'}</td>
          <td class="table__actions">
            <button class="btn btn--sm btn--secondary" onclick="adminEditListing('${l.id}')">Edit</button>
            <button class="btn btn--sm btn--danger" onclick="adminDeleteListing('${l.id}','${esc(l.name)}')">Delete</button>
          </td>
        </tr>
      `).join('');
    }

    renderTable(listings);

    document.getElementById('listingsSearch').addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase();
      renderTable(listings.filter(l =>
        l.name.toLowerCase().includes(q) ||
        l.category.toLowerCase().includes(q) ||
        l.address.toLowerCase().includes(q)
      ));
    });

    document.getElementById('addListingBtn').addEventListener('click', () => showListingModal());

    // Store for modal access
    window._adminListings = listings;
  }

  // Listing modal (add/edit)
  window.adminEditListing = function(id) {
    const listing = window._adminListings.find(l => l.id === id);
    if (listing) showListingModal(listing);
  };

  window.adminDeleteListing = async function(id, name) {
    if (!confirm('Delete "' + name + '"? This will hide it from the directory.')) return;
    const res = await api('admin-listings?id=' + id, { method: 'DELETE' });
    if (res.ok) {
      toast('Listing deleted');
      loadListings(document.getElementById('mainContent'));
    } else {
      toast('Failed to delete');
    }
  };

  function showListingModal(listing) {
    const isEdit = !!listing;
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
      <div class="modal-dialog">
        <div class="modal-header">
          <h2>${isEdit ? 'Edit' : 'Add'} Listing</h2>
          <button class="btn btn--ghost modal-close">&times;</button>
        </div>
        <div class="modal-body">
          <div class="form-row">
            <div class="form-group"><label>Name *</label><input id="mlName" value="${esc(listing?.name || '')}"></div>
            <div class="form-group"><label>Category *</label>
              <select id="mlCategory">
                <option value="restaurant" ${listing?.category === 'restaurant' ? 'selected' : ''}>Restaurant</option>
                <option value="bar" ${listing?.category === 'bar' ? 'selected' : ''}>Bar</option>
                <option value="coffee" ${listing?.category === 'coffee' ? 'selected' : ''}>Coffee</option>
                <option value="shopping" ${listing?.category === 'shopping' ? 'selected' : ''}>Shopping</option>
                <option value="museum" ${listing?.category === 'museum' ? 'selected' : ''}>Museum</option>
              </select>
            </div>
          </div>
          <div class="form-group"><label>Subcategory</label><input id="mlSubcategory" value="${esc(listing?.subcategory || '')}"></div>
          <div class="form-group"><label>Address *</label><input id="mlAddress" value="${esc(listing?.address || '')}"></div>
          <div class="form-row">
            <div class="form-group"><label>Phone</label><input id="mlPhone" value="${esc(listing?.phone || '')}"></div>
            <div class="form-group"><label>Website</label><input id="mlWebsite" value="${esc(listing?.website || '')}"></div>
          </div>
          <div class="form-row">
            <div class="form-group"><label>Latitude *</label><input type="number" step="any" id="mlLat" value="${listing?.lat || '29.7165'}"></div>
            <div class="form-group"><label>Longitude *</label><input type="number" step="any" id="mlLng" value="${listing?.lng || '-95.4115'}"></div>
          </div>
          <div class="form-group"><label>Description *</label><textarea id="mlDesc">${esc(listing?.description || '')}</textarea></div>
          <div class="form-group"><label>Image Path</label><input id="mlImage" value="${esc(listing?.image_path || '')}" placeholder="images/restaurants/my-place.jpg"></div>
        </div>
        <div class="modal-footer">
          <button class="btn btn--secondary modal-close">Cancel</button>
          <button class="btn btn--primary" id="mlSave">${isEdit ? 'Save Changes' : 'Add Listing'}</button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    overlay.querySelectorAll('.modal-close').forEach(b => b.addEventListener('click', () => overlay.remove()));
    overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });

    document.getElementById('mlSave').addEventListener('click', async () => {
      const data = {
        name: document.getElementById('mlName').value,
        category: document.getElementById('mlCategory').value,
        subcategory: document.getElementById('mlSubcategory').value,
        address: document.getElementById('mlAddress').value,
        phone: document.getElementById('mlPhone').value,
        website: document.getElementById('mlWebsite').value,
        lat: parseFloat(document.getElementById('mlLat').value),
        lng: parseFloat(document.getElementById('mlLng').value),
        description: document.getElementById('mlDesc').value,
        image_path: document.getElementById('mlImage').value
      };

      if (!data.name || !data.address || !data.description) {
        alert('Name, address, and description are required');
        return;
      }

      let res;
      if (isEdit) {
        data.id = listing.id;
        res = await api('admin-listings?id=' + listing.id, { method: 'PUT', body: JSON.stringify(data) });
      } else {
        res = await api('admin-listings', { method: 'POST', body: JSON.stringify(data) });
      }

      if (res.ok) {
        overlay.remove();
        toast(isEdit ? 'Listing updated' : 'Listing added');
        loadListings(document.getElementById('mainContent'));
      } else {
        const err = await res.json();
        alert('Error: ' + (err.error || 'Unknown error'));
      }
    });
  }

  // ============================================
  // SUBMISSIONS
  // ============================================
  async function loadSubmissions(container) {
    container.innerHTML = `
      <div class="main__header"><h1 class="main__title">Submissions</h1></div>
      <div class="toolbar">
        <select id="subFilter" class="toolbar__search" style="max-width:180px;">
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="active">Active</option>
        </select>
      </div>
      <div class="table-wrap"><table class="table" id="subsTable"><thead><tr><th>Business</th><th>Type</th><th>Contact</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead><tbody><tr><td colspan="6">Loading...</td></tr></tbody></table></div>
    `;

    const res = await api('admin-submissions');
    const submissions = res.ok ? await res.json() : [];

    function renderTable(data) {
      const tbody = document.querySelector('#subsTable tbody');
      if (data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="empty"><p>No submissions</p></td></tr>';
        return;
      }
      tbody.innerHTML = data.map(s => `
        <tr>
          <td><strong>${esc(s.business_name)}</strong><br><small>${esc(s.category || s.ad_package || '')}</small></td>
          <td><span class="badge badge--${s.type === 'ad' ? 'pending' : 'active'}">${esc(s.type)}</span></td>
          <td>${esc(s.contact_name)}<br><small>${esc(s.contact_email)}</small></td>
          <td><span class="badge badge--${s.status}">${esc(s.status)}</span></td>
          <td><small>${new Date(s.submitted_at).toLocaleDateString()}</small></td>
          <td class="table__actions">
            ${s.status === 'pending' ? `
              <button class="btn btn--sm btn--success" onclick="adminApprove('${s.id}')">Approve</button>
              <button class="btn btn--sm btn--danger" onclick="adminReject('${s.id}')">Reject</button>
            ` : ''}
            <button class="btn btn--sm btn--secondary" onclick="adminViewSubmission('${s.id}')">View</button>
          </td>
        </tr>
      `).join('');
    }

    renderTable(submissions);

    document.getElementById('subFilter').addEventListener('change', (e) => {
      const status = e.target.value;
      renderTable(status ? submissions.filter(s => s.status === status) : submissions);
    });

    window._adminSubmissions = submissions;
  }

  window.adminApprove = async function(id) {
    const res = await api('admin-submissions?id=' + id, {
      method: 'PUT',
      body: JSON.stringify({ id, status: 'approved' })
    });
    if (res.ok) {
      toast('Submission approved');
      loadSubmissions(document.getElementById('mainContent'));
    }
  };

  window.adminReject = async function(id) {
    const notes = prompt('Rejection reason (optional):');
    const res = await api('admin-submissions?id=' + id, {
      method: 'PUT',
      body: JSON.stringify({ id, status: 'rejected', admin_notes: notes || '' })
    });
    if (res.ok) {
      toast('Submission rejected');
      loadSubmissions(document.getElementById('mainContent'));
    }
  };

  window.adminViewSubmission = function(id) {
    const s = window._adminSubmissions.find(x => x.id === id);
    if (!s) return;

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
      <div class="modal-dialog">
        <div class="modal-header">
          <h2>Submission Details</h2>
          <button class="btn btn--ghost modal-close">&times;</button>
        </div>
        <div class="modal-body">
          <table style="width:100%;font-size:14px;">
            <tr><td style="padding:6px 12px 6px 0;font-weight:600;width:120px;">Business</td><td>${esc(s.business_name)}</td></tr>
            <tr><td style="padding:6px 12px 6px 0;font-weight:600;">Type</td><td>${esc(s.type)}</td></tr>
            <tr><td style="padding:6px 12px 6px 0;font-weight:600;">Status</td><td><span class="badge badge--${s.status}">${esc(s.status)}</span></td></tr>
            <tr><td style="padding:6px 12px 6px 0;font-weight:600;">Contact</td><td>${esc(s.contact_name)} &lt;${esc(s.contact_email)}&gt;</td></tr>
            ${s.category ? `<tr><td style="padding:6px 12px 6px 0;font-weight:600;">Category</td><td>${esc(s.category)}</td></tr>` : ''}
            ${s.address ? `<tr><td style="padding:6px 12px 6px 0;font-weight:600;">Address</td><td>${esc(s.address)}</td></tr>` : ''}
            ${s.description ? `<tr><td style="padding:6px 12px 6px 0;font-weight:600;">Description</td><td>${esc(s.description)}</td></tr>` : ''}
            ${s.ad_package ? `<tr><td style="padding:6px 12px 6px 0;font-weight:600;">Ad Package</td><td>${esc(s.ad_package)}</td></tr>` : ''}
            ${s.message ? `<tr><td style="padding:6px 12px 6px 0;font-weight:600;">Message</td><td>${esc(s.message)}</td></tr>` : ''}
            ${s.admin_notes ? `<tr><td style="padding:6px 12px 6px 0;font-weight:600;">Admin Notes</td><td>${esc(s.admin_notes)}</td></tr>` : ''}
            <tr><td style="padding:6px 12px 6px 0;font-weight:600;">Submitted</td><td>${new Date(s.submitted_at).toLocaleString()}</td></tr>
          </table>
        </div>
        <div class="modal-footer">
          <button class="btn btn--secondary modal-close">Close</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
    overlay.querySelectorAll('.modal-close').forEach(b => b.addEventListener('click', () => overlay.remove()));
    overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
  };

  // ============================================
  // BLOG CMS
  // ============================================
  async function loadBlog(container) {
    container.innerHTML = `
      <div class="main__header">
        <h1 class="main__title">Blog Posts</h1>
        <button class="btn btn--primary" id="addPostBtn">+ New Post</button>
      </div>
      <div class="table-wrap"><table class="table" id="blogTable"><thead><tr><th>Title</th><th>Category</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead><tbody><tr><td colspan="5">Loading...</td></tr></tbody></table></div>
    `;

    const res = await api('admin-blog');
    const posts = res.ok ? await res.json() : [];

    const tbody = document.querySelector('#blogTable tbody');
    if (posts.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" class="empty"><p>No posts yet</p></td></tr>';
    } else {
      tbody.innerHTML = posts.map(p => `
        <tr>
          <td><strong>${esc(p.title)}</strong><br><small style="color:var(--text-muted)">${esc(p.slug)}</small></td>
          <td>${esc(p.category)}</td>
          <td><span class="badge badge--${p.is_published ? 'published' : 'draft'}">${p.is_published ? 'Published' : 'Draft'}</span></td>
          <td><small>${p.published_at ? new Date(p.published_at).toLocaleDateString() : '—'}</small></td>
          <td class="table__actions">
            <button class="btn btn--sm btn--secondary" onclick="adminEditPost('${p.id}')">Edit</button>
            <button class="btn btn--sm btn--danger" onclick="adminDeletePost('${p.id}','${esc(p.title).replace(/'/g, "\\'")}')">Delete</button>
          </td>
        </tr>
      `).join('');
    }

    document.getElementById('addPostBtn').addEventListener('click', () => showPostEditor());

    window._adminPosts = posts;
  }

  window.adminEditPost = function(id) {
    const post = window._adminPosts.find(p => p.id === id);
    if (post) showPostEditor(post);
  };

  window.adminDeletePost = async function(id, title) {
    if (!confirm('Delete "' + title + '"?')) return;
    const res = await api('admin-blog?id=' + id, { method: 'DELETE' });
    if (res.ok) {
      toast('Post deleted');
      loadBlog(document.getElementById('mainContent'));
    }
  };

  function showPostEditor(post) {
    const isEdit = !!post;
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
      <div class="modal-dialog modal-dialog--wide">
        <div class="modal-header">
          <h2>${isEdit ? 'Edit' : 'New'} Blog Post</h2>
          <button class="btn btn--ghost modal-close">&times;</button>
        </div>
        <div class="modal-body">
          <div class="form-row">
            <div class="form-group"><label>Title *</label><input id="mpTitle" value="${esc(post?.title || '')}"></div>
            <div class="form-group"><label>Slug *</label><input id="mpSlug" value="${esc(post?.slug || '')}" placeholder="auto-generated-from-title"></div>
          </div>
          <div class="form-group"><label>Excerpt</label><textarea id="mpExcerpt" style="min-height:60px;">${esc(post?.excerpt || '')}</textarea></div>
          <div class="form-row">
            <div class="form-group"><label>Category</label>
              <select id="mpCategory">
                <option value="events" ${post?.category === 'events' ? 'selected' : ''}>Events</option>
                <option value="food-drink" ${post?.category === 'food-drink' ? 'selected' : ''}>Food & Drink</option>
                <option value="shopping" ${post?.category === 'shopping' ? 'selected' : ''}>Shopping</option>
                <option value="culture" ${post?.category === 'culture' ? 'selected' : ''}>Culture</option>
                <option value="guides" ${post?.category === 'guides' ? 'selected' : ''}>Guides</option>
              </select>
            </div>
            <div class="form-group"><label>Tags (comma-separated)</label><input id="mpTags" value="${(post?.tags || []).join(', ')}"></div>
          </div>
          <div class="form-row">
            <div class="form-group"><label>Image URL</label><input id="mpImage" value="${esc(post?.image || '')}" placeholder="images/blog/my-post.jpg"></div>
            <div class="form-group"><label>Read Time</label><input id="mpReadTime" value="${esc(post?.read_time || '')}" placeholder="5 min read"></div>
          </div>
          <div class="form-group">
            <label>Content (HTML)</label>
            <div class="editor-tabs">
              <button class="editor-tab active" data-tab="write">Write</button>
              <button class="editor-tab" data-tab="preview">Preview</button>
            </div>
            <textarea class="editor-content" id="mpContent">${esc(post?.content || '')}</textarea>
            <div class="editor-preview" id="mpPreview" style="display:none;"></div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn--secondary modal-close">Cancel</button>
          <button class="btn btn--secondary" id="mpSaveDraft">Save Draft</button>
          <button class="btn btn--primary" id="mpPublish">${isEdit && post.is_published ? 'Update' : 'Publish'}</button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    // Auto-generate slug from title
    const titleInput = document.getElementById('mpTitle');
    const slugInput = document.getElementById('mpSlug');
    if (!isEdit) {
      titleInput.addEventListener('input', () => {
        slugInput.value = titleInput.value
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .replace(/^-|-$/g, '');
      });
    }

    // Editor tabs
    overlay.querySelectorAll('.editor-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        overlay.querySelectorAll('.editor-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const isPreview = tab.dataset.tab === 'preview';
        document.getElementById('mpContent').style.display = isPreview ? 'none' : 'block';
        const previewEl = document.getElementById('mpPreview');
        previewEl.style.display = isPreview ? 'block' : 'none';
        if (isPreview) {
          previewEl.innerHTML = document.getElementById('mpContent').value;
        }
      });
    });

    // Close handlers
    overlay.querySelectorAll('.modal-close').forEach(b => b.addEventListener('click', () => overlay.remove()));
    overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });

    // Save functions
    async function savePost(publish) {
      const data = {
        title: document.getElementById('mpTitle').value,
        slug: document.getElementById('mpSlug').value,
        excerpt: document.getElementById('mpExcerpt').value,
        category: document.getElementById('mpCategory').value,
        tags: document.getElementById('mpTags').value.split(',').map(t => t.trim()).filter(Boolean),
        image: document.getElementById('mpImage').value,
        read_time: document.getElementById('mpReadTime').value,
        content: document.getElementById('mpContent').value,
        is_published: publish
      };

      if (!data.title || !data.slug) {
        alert('Title and slug are required');
        return;
      }

      let res;
      if (isEdit) {
        data.id = post.id;
        if (publish && !post.published_at) data.published_at = new Date().toISOString();
        res = await api('admin-blog?id=' + post.id, { method: 'PUT', body: JSON.stringify(data) });
      } else {
        if (publish) data.published_at = new Date().toISOString();
        res = await api('admin-blog', { method: 'POST', body: JSON.stringify(data) });
      }

      if (res.ok) {
        overlay.remove();
        toast(publish ? 'Post published' : 'Draft saved');
        loadBlog(document.getElementById('mainContent'));
      } else {
        const err = await res.json();
        alert('Error: ' + (err.error || 'Unknown error'));
      }
    }

    document.getElementById('mpSaveDraft').addEventListener('click', () => savePost(false));
    document.getElementById('mpPublish').addEventListener('click', () => savePost(true));
  }

  // ============================================
  // BOOT
  // ============================================
  if (token) {
    renderApp();
  } else {
    renderLogin();
  }

})();
