/*
 * @Description: 
 * @Version: 1.0
 * @Autor: solid
 * @Date: 2022-08-12 14:21:50
 * @LastEditors: solid
 * @LastEditTime: 2022-10-10 20:35:01
 */
'use strict'
import { app, protocol, BrowserWindow, ipcMain } from 'electron'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
const isDevelopment = process.env.NODE_ENV !== 'production'

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true } }
])

const winURL = isDevelopment
  ? `https://127.0.0.1:9999/#/`
  : 'app://./index.html/#/'
let win
async function createWindow() {
  // Create the browser window.
  win = new BrowserWindow({
    title: "翎",
    icon: "./assets/logo.png",
    width: 400,
    useContentSize: true,
    height: 320,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
      contextIsolation: false
    },
    frame: false,
  })
  win.center()
  if (isDevelopment) {
    win.webContents.openDevTools()
  } else {
    win.setMenu(null);
    createProtocol('app')
  }
  win.loadURL(winURL)

}

ipcMain.on('resize-window', (event, { width, height }) => {
  const window = BrowserWindow.getFocusedWindow();

  if (window) {
    window.setSize(width, height);
    window.center();
  }
});
ipcMain.on('open-window', (event, options) => {
  let new_win = new BrowserWindow({
    title: options.method == 'video' ? "视频" : "语音" + "通话",
    width: 600,
    useContentSize: true,
    height: 400,
    icon: "./assets/logo.png",
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
      contextIsolation: false
    },
  })
  // new_win.webContents.openDevTools()
  // new_win.setMenu(null);
  if(isDevelopment){
    new_win.webContents.openDevTools()
  }
  let { room, receiver, beInviter } = options
  if (options.method == 'audio') {
    new_win.loadURL(winURL + `audio?room=${room}&receiver=${receiver}&beInviter=${beInviter}`);
  } else {
    new_win.loadURL(winURL + `video?room=${room}&receiver=${receiver}&beInviter=${beInviter}`);

  }
});

app.on('certificate-error', (event, webContents, url, error, certificate, callback) => {
  log('certificate-error');
  //允许私有证书
  event.preventDefault()
  callback(true)
});
// 忽略证书相关错误
app.commandLine.appendSwitch('ignore-certificate-errors')
// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  createWindow()
})

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', (data) => {
      if (data === 'graceful-exit') {
        app.quit()
      }
    })
  } else {
    process.on('SIGTERM', () => {
      app.quit()
    })
  }
}