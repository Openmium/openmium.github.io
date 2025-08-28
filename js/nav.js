// js/nav.js
(function buildSiteNav(){
  const target = document.getElementById('mainNav');
  if(!target) return;

  const pages = [
    { file: 'index.html', label: 'Sobre mí' },
    { file: 'libros.html', label: 'Libros' },
    { file: 'reviews.html', label: 'Reseñas' }
  ];

  const current = (location.pathname.split('/').pop() || 'index.html').toLowerCase();

  // left (brand)
  const left = document.createElement('div');
  left.innerHTML = '<strong>Mi Sitio</strong>';
  left.style.fontWeight = 800;

  // right nav (only other pages, skip current)
  const right = document.createElement('nav');
  right.setAttribute('aria-label', 'Navegación principal');
  pages.forEach(p => {
    if (p.file === current) return; // skip current page link entirely
    const a = document.createElement('a');
    a.href = p.file;
    a.textContent = p.label;
    a.style.marginLeft = '14px';
    a.className = 'nav-link';
    right.appendChild(a);
  });

  target.innerHTML = '';
  target.appendChild(left);
  target.appendChild(right);
})();
