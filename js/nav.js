// js/nav.js
// Construye el header mostrando solo las páginas *distintas* a la actual.
document.addEventListener('DOMContentLoaded', () => {
  const navWrap = document.getElementById('mainNav');
  if(!navWrap) return;
  const pages = [
    { file: 'index.html', label: 'Sobre mí' },
    { file: 'libros.html', label: 'Libros' },
    { file: 'reviews.html', label: 'Reseñas' }
  ];
  const current = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  const left = document.createElement('div');
  left.className = 'logo';
  left.innerHTML = `<a href="index.html" style="color:#fff">Pablo Del Pozuelo</a>`;
  const right = document.createElement('nav');
  pages.forEach(p => {
    if(p.file === current) return; // skip current page
    const a = document.createElement('a');
    a.href = p.file;
    a.textContent = p.label;
    right.appendChild(a);
  });
  navWrap.appendChild(left);
  navWrap.appendChild(right);
});
