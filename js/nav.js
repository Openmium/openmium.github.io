// js/nav.js
// Construye el header mostrando solo las páginas distintas a la actual.
// Se carga con defer.

document.addEventListener('DOMContentLoaded', () => {
  const navWrap = document.getElementById('mainNav');
  if(!navWrap) return;
  const pages = [
    { file: 'index.html', label: 'Sobre mí' },
    { file: 'libros.html', label: 'Libros' },
    { file: 'reviews.html', label: 'Reseñas' }
  ];
  const current = (location.pathname.split('/').pop() || 'index.html').toLowerCase();

  // left brand
  const left = document.createElement('div');
  left.className = 'brand';
  left.innerHTML = `<a href="index.html" aria-label="Inicio" style="color:inherit;text-decoration:none">Pablo Del Pozuelo</a>`;

  // right nav links (omitimos la página actual)
  const right = document.createElement('nav');
  pages.forEach(p => {
    if(p.file === current) return;
    const a = document.createElement('a');
    a.href = p.file;
    a.textContent = p.label;
    a.setAttribute('role','link');
    right.appendChild(a);
  });

  navWrap.appendChild(left);
  navWrap.appendChild(right);
});
