/* ============================================
   Rice Village Shops — Sponsor Slots
   Renders paid sponsor placements from /data/sponsors.json
   into every [data-sponsor-slot] element. When no sponsors
   are active, shows an "Advertise With Us" call-to-action.
   ============================================ */
(function () {
  'use strict';

  function goAdvertise(e) {
    e.preventDefault();
    if (typeof window.openAdvertise === 'function') {
      window.openAdvertise();
    } else {
      window.location.href = '/?advertise=1';
    }
  }

  function renderCTA(slot) {
    slot.classList.add('sponsor-slot--cta');
    slot.innerHTML =
      '<div class="sponsor-slot__inner">' +
      '  <span class="sponsor-slot__label">Sponsorship Available</span>' +
      '  <p class="sponsor-slot__headline">Put your business in front of Rice Village shoppers</p>' +
      '  <button class="btn btn--primary sponsor-slot__btn" type="button">Advertise With Us</button>' +
      '</div>';
    slot.querySelector('button').addEventListener('click', goAdvertise);
  }

  function renderSponsor(slot, s) {
    slot.classList.add('sponsor-slot--active');
    var url = s.website && /^https?:\/\//.test(s.website) ? s.website : null;
    var inner =
      '<div class="sponsor-slot__inner">' +
      '  <span class="sponsor-slot__label">Sponsored</span>' +
      '  <div class="sponsor-slot__body">' +
      (s.image ? '<img class="sponsor-slot__img" src="' + s.image + '" alt="' + (s.name || 'Sponsor') + '" loading="lazy">' : '') +
      '    <div class="sponsor-slot__text">' +
      '      <p class="sponsor-slot__headline">' + (s.headline || s.name || '') + '</p>' +
      (s.blurb ? '<p class="sponsor-slot__blurb">' + s.blurb + '</p>' : '') +
      '    </div>' +
      (url ? '<span class="btn btn--primary sponsor-slot__btn">Visit</span>' : '') +
      '  </div>' +
      '</div>';
    if (url) {
      var a = document.createElement('a');
      a.href = url;
      a.target = '_blank';
      a.rel = 'noopener sponsored';
      a.className = 'sponsor-slot__link';
      a.innerHTML = inner;
      slot.appendChild(a);
    } else {
      slot.innerHTML = inner;
    }
  }

  function init() {
    var slots = document.querySelectorAll('[data-sponsor-slot]');
    if (!slots.length) return;

    fetch('/data/sponsors.json')
      .then(function (r) { return r.ok ? r.json() : []; })
      .catch(function () { return []; })
      .then(function (sponsors) {
        var active = (sponsors || []).filter(function (s) { return s.status === 'active'; });
        slots.forEach(function (slot, i) {
          if (active.length) {
            renderSponsor(slot, active[i % active.length]);
          } else {
            renderCTA(slot);
          }
        });
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
