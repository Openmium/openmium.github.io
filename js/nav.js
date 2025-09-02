// js/nav.js
// Construye header mostrando sólo páginas distintas de la actual.
// Logo a la izquierda, enlaces a la derecha.

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
  left.className = 'brand';
  left.innerHTML = `<a href="index.html" style="color:#fff;text-decoration:none">Pablo Del Pozuelo</a>`;

  const right = document.createElement('nav');
  pages.forEach(p => {
    if(p.file === current) return; // no mostrar enlace a la página actual
    const a = document.createElement('a');
    a.href = p.file;
    a.textContent = p.label;
    a.style.marginLeft = '14px';
    right.appendChild(a);
  });

  navWrap.appendChild(left);
  navWrap.appendChild(right);
});
