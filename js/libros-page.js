// js/libros-page.js
// Helper (auto-containing small helpers para no depender de AppUtils)
const BooksUtils = {
  fetchJSON: async (path) => {
    const r = await fetch(path, { cache: "no-store" });
    if(!r.ok) throw new Error(`Failed to load ${path} (${r.status})`);
    return await r.json();
  },
  escapeHtml: (s) => {
    if(!s) return '';
    return String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
  },
  formatDateToDDMMYYYY: (raw) => {
    if(!raw) return '';
    if(/^\d{4}-\d{2}-\d{2}$/.test(raw)){
      const [y,m,d]=raw.split('-'); return `${d}-${m}-${y}`;
    }
    const d = new Date(raw);
    if(!isNaN(d)) {
      const dd = String(d.getDate()).padStart(2,'0');
      const mm = String(d.getMonth()+1).padStart(2,'0');
      const yy = d.getFullYear();
      return `${dd}-${mm}-${yy}`;
    }
    return raw;
  }
};

document.addEventListener('DOMContentLoaded', async () => {
  const GRID_ID = 'booksGrid';
  const BOOKS_JSON = 'data/books.json';

  const booksGrid = document.getElementById(GRID_ID);
  if(!booksGrid) return;

  let BOOKS = [];
  try {
    const data = await BooksUtils.fetchJSON(BOOKS_JSON);
    BOOKS = data.books || [];
  } catch(err){
    console.error(err);
    booksGrid.innerHTML = `<div class="card">No se pudo cargar data/books.json — mira la consola.</div>`;
    return;
  }

  function renderBooks(list){
    booksGrid.innerHTML = '';
    if(!list.length){
      booksGrid.innerHTML = '<div class="card">No hay libros. Edita <code>data/books.json</code>.</div>';
      return;
    }
    list.forEach((b, idx) => {
      const el = document.createElement('article');
      el.className = 'book-card card';
      el.tabIndex = 0;
      el.innerHTML = `
        <div style="display:flex;gap:12px;align-items:center">
          <div style="width:90px;height:130px;overflow:hidden;border-radius:8px;flex-shrink:0">
            <img src="${b.cover || 'assets/covers/placeholder.jpg'}" alt="${BooksUtils.escapeHtml(b.title)}" style="width:100%;height:100%;object-fit:cover">
          </div>
          <div style="flex:1;min-width:0">
            <h3 style="margin:0 0 6px 0">${BooksUtils.escapeHtml(b.title)}</h3>
            <div class="meta">${BooksUtils.escapeHtml(b.subtitle || '')}</div>
            <p class="note" style="margin-top:8px">${BooksUtils.escapeHtml((b.description||'').slice(0,140))}</p>
          </div>
        </div>
      `;
      el.addEventListener('click', ()=> openBookModal(b));
      el.addEventListener('keydown', (e) => { if(e.key==='Enter' || e.key===' ') openBookModal(b); });
      booksGrid.appendChild(el);
    });
  }

  // modal handling: expects modal markup in libros.html
  function openBookModal(book){
    const modal = document.getElementById('bookModal');
    const content = document.getElementById('bookModalContent');
    if(!modal || !content){
      // fallback alert if no modal present
      window.location.href = book.amazon || '#';
      return;
    }
    content.innerHTML = `
      <div style="display:flex;gap:14px;flex-wrap:wrap;align-items:flex-start">
        <div style="min-width:160px">
          <img src="${book.cover || 'assets/covers/placeholder.jpg'}" alt="${BooksUtils.escapeHtml(book.title)}" style="width:160px;height:240px;object-fit:cover;border-radius:6px">
        </div>
        <div style="flex:1;min-width:0">
          <h2>${BooksUtils.escapeHtml(book.title)}</h2>
          <p class="meta">${BooksUtils.escapeHtml(book.subtitle || '')} ${book.date? '· ' + BooksUtils.escapeHtml(book.date) : ''}</p>
          <p style="margin-top:8px">${BooksUtils.escapeHtml(book.description || '')}</p>
          <div style="margin-top:12px;display:flex;gap:8px;flex-wrap:wrap">
            <a class="btn btn-primary" href="${book.amazon || '#'}" target="_blank" rel="noopener">Comprar / Ficha</a>
            ${ book.sample ? `<a class="btn btn-ghost" href="${book.sample}" download>Descargar muestra</a>` : '' }
          </div>
        </div>
      </div>
    `;
    modal.classList.add('open'); modal.setAttribute('aria-hidden','false');
  }

  // close handlers (if modal exists in HTML)
  const closeBtn = document.getElementById('closeBookModal');
  const bookModal = document.getElementById('bookModal');
  if(closeBtn && bookModal){
    closeBtn.addEventListener('click', ()=> { bookModal.classList.remove('open'); bookModal.setAttribute('aria-hidden','true'); });
    bookModal.addEventListener('click', (e)=> { if(e.target === bookModal) { bookModal.classList.remove('open'); bookModal.setAttribute('aria-hidden','true'); } });
    document.addEventListener('keydown', (e)=> { if(e.key === 'Escape' && bookModal.classList.contains('open')) { bookModal.classList.remove('open'); bookModal.setAttribute('aria-hidden','true'); } });
  }

  // search & filters (if present in libros.html)
  const searchInput = document.getElementById('searchInput');
  const dateInput = document.getElementById('dateInput');
  const clearBtn = document.getElementById('clearFilters') || null;

  if(searchInput) searchInput.addEventListener('input', ()=> {
    const q = searchInput.value.trim().toLowerCase();
    const list = BOOKS.filter(b => (b.title + ' ' + (b.subtitle||'') + ' ' + (b.description||'')).toLowerCase().includes(q));
    renderBooks(list);
  });

  if(dateInput) dateInput.addEventListener('change', ()=> {
    const d = dateInput.value;
    let list = BOOKS.slice();
    if(d) list = list.filter(b => b.date === d);
    renderBooks(list);
  });

  if(clearBtn) clearBtn.addEventListener('click', ()=> {
    if(searchInput) searchInput.value = '';
    if(dateInput) dateInput.value = '';
    renderBooks(BOOKS);
  });

  // initial render
  renderBooks(BOOKS);
});
