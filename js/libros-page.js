// js/libros-page.js
const BOOKS_PATH = 'data/books.json';
let BOOKS = [];

// formatea fecha YYYY-MM-DD -> DD-MM-YYYY
function formatDateToDDMMYYYY(raw){
  if(!raw) return '';
  if(/^\d{4}-\d{2}-\d{2}$/.test(raw)){
    const [y,m,d] = raw.split('-'); return `${d}-${m}-${y}`;
  }
  // si ya está en otro formato, devolver tal cual
  return raw;
}
function escapeHtml(s){ if(!s) return ''; return String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;'); }

async function loadBooks(){
  try{
    const res = await fetch(BOOKS_PATH, {cache:'no-store'});
    if(!res.ok) throw new Error('No se pudo cargar ' + BOOKS_PATH + ' (status ' + res.status + ')');
    const json = await res.json();
    BOOKS = json.books || [];
  } catch(err){
    console.error('[loadBooks]', err);
    BOOKS = [];
    const grid = document.getElementById('booksGrid');
    if(grid) grid.innerHTML = `<div class="card">Error cargando libros. Revisa consola.</div>`;
  }
  renderBooks(BOOKS);
}

function renderBooks(list){
  const grid = document.getElementById('booksGrid');
  if(!grid) return;
  grid.innerHTML = '';
  if(!list || list.length === 0){
    grid.innerHTML = '<div class="card">No hay libros. Añade entradas en <code>data/books.json</code>.</div>';
    return;
  }

  list.forEach(b => {
    // asegúrate de usar cada campo exactamente una vez (titulo + subtitulo)
    const cover = b.cover || 'assets/covers/placeholder.jpg';
    const title = escapeHtml(b.title || '');
    const subtitle = escapeHtml(b.subtitle || '');
    const desc = escapeHtml(b.description || '');
    const date = b.date ? formatDateToDDMMYYYY(b.date) : '';
    const amazon = b.amazon || '#';

    const article = document.createElement('article');
    article.className = 'book-card';
    article.innerHTML = `
      <img class="book-cover" src="${cover}" alt="Portada ${title}">
      <div class="book-info">
        <div>
          <h3 class="book-title">${title}</h3>
          ${ subtitle ? `<div class="book-subtitle">${subtitle}</div>` : '' }
          <p class="book-description">${desc}</p>
        </div>
        <div class="book-meta">
          <div class="meta">${escapeHtml(date)}</div>
          <div><a class="btn btn-primary" href="${amazon}" target="_blank" rel="noopener">Comprar</a></div>
        </div>
      </div>
    `;
    // abrir modal ficha (si tienes modal)
    article.addEventListener('click', (e) => {
      // evita que el click en el enlace "Comprar" abra el modal — deja que vaya al href
      const target = e.target;
      if(target && (target.tagName === 'A' || target.closest('a'))) return;
      openBookModal(b);
    });

    grid.appendChild(article);
  });
}

function openBookModal(book){
  const modal = document.getElementById('bookModal');
  const content = document.getElementById('bookModalContent');
  if(!modal || !content) return;
  content.innerHTML = `
    <div style="display:flex;gap:14px;flex-wrap:wrap;align-items:flex-start">
      <div style="min-width:160px"><img src="${escapeHtml(book.cover || 'assets/covers/placeholder.jpg')}" alt="${escapeHtml(book.title)}" style="width:160px;height:240px;object-fit:cover;border-radius:6px"></div>
      <div style="flex:1">
        <h2>${escapeHtml(book.title)}</h2>
        <p class="meta">${escapeHtml(book.subtitle || '')} ${book.date? '· ' + formatDateToDDMMYYYY(book.date) : ''}</p>
        <p style="margin-top:8px">${escapeHtml(book.description || '')}</p>
        <div style="margin-top:12px;display:flex;gap:8px;flex-wrap:wrap">
          <a class="btn btn-primary" href="${escapeHtml(book.amazon || '#')}" target="_blank" rel="noopener">Comprar</a>
          ${ book.sample ? `<a class="btn btn-ghost" href="${escapeHtml(book.sample)}" target="_blank" rel="noopener">Leer muestra</a>` : '' }
        </div>
      </div>
    </div>
  `;
  modal.classList.add('open'); modal.setAttribute('aria-hidden','false');
}

document.addEventListener('DOMContentLoaded', () => {
  // cerrar modal
  const closeBookModal = document.getElementById('closeBookModal');
  const bookModal = document.getElementById('bookModal');
  if(closeBookModal && bookModal){
    closeBookModal.addEventListener('click', ()=> { bookModal.classList.remove('open'); bookModal.setAttribute('aria-hidden','true'); });
    bookModal.addEventListener('click', (e) => { if(e.target === bookModal) { bookModal.classList.remove('open'); bookModal.setAttribute('aria-hidden','true'); }});
  }

  // filtros
  const searchInput = document.getElementById('searchBook');
  const dateInput = document.getElementById('dateInput');
  const clearBtn = document.getElementById('clearBooks');

  if(searchInput) searchInput.addEventListener('input', () => {
    const q = searchInput.value.trim().toLowerCase();
    const filtered = BOOKS.filter(b => (b.title + ' ' + (b.subtitle||'') + ' ' + (b.description||'')).toLowerCase().includes(q));
    renderBooks(filtered);
  });
  if(dateInput) dateInput.addEventListener('change', () => {
    const d = dateInput.value;
    const filtered = d ? BOOKS.filter(b => b.date === d) : BOOKS.slice();
    renderBooks(filtered);
  });
  if(clearBtn) clearBtn.addEventListener('click', ()=> { if(searchInput) searchInput.value=''; if(dateInput) dateInput.value=''; renderBooks(BOOKS); });

  loadBooks();
});
