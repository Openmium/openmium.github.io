// js/nav.js
(function buildSiteNav(){
  const target = document.getElementById('mainNav');
  if(!target) return;

  const pages = [
    { file: 'index.html', label: 'Sobre mí' },
    { file: 'libros.html', label: 'Libros' },
    { file: 'reviews.html', label: 'Reseñas' }
  ];

  const left = document.createElement('div');
  left.innerHTML = '<strong>Mi Sitio</strong>';
  left.style.fontWeight = 800;
  left.style.color = 'var(--p3)';

  const right = document.createElement('nav');
  right.setAttribute('aria-label', 'Navegación principal');

  const current = (location.pathname.split('/').pop() || 'index.html').toLowerCase();

  pages.forEach(p => {
    const a = document.createElement('a');
    a.href = p.file;
    a.textContent = p.label;
    a.style.marginLeft = '14px';
    a.className = 'nav-link';
    if(p.file === current){
      a.classList.add('active');
      a.setAttribute('aria-current','page');
    }
    right.appendChild(a);
  });

  target.innerHTML = '';
  target.appendChild(left);
  target.appendChild(right);
})();
