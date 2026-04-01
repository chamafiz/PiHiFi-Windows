// Preload script — runs in renderer context with limited Node access
// Currently empty — web UI uses its own fetch/websocket
window.addEventListener('DOMContentLoaded', () => {
  // Remove safe-area insets for desktop
  const style = document.createElement('style')
  style.textContent = `
    html, body { padding: 0 !important; margin: 0 !important; }
    .bnav { padding-bottom: 2px !important; }
    #app { height: 100vh !important; }
  `
  document.head.appendChild(style)
})
