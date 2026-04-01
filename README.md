# PiHiFi Windows Desktop App

Electron wrapper — loads PiHiFi web UI in a native Windows window.

## Features
- Native Windows window (taskbar + system tray)
- Minimise to system tray (keeps running)
- Media keys: Play/Pause, Next, Previous
- Error page with retry if Pi unreachable

## Setup

### 1. Change Pi IP
Open `src/main.js` line 5:
```javascript
const PI_URL = 'http://192.168.1.103:8080'  // ← your Pi IP
```

### 2. Build via GitHub Actions
Push to GitHub → Actions → Download `PiHiFi-Windows-Setup.exe`

### 3. Install
Run the `.exe` → installs + creates desktop shortcut

## Local Development
```bash
npm install
npm start
```
