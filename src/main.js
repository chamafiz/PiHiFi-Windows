const { app, BrowserWindow, Menu, Tray, nativeImage, ipcMain, session } = require('electron')
const path = require('path')

// ── Change this to your Pi's IP ──────────────────────
const PI_URL = 'http://192.168.1.103:8080'
// ─────────────────────────────────────────────────────

let mainWindow
let tray

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 400,
    minHeight: 600,
    title: 'PiHiFi',
    icon: path.join(__dirname, 'icon.ico'),
    backgroundColor: '#08080c',
    // Start without frame for clean look, or use frame:true for standard window
    frame: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false,          // allow local Pi HTTP
      allowRunningInsecureContent: true,
      preload: path.join(__dirname, 'preload.js'),
    },
    show: false, // show after ready-to-show
  })

  // Remove default menu bar
  Menu.setApplicationMenu(null)

  // Load PiHiFi
  mainWindow.loadURL(PI_URL)

  // Show window when ready (avoids white flash)
  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
  })

  // Show error page if Pi not reachable
  mainWindow.webContents.on('did-fail-load', () => {
    mainWindow.webContents.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          * { margin:0; padding:0; box-sizing:border-box }
          body {
            background:#08080c; color:#ece8e1;
            font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
            display:flex; flex-direction:column; align-items:center;
            justify-content:center; height:100vh; gap:20px; padding:24px;
            text-align:center;
          }
          h2 { font-size:1.4rem; font-weight:600 }
          p  { font-size:.95rem; color:#9894a2; line-height:1.6 }
          code {
            background:#15151e; padding:4px 12px; border-radius:6px;
            font-family:monospace; color:#d4a65a;
          }
          button {
            background:#d4a65a; color:#08080c; border:none;
            border-radius:10px; padding:12px 32px;
            font-size:1rem; font-weight:600; cursor:pointer; margin-top:8px;
          }
          button:hover { background:#e8c07a }
        </style>
      </head>
      <body>
        <h2>Cannot reach PiHiFi</h2>
        <p>Make sure your Raspberry Pi is powered on<br>and connected to the same network.</p>
        <p>Pi address: <code>${PI_URL}</code></p>
        <button onclick="window.location.href='${PI_URL}'">&#8635; Retry</button>
      </body>
      </html>
    `)}`)
  })

  // Minimise to tray on close
  mainWindow.on('close', (e) => {
    if (!app.isQuitting) {
      e.preventDefault()
      mainWindow.hide()
    }
  })
}

function createTray() {
  const iconPath = path.join(__dirname, 'icon.ico')
  tray = new Tray(nativeImage.createFromPath(iconPath))
  tray.setToolTip('PiHiFi')

  const menu = Menu.buildFromTemplate([
    {
      label: 'Open PiHiFi',
      click: () => { mainWindow.show(); mainWindow.focus() }
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => { app.isQuitting = true; app.quit() }
    }
  ])
  tray.setContextMenu(menu)
  tray.on('double-click', () => { mainWindow.show(); mainWindow.focus() })
}

// Media key support (global)
const { globalShortcut } = require('electron')

app.whenReady().then(() => {
  createWindow()
  createTray()

  // Register media keys
  globalShortcut.register('MediaPlayPause', () => {
    mainWindow.webContents.executeJavaScript("cmd('/api/toggle','POST')")
  })
  globalShortcut.register('MediaNextTrack', () => {
    mainWindow.webContents.executeJavaScript("cmd('/api/next','POST')")
  })
  globalShortcut.register('MediaPreviousTrack', () => {
    mainWindow.webContents.executeJavaScript("cmd('/api/prev','POST')")
  })
})

app.on('window-all-closed', (e) => {
  e.preventDefault() // keep running in tray
})

app.on('will-quit', () => {
  globalShortcut.unregisterAll()
})

app.on('activate', () => {
  mainWindow.show()
})
