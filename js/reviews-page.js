function openDetail(id) {
  const item = REVIEWS.find(x => x.id === id);
  if (!item) return;
  const imgs = (item.images || []).slice(0, 8);
  let galleryHtml = '';
  if (imgs.length) {
    galleryHtml += `<div class="modal-layout" style="align-items:flex-start">`;
    galleryHtml += `<div class="modal-main" style="flex:1;min-width:320px"><img id="mainImg" src="${esc(imgs[0])}" alt="${esc(item.title || '')}"></div>`;
    galleryHtml += `<div class="modal-thumbs" style="width:120px">`;
    imgs.forEach(u => galleryHtml += `<img class="thumb" src="${esc(u)}" data-src="${esc(u)}" alt="">`);
    galleryHtml += `</div></div>`;
  }
  const starsHtml = item.rating ? renderStars(item.rating) : '';
  const priceHtml = item.price ? `<div class="price">${esc(item.price)}</div>` : '';
  const linkHtml = item.link ? `<div style="margin-top:12px"><a class="btn btn-primary" href="${esc(item.link)}" target="_blank" rel="noopener">Ver producto</a></div>` : '';
  detailContent.innerHTML = `
    ${galleryHtml}
    <div class="modal-meta">${fmt(item.date || '')} · ${esc(item.category || '')} / ${esc(item.sub || '')}</div>
    <h2 class="modal-title">${esc(item.title)}</h2>
    ${starsHtml}
    ${priceHtml}
    <p class="modal-desc" style="margin-top:8px">${esc(item.content || item.summary || '')}</p>
    ${linkHtml}
  `;

  // aplicar estilos y behavior a imagen principal y thumbs
  setTimeout(() => {
    const main = document.getElementById('mainImg');

    // === <<< INSERTADO: bloque para forzar estilos seguros en la imagen principal >>> ===
    if (main) {
      try { main.removeAttribute('width'); main.removeAttribute('height'); } catch(e){}

      // estilos inmediatos para evitar recortes (contain + límites)
      main.style.width = 'auto';
      main.style.height = 'auto';
      main.style.maxWidth = 'calc(100% - 16px)';
      main.style.maxHeight = 'calc(80vh - 32px)';
      main.style.objectFit = 'contain';
      main.style.objectPosition = 'center';
      main.style.display = 'block';
      main.style.background = 'transparent';
      main.style.padding = '0';
      main.style.boxSizing = 'border-box';

      // asegurar que el contenedor .modal-main no recorta
      const container = main.closest('.modal-main');
      if (container) {
        container.style.aspectRatio = 'auto';
        container.style.overflow = 'visible';
        container.style.alignItems = 'center';
        container.style.justifyContent = 'center';
        container.style.padding = '8px';
      }

      // reaplicar al 'load' por si el src cambia después
      if (!main.complete) {
        main.addEventListener('load', () => {
          main.style.maxHeight = 'calc(80vh - 32px)';
          main.style.objectFit = 'contain';
        }, { once: true });
      }
    }
    // === >>> FIN BLOQUE INSERTADO ===

    const applyMainStyles = (m) => {
      if (!m) return;
      m.style.objectFit = 'contain';
      m.style.objectPosition = 'center';
      m.style.width = 'auto';
      m.style.maxWidth = '100%';
      m.style.height = 'auto';
      m.style.maxHeight = '80vh';
      m.style.background = 'transparent';
      m.style.padding = '0';
      m.style.display = 'block';
      try { m.removeAttribute('width'); m.removeAttribute('height'); } catch (e) { }
    };

    if (main) {
      applyMainStyles(main);
      if (!main.complete) main.addEventListener('load', () => applyMainStyles(main), { once: true });
      handleImageFit(main);
    }

    detailContent.querySelectorAll('.thumb').forEach(t => {
      t.style.width = '100%';
      t.style.height = '72px';
      t.style.objectFit = 'cover';
      t.style.objectPosition = 'center';
      t.style.background = '#1a1a1a';
      t.style.display = 'block';
      handleImageFit(t);

      t.addEventListener('click', (e) => {
        const src = e.currentTarget.dataset.src;
        const m = document.getElementById('mainImg');
        if (!m) return;
        // cambiar src y aplicar estilos en load
        const onloadHandler = () => {
          applyMainStyles(m);
          handleImageFit(m);
          m.removeEventListener('load', onloadHandler);
        };
        m.addEventListener('load', onloadHandler);
        m.src = src;
      }, { once: false });
    });

    // Normalizar thumbs/imagenes del modal tras generarlas
    normalizeCardImages();
  }, 20);

  detailModal.classList.add('open'); detailModal.setAttribute('aria-hidden', 'false');
}
