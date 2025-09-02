// js/libros-page.js
// Manejo de la página "Libros": carga data/books.json, render, filtros y modal de detalle.

document.addEventListener('DOMContentLoaded', () => {
  const DATA = 'data/books.json';
  const booksGrid = document.getElementById('booksGrid');
  const searchInput = document.getElementById('searchInput');
  const dateInput = document.getElementById('dateInput');
  const clearBtn = document.getElementById('clearFilters');
  const bookModal = document.getElementById('bookModal');
  const bookModalContent = document.getElementById('bookModalContent');
  const closeBookModal = document.getElementById('closeBookModal');

  const esc = window.utils?.escapeHtml || (s=>String(s||''));
  const fmt = window.utils?.formatDateToDDMMYYYY || (s=>s);

  let BOOKS = [];

  async function loadBooks(){
    try {
      const res = await fetch(DATA, {cache:'no-store'});
      if(!res.ok) throw new Error('No se pudo cargar ' + DATA + ' (status ' + res.status + ')');
      const j = await res.json();
      BOOKS = j.books || [];
    } catch(err){
      console.error(err);
      BOOKS = [];
      if(booksGrid) booksGrid.innerHTML = '<div class="card">Error cargando libros (revisa consola).</div>';
    }
    renderBooks(BOOKS);
  }

  function handleImageFit(img){
    // evita zoom excesivo: si la proporción es extrema, usa contain
    if(!img || !img.complete) {
      img && img.addEventListener('load', ()=> handleImageFit(img));
      return;
    }
    try {
      const w = img.naturalWidth || img.width;
      const h = img.naturalHeight || img.height;
      const ratio = w / h;
      if(ratio < 0.6 || ratio > 1.8){
        img.style.objectFit = 'contain';
        img.style.background = '#f3f4f6';
        img.style.padding = '6px';
      } else {
        img.style.objectFit = 'cover';
      }
    } catch(e){}
  }

  function renderBooks(list){
    if(!booksGrid) return;
    booksGrid.innerHTML = '';
    if(!list || list.length === 0){
      booksGrid.innerHTML = '<div class="card">No hay libros. Edita <code>data/books.json</code></div>'; 
      return;
    }
    list.forEach((b) => {
      const article = document.createElement('article');
      article.className = 'book-card';
      article.tabIndex = 0;
      article.innerHTML = `
        <div class="book-thumb"><img src="${esc(b.cover || 'assets/covers/placeholder.jpg')}" alt="${esc(b.title)}"></div>
        <div class="card-body">
          <div class="card-meta">${fmt(b.date || '')}</div>
          <h3 class="card-title">${esc(b.title)}</h3>
          <div class="card-desc">${esc(b.description || '')}</div>
          <div class="row-bottom">
            <div class="price">${b.date ? fmt(b.date) : ''}</div>
            <div class="book-actions"><a class="product-link-btn" href="${esc(b.amazon || '#')}" target="_blank" rel="noopener">Comprar</a></div>
          </div>
        </div>
      `;
      // attach image fit logic
      const img = article.querySelector('img');
      handleImageFit(img);

      // open modal on click / keyboard
      article.addEventListener('click', (e)=> { 
        // ignore clicks on the Comprar link (let it navigate)
        if(e.target.closest('a')) return;
        openBookModal(b);
      });
      article.addEventListener('keydown', (e)=> { if(e.key==='Enter' || e.key===' ') openBookModal(b); });

      booksGrid.appendChild(article);
    });
  }

  function openBookModal(book){
    const cover = esc(book.cover || 'assets/covers/placeholder.jpg');
    const title = esc(book.title || '');
    const subtitle = esc(book.subtitle || '');
    const desc = esc(book.description || '');
    const sample = esc(book.sample || '');
    const amazon = esc(book.amazon || '');

    bookModalContent.innerHTML = `
      <div class="modal-layout" style="gap:18px">
        <div class="modal-main" style="flex:0 0 340px;min-width:240px">
          <img id="bookMainImg" src="${cover}" alt="${title}">
        </div>
        <div style="flex:1;display:flex;flex-direction:column;gap:12px">
          <h2 class="modal-title">${title}</h2>
          <div class="modal-meta">${subtitle} ${book.date ? '· ' + fmt(book.date) : ''}</div>
          <p class="modal-desc" style="margin-top:8px">${desc}</p>
          <div style="margin-top:auto;display:flex;gap:10px">
            <a class="btn btn-primary" href="${amazon || '#'}" target="_blank" rel="noopener">Comprar / Ficha</a>
            ${ sample ? `<a class="btn btn-ghost" href="${sample}" download>Descargar adelanto</a>` : '' }
          </div>
        </div>
      </div>
    `;
    // image fit apply
    const mainImg = document.getElementById('bookMainImg');
    if(mainImg) handleImageFit(mainImg);

    bookModal.classList.add('open');
    bookModal.setAttribute('aria-hidden','false');
  }

  // close modal on overlay click or X
  if(closeBookModal) closeBookModal.addEventListener('click', ()=> { bookModal.classList.remove('open'); bookModal.setAttribute('aria-hidden','true'); });
  if(bookModal) bookModal.addEventListener('click', (e) => {
    const card = bookModal.querySelector('.modal-card');
    if(!card) return;
    if(!card.contains(e.target)) { bookModal.classList.remove('open'); bookModal.setAttribute('aria-hidden','true'); }
  });

  // filters
  if(searchInput) searchInput.addEventListener('input', applyFilters);
  if(dateInput) dateInput.addEventListener('change', applyFilters);
  if(clearBtn) clearBtn.addEventListener('click', ()=> { if(searchInput) searchInput.value=''; if(dateInput) dateInput.value=''; renderBooks(BOOKS); });

  function applyFilters(){
    const q = (searchInput?.value || '').trim().toLowerCase();
    const d = dateInput?.value;
    let filtered = BOOKS.slice();
    if(q) filtered = filtered.filter(b => ( (b.title||'') + ' ' + (b.subtitle||'') + ' ' + (b.description||'') ).toLowerCase().includes(q));
    if(d) filtered = filtered.filter(b => b.date === d);
    renderBooks(filtered);
  }

  loadBooks();
});
