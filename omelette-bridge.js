// Bridges image-slot.js's sidecar persistence (originally built for the
// omelette site-builder runtime) to this project's own admin server, so
// drag-and-drop image edits on /admin survive a reload.
(() => {
  window.omelette = window.omelette || {};
  window.omelette.writeFile = (name, content) =>
    fetch('/api/write-file', {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, content })
    }).then((r) => {
      if (!r.ok) throw new Error('write-file failed: ' + r.status);
    });
})();
