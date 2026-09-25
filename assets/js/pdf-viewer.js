// Generic PDF viewer for every .pdf-viewer[data-src] element, built on the
// PDF.js viewer component: real text (selectable, searchable), clickable
// links, zoom, and page navigation. The box is resizable with the browser's
// standard bottom-right grip (CSS resize: both).
//
// Loaded as a classic script, not type="module": Chrome refuses module
// scripts on file:// pages, which would leave the viewer stuck on "Loading".
(function () {
  var PDFJS = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/';
  var TIMEOUT_MS = 20000;
  var ZOOMS = [
    ['auto', 'Automatic'], ['page-width', 'Fit width'], ['page-fit', 'Fit page'],
    ['0.5', '50%'], ['0.75', '75%'], ['1', '100%'], ['1.25', '125%'],
    ['1.5', '150%'], ['2', '200%'], ['3', '300%']
  ];
  var ICONS = {
    prev: '<path d="M15 18l-6-6 6-6"/>',
    next: '<path d="M9 18l6-6-6-6"/>',
    zoomOut: '<path d="M5 12h14"/>',
    zoomIn: '<path d="M12 5v14M5 12h14"/>'
  };

  var roots = document.querySelectorAll('.pdf-viewer[data-src]');
  if (!roots.length) return;

  var ui = [];
  roots.forEach(function (root) { ui.push(buildUi(root)); });

  function fail(parts, reason) {
    parts.status.hidden = false;
    parts.status.innerHTML = reason + ' <a href="' + parts.root.getAttribute('data-src') +
      '">Open the PDF</a> instead.';
  }

  // fetch() of a local file is blocked on file://, so PDF.js cannot load it.
  if (location.protocol === 'file:') {
    ui.forEach(function (p) {
      fail(p, 'The preview needs the site served over HTTP (e.g. python3 -m http.server).');
    });
    return;
  }

  var css = document.createElement('link');
  css.rel = 'stylesheet';
  css.href = PDFJS + 'web/pdf_viewer.css';
  document.head.appendChild(css);

  // The viewer component reads the core library from globalThis.pdfjsLib,
  // so it must be imported (and published) first.
  import(PDFJS + 'build/pdf.min.mjs')
    .then(function (lib) {
      lib.GlobalWorkerOptions.workerSrc = PDFJS + 'build/pdf.worker.min.mjs';
      globalThis.pdfjsLib = lib;
      return import(PDFJS + 'web/pdf_viewer.mjs');
    })
    .then(function (viewerLib) {
      ui.forEach(function (p) { initViewer(p, globalThis.pdfjsLib, viewerLib); });
    }, function () {
      ui.forEach(function (p) { fail(p, 'The PDF viewer could not be loaded.'); });
    });

  function button(name, label) {
    return '<button type="button" class="pdf-btn" data-action="' + name + '" aria-label="' +
      label + '" title="' + label + '"><svg class="icon" viewBox="0 0 24 24" aria-hidden="true" ' +
      'focusable="false">' + ICONS[name] + '</svg></button>';
  }

  function buildUi(root) {
    var options = ZOOMS.map(function (z) {
      return '<option value="' + z[0] + '">' + z[1] + '</option>';
    }).join('');
    root.innerHTML =
      '<div class="pdf-toolbar">' +
        '<div class="pdf-group">' +
          button('prev', 'Previous page') + button('next', 'Next page') +
          '<input class="pdf-page" type="number" min="1" value="1" aria-label="Page number">' +
          '<span class="pdf-pages">/ -</span>' +
        '</div>' +
        '<div class="pdf-group">' +
          button('zoomOut', 'Zoom out') +
          '<select class="pdf-zoom" aria-label="Zoom">' + options +
            '<option class="pdf-zoom-custom" value="custom" hidden></option></select>' +
          button('zoomIn', 'Zoom in') +
        '</div>' +
      '</div>' +
      '<div class="pdf-body">' +
        '<div class="pdf-scroll"><div class="pdfViewer"></div></div>' +
        '<p class="pdf-status" role="status">Loading PDF...</p>' +
      '</div>';

    var parts = {
      root: root,
      scroll: root.querySelector('.pdf-scroll'),
      inner: root.querySelector('.pdfViewer'),
      status: root.querySelector('.pdf-status'),
      page: root.querySelector('.pdf-page'),
      pages: root.querySelector('.pdf-pages'),
      zoom: root.querySelector('.pdf-zoom'),
      custom: root.querySelector('.pdf-zoom-custom')
    };
    return parts;
  }

  function initViewer(p, pdfjsLib, viewerLib) {
    var timer = setTimeout(function () {
      fail(p, 'The preview is taking too long.');
    }, TIMEOUT_MS);

    var eventBus = new viewerLib.EventBus();
    var linkService = new viewerLib.PDFLinkService({
      eventBus: eventBus,
      externalLinkTarget: viewerLib.LinkTarget.BLANK,
      externalLinkRel: 'noopener'
    });
    var viewer = new viewerLib.PDFViewer({
      container: p.scroll,
      viewer: p.inner,
      eventBus: eventBus,
      linkService: linkService
    });
    linkService.setViewer(viewer);

    eventBus.on('pagesinit', function () {
      viewer.currentScaleValue = 'page-width';
      p.page.max = viewer.pagesCount;
      p.pages.textContent = '/ ' + viewer.pagesCount;
      p.status.hidden = true;
      clearTimeout(timer);
    });
    eventBus.on('pagechanging', function (e) {
      p.page.value = e.pageNumber;
    });
    eventBus.on('scalechanging', function (e) {
      var value = e.presetValue || String(e.scale);
      var preset = ZOOMS.some(function (z) { return z[0] === value; });
      p.custom.hidden = preset;
      if (!preset) p.custom.textContent = Math.round(e.scale * 100) + '%';
      p.zoom.value = preset ? value : 'custom';
    });

    p.root.querySelector('.pdf-toolbar').addEventListener('click', function (e) {
      var btn = e.target.closest('[data-action]');
      if (!btn) return;
      var action = btn.getAttribute('data-action');
      if (action === 'prev') viewer.previousPage();
      if (action === 'next') viewer.nextPage();
      if (action === 'zoomIn') viewer.increaseScale();
      if (action === 'zoomOut') viewer.decreaseScale();
    });
    p.page.addEventListener('change', function () {
      var n = Math.max(1, Math.min(viewer.pagesCount, parseInt(p.page.value, 10) || 1));
      viewer.currentPageNumber = n;
      p.page.value = n;
    });
    p.zoom.addEventListener('change', function () {
      if (p.zoom.value !== 'custom') viewer.currentScaleValue = p.zoom.value;
    });

    // Ctrl/Cmd + wheel zooms the document instead of the whole page.
    p.scroll.addEventListener('wheel', function (e) {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      if (e.deltaY < 0) viewer.increaseScale(); else viewer.decreaseScale();
    }, { passive: false });

    // Keep "Fit width" / "Fit page" / "Automatic" fitted as the box resizes.
    new ResizeObserver(function () {
      var value = viewer.currentScaleValue;
      if (value === 'page-width' || value === 'page-fit' || value === 'auto') {
        viewer.currentScaleValue = value;
      }
    }).observe(p.scroll);

    pdfjsLib.getDocument(p.root.getAttribute('data-src')).promise
      .then(function (doc) {
        viewer.setDocument(doc);
        linkService.setDocument(doc, null);
      })
      .catch(function () {
        clearTimeout(timer);
        fail(p, 'The preview could not be loaded.');
      });
  }
})();
