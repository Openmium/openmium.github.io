// js/reviews-page.js
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

  let REVIEWS = [];
  let CATEGORIES = [];

  function renderStars(rating){
    if(rating==null) return '';
    const full = Math.floor(rating);
    const half = (rating - full) >= 0.5 ? '½' : '';
    let s = '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(5 - full - (half?1:0));
    return `<span style="color:#f5b301;font-weight:800">${s}</span> <span style="font-size:13px;color:var(--muted);margin-left:8px">(${rating}/5)</span>`;
  }

  async function loadData(){
    try {
      const res = await fetch(DATA, {cache:'no-store'});
      if(!res.ok) throw new Error('No se pudo cargar ' + DATA);
      const j = await res.json();
      REVIEWS = j.reviews || [];
      CATEGORIES = j.categories || [];
    } catch(err){
      console.error(err); REVIEWS = []; CATEGORIES = [];
      if(reviewsList) reviewsList.innerHTML = '<div class="card">Error cargando reseñas (revisa consola).</div>';
    }
    populateCategoryFilters();
    renderList(REVIEWS);
  }

  function populateCategoryFilters(){
    categorySelect.innerHTML = '<option value="all">Todas las categorías</option>';
    CATEGORIES.forEach(c => {
      const o = document.createElement('option'); o.value = c.id; o.textContent = c.label; categorySelect.appendChild(o);
    });
  }

  function populateSubSelect(catId){
    subSelect.innerHTML = '<option value="all">Todas las subcategorías</option>';
    if(catId && catId!=='all'){
      const cat = CATEGORIES.find(x=>x.id===catId);
      if(cat && Array.isArray(cat.subs)){
        cat.subs.forEach(s => { const o = document.createElement('option'); o.value = s; o.textContent = s; subSelect.appendChild(o); });
      }
    }
  }

  function renderList(list){
    reviewsList.innerHTML = '';
    if(!list.length){ reviewsList.innerHTML = '<div class="card">No hay reseñas.</div>'; return; }
    list.forEach(r => {
      const article = document.createElement('article');
      article.className = 'review-card';
      article.tabIndex = 0;
      const thumb = (r.images && r.images[0]) ? r.images[0] : 'assets/covers/placeholder.jpg';
      article.innerHTML = `
        <div class="review-thumb"><img src="${escapeHtml(thumb)}" alt=""></div>
        <div class="review-body">
          <div class="meta">${formatDateToDDMMYYYY(r.date || '')} · ${escapeHtml(r.category || '')} › ${escapeHtml(r.sub || '')}</div>
          <h3 style="margin:4px 0;color:var(--title-color)">${escapeHtml(r.title)}</h3>
          <p class="note">${escapeHtml(r.summary || '')}</p>
          <div style="display:flex;gap:10px;align-items:center;margin-top:8px">
            ${renderStars(r.rating)}
            ${ r.price ? `<div class="price">${escapeHtml(r.price)}</div>` : '' }
            <div style="margin-left:auto">${ r.link ? `<a class="product-link-btn" href="${r.link}" target="_blank" rel="noopener">Ir al producto</a>` : '' }</div>
          </div>
        </div>
      `;
      article.addEventListener('click', ()=> openDetail(r.id));
      article.addEventListener('keydown', (e)=> { if(e.key==='Enter' || e.key===' ') openDetail(r.id); });
      reviewsList.appendChild(article);
    });
  }

  function openDetail(id){
    const item = REVIEWS.find(x=>x.id === id);
    if(!item) return;
    const imgs = (item.images || []).slice(0,8);
    let gallery = '';
    if(imgs.length){
      gallery += '<div class="modal-gallery">';
      gallery += `<div class="modal-main-img"><img id="mainImg" src="${escapeHtml(imgs[0])}" alt=""></div>`;
      gallery += '<div class="modal-thumbs">';
      imgs.forEach(u => gallery += `<img class="thumb" src="${escapeHtml(u)}" data-src="${escapeHtml(u)}">`);
      gallery += '</div></div>';
    }
    const stars = item.rating ? renderStars(item.rating) : '';
    const price = item.price ? `<div class="price">${escapeHtml(item.price)}</div>` : '';
    const link = item.link ? `<div style="margin-top:12px"><a class="btn btn-primary" href="${item.link}" target="_blank" rel="noopener">Ver producto</a></div>` : '';
    detailContent.innerHTML = `${gallery}
      <div class="meta" style="margin-top:10px">${formatDateToDDMMYYYY(item.date || '')} · ${escapeHtml(item.category || '')} / ${escapeHtml(item.sub || '')}</div>
      <h2 style="margin:8px 0;color:var(--title-color)">${escapeHtml(item.title)}</h2>
      ${stars}
      ${price}
      <p class="note" style="margin-top:8px">${escapeHtml(item.content || item.summary || '')}</p>
      ${link}
    `;
    // attach thumb handlers
    setTimeout(()=> {
      detailContent.querySelectorAll('.thumb').forEach(t => t.addEventListener('click', (e) => {
        const src = e.currentTarget.dataset.src;
        const main = document.getElementById('mainImg');
        if(main) main.src = src;
      }));
    }, 20);

    detailModal.classList.add('open'); detailModal.setAttribute('aria-hidden','false');
  }

  // close handlers
  if(closeDetail) closeDetail.addEventListener('click', ()=> { detailModal.classList.remove('open'); detailModal.setAttribute('aria-hidden','true'); });
  detailModal && detailModal.addEventListener('click', (e)=> {
    const mc = detailModal.querySelector('.modal-card');
    if(!mc) return;
    if(!mc.contains(e.target)) { detailModal.classList.remove('open'); detailModal.setAttribute('aria-hidden','true'); }
  });

  // filters
  searchBox && searchBox.addEventListener('input', applyFilters);
  categorySelect && categorySelect.addEventListener('change', (e) => { populateSubSelect(e.target.value); applyFilters(); });
  subSelect && subSelect.addEventListener('change', applyFilters);
  dateFilter && dateFilter.addEventListener('change', applyFilters);
  clearFilters && clearFilters.addEventListener('click', () => {
    if(searchBox) searchBox.value=''; if(categorySelect) categorySelect.value='all'; subSelect.innerHTML='<option value="all">Todas las subcategorías</option>'; if(dateFilter) dateFilter.value=''; renderList(REVIEWS);
  });

  function applyFilters(){
    const q = (searchBox.value || '').trim().toLowerCase();
    const cat = categorySelect.value;
    const sub = subSelect.value;
    const date = dateFilter.value;
    let filtered = REVIEWS.slice();
    if(cat && cat !== 'all') filtered = filtered.filter(r => r.category === cat);
    if(sub && sub !== 'all') filtered = filtered.filter(r => r.sub === sub);
    if(q) filtered = filtered.filter(r => (r.title + ' ' + (r.summary||'') + ' ' + (r.tags||[]).join(' ')).toLowerCase().includes(q));
    if(date){
      const target = formatDateToDDMMYYYY(date);
      filtered = filtered.filter(r => formatDateToDDMMYYYY(r.date || '') === target);
    }
    renderList(filtered);
  }

  loadData();
});
