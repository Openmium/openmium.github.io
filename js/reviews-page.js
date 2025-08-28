// js/reviews-page.js
document.addEventListener('DOMContentLoaded', async () => {
  const DATA_PATH = 'data/reviews.json';
  let REVIEWS = [];
  let CATEGORIES = [];

  try {
    const json = await AppUtils.fetchJSON(DATA_PATH);
    REVIEWS = json.reviews || [];
    CATEGORIES = json.categories || [];
  } catch (err) {
    console.error(err);
    document.getElementById('reviewsList').innerHTML = `<div class="card">Error cargando datos. Mira la consola (F12).</div>`;
    return;
  }

  const catSelect = document.getElementById('categorySelect');
  const subSelect = document.getElementById('subSelect');
  const searchBox = document.getElementById('searchBox');
  const dateFilter = document.getElementById('dateFilter');
  const clearBtn = document.getElementById('clearFilters');

  // populate categories
  catSelect.innerHTML = '<option value="all">Todas las categorías</option>';
  CATEGORIES.forEach(c => {
    const o = document.createElement('option'); o.value = c.id; o.textContent = c.label; catSelect.appendChild(o);
  });

  function populateSubSelect(catId){
    subSelect.innerHTML = '<option value="all">Todas las subcategorías</option>';
    if(catId && catId !== 'all'){
      const cat = CATEGORIES.find(c => c.id === catId);
      if(cat && Array.isArray(cat.subs)){
        cat.subs.forEach(s => { const o = document.createElement('option'); o.value = s; o.textContent = s; subSelect.appendChild(o); });
      }
    }
  }

  function renderStars(rating){
    if(rating == null) return '';
    const full = Math.floor(rating);
    const half = (rating - full) >= 0.5 ? 1 : 0;
    const empty = 5 - full - half;
    let out = '<span class="stars" aria-hidden="true">';
    for(let i=0;i<full;i++) out += '<span class="star full">★</span>';
    if(half) out += '<span class="star half">★</span>';
    for(let i=0;i<empty;i++) out += '<span class="star empty">★</span>';
    out += `</span> <span style="font-size:13px;color:var(--muted);margin-left:6px">(${rating}/5)</span>`;
    return out;
  }

  function renderList(list){
    const container = document.getElementById('reviewsList');
    container.innerHTML = '';
    if(!list.length){ container.innerHTML = '<div class="card">No hay reseñas.</div>'; return; }
    list.forEach(r => {
      const dateStr = AppUtils.formatDateToDDMMYYYY(r.date || '');
      const thumb = (r.images && r.images[0]) ? r.images[0] : 'assets/covers/placeholder.jpg';
      const priceHtml = r.price ? `<div class="price">${AppUtils.escapeHtml(r.price)}</div>` : '';
      const starsHtml = r.rating ? renderStars(r.rating) : '';
      const card = document.createElement('article');
      card.className = 'review-card';
      card.tabIndex = 0;
      card.innerHTML = `
        <div style="display:flex;gap:12px;align-items:flex-start;flex:1">
          <div class="review-thumb"><img src="${thumb}" alt=""></div>
          <div class="review-body">
            <div class="meta">${AppUtils.escapeHtml(dateStr)} · ${AppUtils.escapeHtml(r.category||'')} › ${AppUtils.escapeHtml(r.sub||'')}</div>
            <h3 style="margin:0 0 4px 0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${AppUtils.escapeHtml(r.title)}</h3>
            <p class="note" style="margin:0">${AppUtils.escapeHtml(r.summary || '')}</p>
            <div style="display:flex;gap:12px;align-items:center;flex-wrap:wrap;margin-top:6px">
              ${starsHtml}
              ${priceHtml}
            </div>
          </div>
        </div>
        <div class="review-right">
          ${ r.link ? `<a class="product-link-btn" href="${r.link}" target="_blank" rel="noopener">Ver producto</a>` : '' }
        </div>
      `;
      card.addEventListener('click', ()=> openDetail(r.id));
      card.addEventListener('keydown', (e)=> { if(e.key === 'Enter' || e.key === ' ') openDetail(r.id); });
      // stop propagation on product link
      const temp = document.createElement('div');
      temp.innerHTML = card.innerHTML;
      container.appendChild(card);
      const btn = card.querySelector('.product-link-btn');
      if(btn) btn.addEventListener('click', (ev) => ev.stopPropagation());
    });
  }

  function openDetail(id){
    const item = REVIEWS.find(x => x.id === id); if(!item) return;
    const imgs = (item.images || []).slice(0,8);
    let galleryHtml = '';
    if(imgs.length){
      galleryHtml += '<div style="display:flex;gap:12px;flex-wrap:wrap;margin-bottom:12px;align-items:flex-start">';
      galleryHtml += `<div id="mainImg" style="flex:1;min-width:220px"><img src="${imgs[0]}" style="width:100%;height:auto;max-height:420px;object-fit:cover;border-radius:6px"></div>`;
      galleryHtml += '<div style="display:flex;flex-direction:column;gap:8px;min-width:110px;margin-top:8px">';
      imgs.forEach((u)=>{ galleryHtml += `<img class="thumb" src="${u}" data-src="${u}" style="width:100px;height:70px;object-fit:cover;border-radius:4px;cursor:pointer">`; });
      galleryHtml += '</div></div>';
    }
    const dateStr = AppUtils.formatDateToDDMMYYYY(item.date || '');
    const starsHtml = item.rating ? renderStars(item.rating) : '';
    const priceHtml = item.price ? `<div class="price">${AppUtils.escapeHtml(item.price)}</div>` : '';
    const linkHtml = item.link ? `<div style="margin-top:12px"><a class="btn btn-primary" href="${item.link}" target="_blank" rel="noopener">Ver producto</a></div>` : '';
    document.getElementById('detailContent').innerHTML = `${galleryHtml}
      <div class="meta">${AppUtils.escapeHtml(dateStr)} · ${AppUtils.escapeHtml(item.category||'')} / ${AppUtils.escapeHtml(item.sub||'')}</div>
      <h2 style="margin:8px 0">${AppUtils.escapeHtml(item.title)}</h2>
      ${starsHtml}
      ${priceHtml}
      <p class="note" style="margin-top:8px">${AppUtils.escapeHtml(item.content || item.summary || '')}</p>
      ${linkHtml}
    `;
    setTimeout(()=>{
      document.querySelectorAll('#detailContent .thumb').forEach(t => t.addEventListener('click', (e)=>{
        const src = e.currentTarget.dataset.src;
        const main = document.getElementById('mainImg');
        if(main) main.querySelector('img').src = src;
      }));
    }, 20);
    const modal = document.getElementById('detailModal'); modal.classList.add('open'); modal.setAttribute('aria-hidden','false');
  }

  // modal close handlers
  const detailModal = document.getElementById('detailModal');
  document.getElementById('closeDetail').addEventListener('click', ()=> { detailModal.classList.remove('open'); detailModal.setAttribute('aria-hidden','true'); });
  detailModal.addEventListener('click', (e)=> { if(e.target === detailModal){ detailModal.classList.remove('open'); detailModal.setAttribute('aria-hidden','true'); } });
  document.addEventListener('keydown', (e)=> { if(e.key === 'Escape' && detailModal.classList.contains('open')) { detailModal.classList.remove('open'); detailModal.setAttribute('aria-hidden','true'); } });

  // filters bindings
  searchBox.addEventListener('input', applyFilters);
  catSelect.addEventListener('change', (e)=> { populateSubSelect(e.currentTarget.value); applyFilters(); });
  subSelect.addEventListener('change', applyFilters);
  dateFilter.addEventListener('change', applyFilters);
  clearBtn.addEventListener('click', ()=> {
    searchBox.value = '';
    catSelect.value = 'all';
    subSelect.innerHTML = '<option value="all">Todas las subcategorías</option>';
    dateFilter.value = '';
    renderList(REVIEWS);
  });

  function applyFilters(){
    const q = searchBox.value.trim().toLowerCase();
    const cat = catSelect.value;
    const sub = subSelect.value;
    const date = dateFilter.value;
    let filtered = REVIEWS.slice();
    if(cat && cat !== 'all') filtered = filtered.filter(r => r.category === cat);
    if(sub && sub !== 'all') filtered = filtered.filter(r => r.sub === sub);
    if(q) filtered = filtered.filter(r => (r.title + ' ' + (r.summary||'') + ' ' + (r.tags||[]).join(' ')).toLowerCase().includes(q));
    if(date){
      const target = AppUtils.formatDateToDDMMYYYY(date);
      filtered = filtered.filter(r => AppUtils.formatDateToDDMMYYYY(r.date || '') === target);
    }
    renderList(filtered);
  }

  // initial render
  renderList(REVIEWS);
});
