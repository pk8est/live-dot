const path = require('path');
const {app, ipcMain, BrowserWindow, dialog, Tray, Menu, MenuItem, globalShortcut} = require('electron');
const config = require('./server/config');
const logger = require("./server/utils/log");
const util = require("./server/utils/util");
const server = require('./server/server');
const Promise = require('bluebird');

// this should be placed at top of main.js to handle setup events quickly
if (handleSquirrelEvent()) {
  // squirrel event handled and app will exit in 1000ms, so don't do anything else
  return;
}

process.env.APP_VERSION = "1.0.0";
process.env.APP_PROXY_PORT = "11223";
process.env.APP_SOCKET_PORT = "11224";
process.env.APP_PROXY_URL = "http://127.0.0.1:" + process.env.APP_PROXY_PORT;
process.env.APP_SOCKET_URL = "http://127.0.0.1:" + process.env.APP_SOCKET_PORT;
process.env.RESOURCES_PATH = path.join(__dirname, '/tools');


let mainWindow;
let loginWindow;
let settingsWindow;
let liveWindows = {};
let exiting = false;
let shouldQuit = false;

global.updateStatus = (function () {
    let status = '';
    return {
        get () {
            return status;
        },

        set (value) {
            status = value;
            if (settingsWindow) {
                settingsWindow.webContents.send('UPDATE_STATUS', value);
            }
        }
    };
})();

global.terminate = function () {
    shouldQuit = true;
    app.quit();
};

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

ipcMain.on('open-file-dialog-image', function (event, channel) {
    dialog.showOpenDialog({
        properties: ['openFile', 'multiSelections' ],
        filters: [
          { name: 'Images', extensions: ['jpg', 'png', 'gif'] },
        ]
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
      liveWindow.setTitle(option.title);
      liveWindow.focus();
  });
  liveWindow.on('closed', () => {
      if(liveWindows.hasOwnProperty(option.match_id)) delete liveWindows[option.match_id]
  });
  liveWindow.on('resize', () => {
      liveWindow.webContents.send('live-window-resize', liveWindow.getSize());
  });

  return liveWindow;
}

function createWindow() {
  server.run();
  mainWindow = new BrowserWindow({
        width: 1080,
        height: 800,
        frame: false,
        autoHideMenuBar: true,
        //transparent: true,
  });
  mainWindow.loadURL(`file://${__dirname}/index.html`);
  var session = mainWindow.webContents.session;

  mainWindow.on('closed', () => {
    mainWindow = null;
    quit();
  });
  mainWindow.webContents.on('did-finish-load', function () {
    mainWindow.setTitle('hot-app');
    mainWindow.show();
    mainWindow.focus();
  });
  createTray();
  bindGlobalShortcutOpenDevTools(mainWindow);
}

function bindGlobalShortcutOpenDevTools(win){
    const ret = globalShortcut.register('ctrl+x', () => {
        win.webContents.openDevTools();
    }) 
}

function createTray(){
   const appIcon = new Tray(path.join(__dirname, './assets/images/icon.png'));
    var trayMenu = new Menu()
    trayMenu.append(new MenuItem({
      label: '显示',
      click: function () {
        if(!exiting){
            mainWindow.show();
        }else{
            dialog.showErrorBox('错误', '应用正在退出.')
        }
      }
    }))
    trayMenu.append(new MenuItem({
      label: '隐藏',
      click: function () {
        mainWindow.hide();
      }
    }))
    trayMenu.append(new MenuItem({
      label: '退出',
      click: function () {
        quit();
      }
    }));
    appIcon.setContextMenu(trayMenu)
    appIcon.on('click', function (e) {
        e.preventDefault()
        //mainWindow.show();
        appIcon.popUpContextMenu(trayMenu)
    })

}

function quit(){
    exiting = true;
    if (mainWindow) {
        mainWindow.hide();
    }
    //30秒后强制退出
    Promise.delay(30000).then(function(){
        if (mainWindow) {
            app.quit();
            //mainWindow.close();
            mainWindow = null;
        }
    });
    server.stop(function(){
        app.quit();
        //mainWindow.close();
        mainWindow = null;
    });
}

function handleSquirrelEvent() {
  if (process.argv.length === 1) {
    return false;
  }

  const ChildProcess = require('child_process');
  const path = require('path');

  const appFolder = path.resolve(process.execPath, '..');
  const rootAtomFolder = path.resolve(appFolder, '..');
  const updateDotExe = path.resolve(path.join(rootAtomFolder, 'Update.exe'));
  const exeName = path.basename(process.execPath);

  const spawn = function(command, args) {
    let spawnedProcess, error;

    try {
      spawnedProcess = ChildProcess.spawn(command, args, {detached: true});
    } catch (error) {}

    return spawnedProcess;
  };

  const spawnUpdate = function(args) {
    return spawn(updateDotExe, args);
  };

  const squirrelEvent = process.argv[1];
  switch (squirrelEvent) {
    case '--squirrel-install':
    case '--squirrel-updated':
      // Optionally do things such as:
      // - Add your .exe to the PATH
      // - Write to the registry for things like file associations and
      //   explorer context menus

      // Install desktop and start menu shortcuts
      spawnUpdate(['--createShortcut', exeName]);

      setTimeout(app.quit, 1000);
      return true;

    case '--squirrel-uninstall':
      // Undo anything you did in the --squirrel-install and
      // --squirrel-updated handlers

      // Remove desktop and start menu shortcuts
      spawnUpdate(['--removeShortcut', exeName]);

      setTimeout(app.quit, 1000);
      return true;

    case '--squirrel-obsolete':
      // This is called on the outgoing version of your app before
      // we update to the new version - it's the opposite of
      // --squirrel-updated

      app.quit();
      return true;
  }
};

//app.on('ready', createLoginWindow);
app.on('ready', createWindow);

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

