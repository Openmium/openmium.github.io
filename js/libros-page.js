// js/libros-page.js
const DATA_BOOKS = 'data/books.json';
let BOOKS = [];

function escapeHtml(s){ if(!s) return ''; return String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;'); }

function formatDateToDDMMYYYY(raw){
  if(!raw) return '';
  if(/^\d{2}-\d{2}-\d{4}$/.test(raw)) return raw;
  if(/^\d{4}-\d{2}-\d{2}$/.test(raw)){ const [y,m,d] = raw.split('-'); return `${d}-${m}-${y}`; }
  const date = new Date(raw);
  if(!isNaN(date)){ const d = String(date.getDate()).padStart(2,'0'); const m = String(date.getMonth()+1).padStart(2,'0'); const y = date.getFullYear(); return `${d}-${m}-${y}`; }
  return raw;
}

async function loadBooks(){
  try{
    const res = await fetch(DATA_BOOKS, {cache:'no-store'});
    if(!res.ok) throw new Error('No se pudo cargar ' + DATA_BOOKS + ' - ' + res.status);
    const json = await res.json();
    BOOKS = json.books || [];
  }catch(err){
    console.error(err);
    document.getElementById('booksGrid').innerHTML = `<div class="card">Error cargando libros. Mira la consola.</div>`;
    BOOKS = [];
  }
  renderBooks(BOOKS);
}

function renderBooks(list){
  const grid = document.getElementById('booksGrid');
  if(!grid) return;
  grid.innerHTML = '';
  if(!list || list.length === 0){
    grid.innerHTML = '<div class="card">No hay libros aún. Añade editando data/books.json</div>'; return;
  }
  list.forEach((b, idx) => {
    const el = document.createElement('article');
    el.className = 'book-card card';
    el.tabIndex = 0;
    el.innerHTML = `
      <img src="${b.cover || 'assets/covers/placeholder.jpg'}" alt="${escapeHtml(b.title)}">
      <div class="book-info">
        <div>
          <div class="book-title">${escapeHtml(b.title)}</div>
          <div class="book-subtitle">${escapeHtml(b.subtitle || '')}</div>
          <p class="note" style="margin-top:8px">${escapeHtml((b.description||'').slice(0,220))}</p>
        </div>
        <div style="margin-top:10px;display:flex;gap:8px;align-items:center;flex-wrap:wrap">
          <div class="meta">${b.date ? formatDateToDDMMYYYY(b.date) : ''}</div>
          <div style="margin-left:auto">
            <a class="btn btn-primary" href="${b.amazon || '#'}" target="_blank" rel="noopener">Comprar</a>
          </div>
        </div>
      </div>
    `;
    el.addEventListener('click', ()=> openBookModal(idx));
    el.addEventListener('keydown', (e)=> { if(e.key==='Enter' || e.key===' ') openBookModal(idx); });
    grid.appendChild(el);
  });
}

/* Book modal */
function openBookModal(idx){
  const b = BOOKS[idx]; if(!b) return;
  const modal = document.getElementById('bookModal');
  const content = document.getElementById('bookModalContent');
  content.innerHTML = `
    <div style="display:flex;gap:14px;flex-wrap:wrap;align-items:flex-start">
      <div style="min-width:160px"><img src="${b.cover || 'assets/covers/placeholder.jpg'}" alt="${escapeHtml(b.title)}" style="width:160px;height:240px;object-fit:cover;border-radius:6px"></div>
      <div style="flex:1">
        <h2 style="color:var(--title)">${escapeHtml(b.title)}</h2>
        <p class="meta">${escapeHtml(b.subtitle || '')} ${b.date ? '· ' + formatDateToDDMMYYYY(b.date) : ''}</p>
        <p style="margin-top:8px">${escapeHtml(b.description || '')}</p>
        <div style="margin-top:12px;display:flex;gap:8px;flex-wrap:wrap">
          <a class="btn btn-primary" href="${b.amazon || '#'}" target="_blank" rel="noopener">Comprar</a>
        </div>
      </div>
    </div>
  `;
  modal.classList.add('open'); modal.setAttribute('aria-hidden','false');
}

/* close handlers */
document.addEventListener('click', (e) => {
  const modal = document.getElementById('bookModal');
  if(!modal) return;
  if(modal.classList.contains('open')){
    const card = modal.querySelector('.modal-card');
    if(card && !card.contains(e.target) && !e.target.closest('.book-card')){
      modal.classList.remove('open'); modal.setAttribute('aria-hidden','true');
    }
  }
});
function setupBookModalClose(){
  const closeBtn = document.getElementById('closeBookModal');
  if(closeBtn) closeBtn.addEventListener('click', ()=> {
    const modal = document.getElementById('bookModal'); modal.classList.remove('open'); modal.setAttribute('aria-hidden','true');
  });
}

/* init */
document.addEventListener('DOMContentLoaded', ()=> {
  loadBooks().then(()=> setupBookModalClose());
});
