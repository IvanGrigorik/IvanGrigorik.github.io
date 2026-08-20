// Runs synchronously in <head>, before first paint, so the page never
// flashes light-then-dark. Site defaults to light: dark only applies if
// the visitor previously chose it via the nav toggle.
(function () {
  if (localStorage.getItem('theme') === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
  }
})();
