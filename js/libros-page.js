// js/libros-page.js
document.addEventListener('DOMContentLoaded', async () => {
  let BOOKS = [];
  try {
    const data = await AppUtils.fetchJSON('data/books.json');
    BOOKS = data.books || [];
  } catch (err) {
    console.error(err);
    document.getElementById('booksGrid').innerHTML = `<div class="card">Error cargando libros. Mira la consola (F12).</div>`;
    return;
  }

  const booksGrid = document.getElementById('booksGrid');
  const searchInput = document.getElementById('searchInput');
  const dateInput = document.getElementById('dateInput');
  const clearBtn = document.getElementById('clearFilters');
  const bookModal = document.getElementById('bookModal');
  const bookModalContent = document.getElementById('bookModalContent');
  const closeBookModal = document.getElementById('closeBookModal');

  function escapeHtml(s){ return AppUtils.escapeHtml(s); }

  function renderBooks(list){
    booksGrid.innerHTML = '';
    if(!list || list.length === 0){
      booksGrid.innerHTML = '<div class="card">No hay libros aún. Añade editar <code>data/books.json</code>.</div>';
      return;
    }
    list.forEach((b) => {
      const el = document.createElement('article');
      el.className = 'book-card card';
      el.tabIndex = 0;
      el.innerHTML = `
        <div style="display:flex;gap:12px;align-items:center">
          <div style="width:90px;height:130px;overflow:hidden;border-radius:8px;flex-shrink:0"><img src="${b.cover}" alt="${escapeHtml(b.title)}" style="width:100%;height:100%;object-fit:cover"></div>
          <div style="flex:1;min-width:0">
            <h3 style="margin:0 0 6px 0">${escapeHtml(b.title)}</h3>
            <div class="meta">${escapeHtml(b.subtitle || '')}</div>
            <p class="note" style="margin-top:8px">${escapeHtml((b.description||'').slice(0,140))}</p>
          </div>
        </div>
      `;
      el.addEventListener('click', ()=> openBookModal(b));
      el.addEventListener('keydown', (e) => { if(e.key==='Enter' || e.key===' ') openBookModal(b); });
      booksGrid.appendChild(el);
    });
  }

  function openBookModal(book){
    bookModalContent.innerHTML = `
      <div style="display:flex;gap:14px;flex-wrap:wrap;align-items:flex-start">
        <div style="min-width:160px"><img src="${book.cover}" alt="${escapeHtml(book.title)}" style="width:160px;height:240px;object-fit:cover;border-radius:6px"></div>
        <div style="flex:1">
          <h2>${escapeHtml(book.title)}</h2>
          <p class="meta">${escapeHtml(book.subtitle || '')} ${book.date? '· ' + escapeHtml(book.date) : ''}</p>
          <p style="margin-top:8px">${escapeHtml(book.description || '')}</p>
          <div style="margin-top:12px;display:flex;gap:8px;flex-wrap:wrap">
            <a class="btn btn-primary" href="${book.amazon || '#'}" target="_blank" rel="noopener">Comprar</a>
            <a class="btn btn-ghost" href="${book.sample || '#'}" target="_blank">Ver muestra</a>
          </div>
        </div>
      </div>
    `;
    bookModal.classList.add('open'); bookModal.setAttribute('aria-hidden','false');
  }

  closeBookModal.addEventListener('click', ()=> { bookModal.classList.remove('open'); bookModal.setAttribute('aria-hidden','true'); });
  bookModal.addEventListener('click', (e)=> { if(e.target === bookModal){ bookModal.classList.remove('open'); bookModal.setAttribute('aria-hidden','true'); } });
  document.addEventListener('keydown', (e)=> { if(e.key === 'Escape' && bookModal.classList.contains('open')) { bookModal.classList.remove('open'); bookModal.setAttribute('aria-hidden','true'); } });

  // filters
  searchInput.addEventListener('input', ()=> {
    const q = searchInput.value.trim().toLowerCase();
    renderBooks(BOOKS.filter(b => (b.title + ' ' + (b.subtitle||'') + ' ' + (b.description||'')).toLowerCase().includes(q)));
  });
  dateInput.addEventListener('change', ()=> {
    const d = dateInput.value;
    renderBooks(d ? BOOKS.filter(b => b.date === d) : BOOKS);
  });
  clearBtn.addEventListener('click', ()=> { searchInput.value=''; dateInput.value=''; renderBooks(BOOKS); });

  // initial render
  BOOKS = BOOKS; // already loaded above
  renderBooks(BOOKS);
});
