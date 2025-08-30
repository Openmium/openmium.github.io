// js/libros-page.js
document.addEventListener('DOMContentLoaded', () => {
  const DATA = 'data/books.json';
  const booksGrid = document.getElementById('booksGrid');
  const searchInput = document.getElementById('searchInput');
  const dateInput = document.getElementById('dateInput');
  const clearBtn = document.getElementById('clearFilters');
  const bookModal = document.getElementById('bookModal');
  const bookModalContent = document.getElementById('bookModalContent');
  const closeBookModal = document.getElementById('closeBookModal');

  let BOOKS = [];

  async function loadBooks(){
    try {
      const res = await fetch(DATA, {cache:'no-store'});
      if(!res.ok) throw new Error('No se pudo cargar ' + DATA);
      const j = await res.json();
      BOOKS = j.books || [];
    } catch(err){
      console.error(err);
      BOOKS = [];
      if(booksGrid) booksGrid.innerHTML = '<div class="card">Error cargando libros (revisa consola).</div>';
    }
    renderBooks(BOOKS);
  }

  function renderBooks(list){
    booksGrid.innerHTML = '';
    if(!list.length){ booksGrid.innerHTML = '<div class="card">No hay libros. Edita data/books.json</div>'; return; }
    list.forEach((b) => {
      const article = document.createElement('article');
      article.className = 'book-card';
      article.tabIndex = 0;
      article.innerHTML = `
        <div class="book-thumb"><img src="${escapeHtml(b.cover || 'assets/covers/placeholder.jpg')}" alt="${escapeHtml(b.title)}"></div>
        <div class="book-info">
          <h3 class="book-title">${escapeHtml(b.title)}</h3>
          <div class="book-sub">${escapeHtml(b.subtitle || '')}</div>
          <p class="book-desc">${escapeHtml(b.description || '')}</p>
          <div class="book-meta">
            <div class="book-date">${b.date ? formatDateToDDMMYYYY(b.date) : ''}</div>
            <div class="book-actions">
              <a class="btn btn-primary" href="${b.amazon || '#'}" target="_blank" rel="noopener">Comprar</a>
            </div>
          </div>
        </div>
      `;
      article.addEventListener('click', ()=> openBookModal(b));
      article.addEventListener('keydown', (e)=> { if(e.key==='Enter' || e.key===' ') openBookModal(b); });
      booksGrid.appendChild(article);
    });
  }

  function openBookModal(book){
    bookModalContent.innerHTML = `
      <div style="display:flex;gap:18px;flex-wrap:wrap;align-items:flex-start">
        <div style="min-width:240px"><img src="${escapeHtml(book.cover || 'assets/covers/placeholder.jpg')}" alt="${escapeHtml(book.title)}" style="width:240px;height:340px;object-fit:contain;border-radius:8px"></div>
        <div style="flex:1">
          <h2 style="color:var(--title-color)">${escapeHtml(book.title)}</h2>
          <p class="book-sub">${escapeHtml(book.subtitle || '')} ${book.date ? '· ' + formatDateToDDMMYYYY(book.date) : ''}</p>
          <p style="margin-top:10px">${escapeHtml(book.description || '')}</p>
          <div style="margin-top:12px;display:flex;gap:8px">
            <a class="btn btn-primary" href="${book.amazon || '#'}" target="_blank" rel="noopener">Comprar / Ficha</a>
            ${book.sample ? `<a class="btn btn-ghost" href="${book.sample}" download>Descargar adelanto</a>` : ''}
          </div>
        </div>
      </div>
    `;
    bookModal.classList.add('open'); bookModal.setAttribute('aria-hidden','false');
  }

  // close modal on overlay click or X
  if(closeBookModal) closeBookModal.addEventListener('click', ()=> { bookModal.classList.remove('open'); bookModal.setAttribute('aria-hidden','true'); });
  bookModal && bookModal.addEventListener('click', (e) => {
    const card = bookModal.querySelector('.modal-card');
    if(!card) return;
    if(!card.contains(e.target)) { bookModal.classList.remove('open'); bookModal.setAttribute('aria-hidden','true'); }
  });

  // filters
  searchInput && searchInput.addEventListener('input', applyFilters);
  dateInput && dateInput.addEventListener('change', applyFilters);
  clearBtn && clearBtn.addEventListener('click', ()=> { if(searchInput) searchInput.value=''; if(dateInput) dateInput.value=''; renderBooks(BOOKS); });

  function applyFilters(){
    const q = searchInput.value.trim().toLowerCase();
    const d = dateInput.value;
    let filtered = BOOKS.slice();
    if(q) filtered = filtered.filter(b => (b.title + ' ' + (b.subtitle||'') + ' ' + (b.description||'')).toLowerCase().includes(q));
    if(d) filtered = filtered.filter(b => b.date === d);
    renderBooks(filtered);
  }

  loadBooks();
});
