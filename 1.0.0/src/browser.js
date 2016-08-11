const path = require('path');
const {app, ipcMain, BrowserWindow, dialog} = require('electron');
const config = require('./server/config');
const logger = require("./server/utils/log");
const util = require("./server/utils/util");
const server = require('./server/server');

process.env.APP_VERSION = "1.0.0";
process.env.APP_PROXY_PORT = "11223";
process.env.APP_SOCKET_PORT = "11224";
process.env.APP_PROXY_URL = "http://127.0.0.1:" + process.env.APP_PROXY_PORT;
process.env.APP_SOCKET_URL = "http://127.0.0.1:" + process.env.APP_SOCKET_PORT;
process.env.RESOURCES_PATH = path.join(__dirname, '/tools');


let mainWindow;
let loginWindow;
let liveWindows = {};

ipcMain.on('quit', function () {
   app.quit();
})

ipcMain.on('login', function () {
    util.getCookies(loginWindow, function(cookies){
        util.login(cookies, function(error, data){
            if(data.code==1){
                global.udb = data.udb;
                createWindow();
                loginWindow.close();
            }
        })
    })
})

ipcMain.on('open-file-dialog', function (event, channel) {
    dialog.showOpenDialog({
        properties: ['openFile', 'openDirectory']
    }, function (files) {
        if (files) event.sender.send(channel, files)
    })
});

ipcMain.on('open-live-window', function (event, option) {
    let id = option.match_id;
    if(liveWindows.hasOwnProperty(id)){
        liveWindows[id].show();
    }else{
        let liveWindow = createLiveWindow(option);
        liveWindows[id] = liveWindow;
    }
})

function createLoginWindow(){
  loginWindow = new BrowserWindow({
        width: 570,
        height: 380,
        frame: false,
        //transparent: true,
  });
  loginWindow.loadURL(`file://${__dirname}/login.html`);
  loginWindow.on('closed', () => {
    loginWindow = null;
  });
}

function createLiveWindow(option){
  let liveWindow = new BrowserWindow({
        width: 920,
        height: 720,
        title: option.title,
        autoHideMenuBar: true,
  });
  liveWindow.loadURL(`file://${__dirname}/live.html`);
  liveWindow.webContents.on('did-finish-load', function(){
      liveWindow.webContents.send('send-live-mid', option.match_id);
      liveWindow.setTitle(option.title)
  });
  liveWindow.on('closed', () => {
      if(liveWindows.hasOwnProperty(option.match_id)) delete liveWindows[option.match_id]
  });
  liveWindow.on('resize', () => {
      liveWindow.webContents.send('live-window-resize', liveWindow.getSize());
  });
  liveWindow.webContents.openDevTools();

  return liveWindow;
}

function createWindow() {
  server.run();
  mainWindow = new BrowserWindow({
        width: 1280,
        height: 920,
        frame: false,
        //transparent: true,
  });
  mainWindow.loadURL(`file://${__dirname}/index.html`);
  var session = mainWindow.webContents.session;

  mainWindow.webContents.openDevTools();

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.on('ready', createLoginWindow);
//app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

