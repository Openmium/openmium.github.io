// js/reviews-page.js
// Manejo de la página "Reseñas": carga data/reviews.json, render, filtros y modal galería.

document.addEventListener('DOMContentLoaded', () => {
  const DATA = 'data/reviews.json';
  const reviewsList = document.getElementById('reviewsList');
  const searchBox = document.getElementById('searchBox');
  const categorySelect = document.getElementById('categorySelect');
  const subSelect = document.getElementById('subSelect');
  const dateFilter = document.getElementById('dateFilter');
  const clearFilters = document.getElementById('clearFilters');
  const detailModal = document.getElementById('detailModal');
  const detailContent = document.getElementById('detailContent');
  const closeDetail = document.getElementById('closeDetail');

  const esc = window.utils?.escapeHtml || (s => String(s || ''));
  const fmt = window.utils?.formatDateToDDMMYYYY || (s => s);

  let REVIEWS = [];
  let CATEGORIES = [];

  function renderStars(rating) {
    if (rating == null) return '';
    const full = Math.floor(rating);
    const half = (rating - full) >= 0.5 ? 1 : 0;
    const empty = 5 - full - half;
    let out = '<span class="stars" aria-hidden="true">';
    for (let i = 0; i < full; i++) out += `<span class="star full">★</span>`;
    if (half) out += `<span class="star half" style="background:linear-gradient(90deg,#f5b301 50%, #ddd 50%);-webkit-background-clip:text;background-clip:text;color:transparent">★</span>`;
    for (let i = 0; i < empty; i++) out += `<span class="star empty">★</span>`;
    out += `</span> <span style="font-size:13px;color:var(--muted);margin-left:8px">(${rating}/5)</span>`;
    return out;
  }

  // Detecta si el lienzo de la imagen contiene mucho blanco (sampling).
  function detectWhiteBackground(img) {
    try {
      if (!img || !img.naturalWidth || !img.naturalHeight) return false;
      const W = Math.min(64, img.naturalWidth);
      const H = Math.min(64, img.naturalHeight);
      const canvas = document.createElement('canvas');
      canvas.width = W;
      canvas.height = H;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, W, H);
      const data = ctx.getImageData(0, 0, W, H).data;
      let whiteCount = 0;
      let totalCount = 0;
      const stepX = Math.max(1, Math.floor(W / 8));
      const stepY = Math.max(1, Math.floor(H / 8));
      for (let y = 0; y < H; y += stepY) {
        for (let x = 0; x < W; x += stepX) {
          const idx = (y * W + x) * 4;
          const r = data[idx], g = data[idx + 1], b = data[idx + 2], a = data[idx + 3];
          if (a > 32 && r > 230 && g > 230 && b > 230) whiteCount++;
          totalCount++;
        }
      }
      return (totalCount > 0) && (whiteCount / totalCount >= 0.12);
    } catch (e) {
      return false;
    }
  }

  // Nueva versión: no fuerza 'cover' en thumbs. Sólo aplica background/padding cuando detecta lienzo blanco.
  function handleImageFit(img) {
    if (!img) return;
    if (!img.complete) {
      img.addEventListener('load', () => handleImageFit(img), { once: true });
      return;
    }
    try {
      const w = img.naturalWidth || img.width;
      const h = img.naturalHeight || img.height;
      const ratio = (w && h) ? (w / h) : 1;
      const parent = img.closest('.book-thumb, .review-thumb, .modal-thumbs, .modal-main');

      const likelyWhite = detectWhiteBackground(img);

      // Si la imagen está dentro de una miniatura (lista), dejamos que CSS controle object-fit,
      // y sólo aplicamos fondo/padding si detectamos lienzo blanco.
      if (parent && (parent.classList.contains('book-thumb') || parent.classList.contains('review-thumb'))) {
        if (likelyWhite || ratio < 0.35 || ratio > 3) {
          img.style.padding = '6px';
          img.style.background = '#1a1a1a';
          img.style.boxSizing = 'border-box';
        } else {
          img.style.padding = '0';
          img.style.background = 'transparent';
        }
        // no forzamos objectFit aquí (CSS general con !important lo tratará)
      } else {
        // Modal / imagen grande: nos aseguramos de mostrar la imagen completa (contain).
        if (ratio < 0.6 || ratio > 1.8 || likelyWhite) {
          img.style.objectFit = 'contain';
          img.style.background = '#1a1a1a';
          img.style.padding = '6px';
        } else {
          img.style.objectFit = 'contain'; // preferimos contain para modal principales (evita recorte)
          img.style.background = 'transparent';
          img.style.padding = '0';
        }
        img.style.width = 'auto';
        img.style.maxWidth = '100%';
        img.style.height = 'auto';
        img.style.maxHeight = '80vh';
      }

      img.style.objectPosition = 'center';
      img.style.display = 'block';
    } catch (e) {
      // silent fail
    }
  }

  // Normaliza object-fit según proporción natural — se llamará tras renderizar
  function normalizeCardImages(){
    const sel = '.book-thumb img, .review-thumb img, .modal-thumbs img, .review-card img, .book-card img';
    document.querySelectorAll(sel).forEach(img => {
      const apply = (i) => {
        try {
          const w = i.naturalWidth || i.width;
          const h = i.naturalHeight || i.height;
          if(!w || !h) return;
          const r = w / h;
          // para miniaturas: preferimos contain (mostrar entero)
          if (i.closest('.book-thumb') || i.closest('.review-thumb')) {
            i.style.width = 'auto';
            i.style.height = '100%';
            i.style.maxWidth = '100%';
            i.style.objectFit = 'contain';
            i.style.objectPosition = 'center';
            i.style.background = '#1a1a1a';
            i.style.display = 'block';
          } else if (i.closest('.modal-thumbs')) {
            // modal miniaturas: cover
            i.style.width = '100%';
            i.style.height = '72px';
            i.style.objectFit = 'cover';
            i.style.objectPosition = 'center';
            i.style.background = '#1a1a1a';
            i.style.display = 'block';
          } else {
            // fallback
            if(r < 0.6 || r > 1.8) {
              i.style.objectFit = 'contain';
              i.style.background = '#1a1a1a';
              i.style.padding = '6px';
            } else {
              i.style.objectFit = 'cover';
              i.style.background = 'transparent';
            }
            i.style.display = 'block';
          }
        } catch(e){}
      };
      if(!img.complete) img.addEventListener('load', () => { apply(img); handleImageFit(img); }, { once: true });
      else { apply(img); handleImageFit(img); }
    });
  }

  async function loadData() {
    try {
      const res = await fetch(DATA, { cache: 'no-store' });
      if (!res.ok) throw new Error('No se pudo cargar ' + DATA + ' (status ' + res.status + ')');
      const j = await res.json();
      REVIEWS = j.reviews || [];
      CATEGORIES = j.categories || [];
    } catch (err) {
      console.error(err); REVIEWS = []; CATEGORIES = [];
      if (reviewsList) reviewsList.innerHTML = '<div class="card">Error cargando reseñas (revisa consola).</div>';
    }
    populateCategoryFilters();
    renderList(REVIEWS);
    normalizeCardImages();
  }

  function populateCategoryFilters() {
    if (!categorySelect) return;
    categorySelect.innerHTML = '<option value="all">Todas las categorías</option>';
    CATEGORIES.forEach(c => {
      const o = document.createElement('option'); o.value = c.id; o.textContent = c.label; categorySelect.appendChild(o);
    });
  }

  function populateSubSelect(catId) {
    if (!subSelect) return;
    subSelect.innerHTML = '<option value="all">Todas las subcategorías</option>';
    if (catId && catId !== 'all') {
      const cat = CATEGORIES.find(x => x.id === catId);
      if (cat && Array.isArray(cat.subs)) {
        cat.subs.forEach(s => { const o = document.createElement('option'); o.value = s; o.textContent = s; subSelect.appendChild(o); });
      }
    }
  }

  function renderList(list) {
    if (!reviewsList) return;
    reviewsList.innerHTML = '';
    if (!list || list.length === 0) { reviewsList.innerHTML = '<div class="card">No hay reseñas.</div>'; return; }
    list.forEach(r => {
      const article = document.createElement('article');
      article.className = 'review-card';
      article.tabIndex = 0;
      const thumb = (r.images && r.images[0]) ? r.images[0] : 'assets/covers/placeholder.jpg';
      article.innerHTML = `
        <div class="review-thumb"><img src="${esc(thumb)}" alt="${esc(r.title || '')}"></div>
        <div class="card-body">
          <div class="card-meta">${fmt(r.date || '')} · ${esc(r.category || '')} › ${esc(r.sub || '')}</div>
          <h3 class="card-title">${esc(r.title)}</h3>
          <div class="card-desc">${esc(r.summary || '')}</div>
          <div class="row-bottom">
            <div style="display:flex;align-items:center;gap:10px">
              ${renderStars(r.rating)}
              ${r.price ? `<div class="price">${esc(r.price)}</div>` : ''}
            </div>
            <div>${r.link ? `<a class="product-link-btn" href="${esc(r.link)}" target="_blank" rel="noopener">Ir al producto</a>` : ''}</div>
          </div>
        </div>
      `;
      const img = article.querySelector('img');
      handleImageFit(img);

      article.addEventListener('click', (e) => {
        if (e.target.closest('a')) return;
        openDetail(r.id);
      });
      article.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') openDetail(r.id); });

      reviewsList.appendChild(article);
    });
  }

  function openDetail(id) {
    const item = REVIEWS.find(x => x.id === id);
    if (!item) return;
    const imgs = (item.images || []).slice(0, 8);
    let galleryHtml = '';
    if (imgs.length) {
      galleryHtml += `<div class="modal-layout" style="align-items:flex-start">`;
      galleryHtml += `<div class="modal-main" style="flex:1;min-width:320px"><img id="mainImg" src="${esc(imgs[0])}" alt="${esc(item.title || '')}"></div>`;
      galleryHtml += `<div class="modal-thumbs" style="width:120px">`;
      imgs.forEach(u => galleryHtml += `<img class="thumb" src="${esc(u)}" data-src="${esc(u)}" alt="">`);
      galleryHtml += `</div></div>`;
    }
    const starsHtml = item.rating ? renderStars(item.rating) : '';
    const priceHtml = item.price ? `<div class="price">${esc(item.price)}</div>` : '';
    const linkHtml = item.link ? `<div style="margin-top:12px"><a class="btn btn-primary" href="${esc(item.link)}" target="_blank" rel="noopener">Ver producto</a></div>` : '';
    detailContent.innerHTML = `
      ${galleryHtml}
      <div class="modal-meta">${fmt(item.date || '')} · ${esc(item.category || '')} / ${esc(item.sub || '')}</div>
      <h2 class="modal-title">${esc(item.title)}</h2>
      ${starsHtml}
      ${priceHtml}
      <p class="modal-desc" style="margin-top:8px">${esc(item.content || item.summary || '')}</p>
      ${linkHtml}
    `;

    // aplicar estilos y behavior a imagen principal y thumbs
    setTimeout(() => {
      const main = document.getElementById('mainImg');

      const applyMainStyles = (m) => {
        if (!m) return;
        m.style.objectFit = 'contain';
        m.style.objectPosition = 'center';
        m.style.width = 'auto';
        m.style.maxWidth = '100%';
        m.style.height = 'auto';
        m.style.maxHeight = '80vh';
        m.style.background = 'transparent';
        m.style.padding = '0';
        m.style.display = 'block';
        try { m.removeAttribute('width'); m.removeAttribute('height'); } catch (e) { }
      };

      if (main) {
        applyMainStyles(main);
        if (!main.complete) main.addEventListener('load', () => applyMainStyles(main), { once: true });
        handleImageFit(main);
      }

      detailContent.querySelectorAll('.thumb').forEach(t => {
        t.style.width = '100%';
        t.style.height = '72px';
        t.style.objectFit = 'cover';
        t.style.objectPosition = 'center';
        t.style.background = '#1a1a1a';
        t.style.display = 'block';
        handleImageFit(t);

        t.addEventListener('click', (e) => {
          const src = e.currentTarget.dataset.src;
          const m = document.getElementById('mainImg');
          if (!m) return;
          const onloadHandler = () => {
            applyMainStyles(m);
            handleImageFit(m);
            m.removeEventListener('load', onloadHandler);
          };
          m.addEventListener('load', onloadHandler);
          m.src = src;
        }, { once: false });
      });

      // Normalizar thumbs/imagenes del modal tras generarlas
      normalizeCardImages();
    }, 20);

    detailModal.classList.add('open'); detailModal.setAttribute('aria-hidden', 'false');
  }

  // close handlers
  if (closeDetail) closeDetail.addEventListener('click', () => { detailModal.classList.remove('open'); detailModal.setAttribute('aria-hidden', 'true'); });
  if (detailModal) detailModal.addEventListener('click', (e) => {
    const mc = detailModal.querySelector('.modal-card');
    if (!mc) return;
    if (!mc.contains(e.target)) { detailModal.classList.remove('open'); detailModal.setAttribute('aria-hidden', 'true'); }
  });

  // filters
  if (searchBox) searchBox.addEventListener('input', applyFilters);
  if (categorySelect) categorySelect.addEventListener('change', (e) => { populateSubSelect(e.target.value); applyFilters(); });
  if (subSelect) subSelect.addEventListener('change', applyFilters);
  if (dateFilter) dateFilter.addEventListener('change', applyFilters);
  if (clearFilters) clearFilters.addEventListener('click', () => {
    if (searchBox) searchBox.value = ''; if (categorySelect) categorySelect.value = 'all'; if (subSelect) subSelect.innerHTML = '<option value="all">Todas las subcategorías</option>'; if (dateFilter) dateFilter.value = ''; renderList(REVIEWS); normalizeCardImages();
  });

  function applyFilters() {
    const q = (searchBox?.value || '').trim().toLowerCase();
    const cat = categorySelect?.value;
    const sub = subSelect?.value;
    const date = dateFilter?.value;
    let filtered = REVIEWS.slice();
    if (cat && cat !== 'all') filtered = filtered.filter(r => r.category === cat);
    if (sub && sub !== 'all') filtered = filtered.filter(r => r.sub === sub);
    if (q) filtered = filtered.filter(r => ((r.title || '') + ' ' + (r.summary || '') + ' ' + (r.tags || []).join(' ')).toLowerCase().includes(q));
    if (date) {
      const target = fmt(date);
      filtered = filtered.filter(r => fmt(r.date || '') === target);
    }
    renderList(filtered);
    normalizeCardImages();
  }

  loadData();
}); // end DOMContentLoaded
