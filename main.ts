import { app, BrowserWindow, screen, Menu } from 'electron';
import * as path from 'path';
import * as url from 'url';

let win, serve;
const args = process.argv.slice(1);
serve = args.some(val => val === '--serve');

// TODO check initial size of final app window
// TODO remove link to devtools in menu? (check!)

function createWindow() {

  const electronScreen = screen;
  const size = electronScreen.getPrimaryDisplay().workAreaSize;

  // Create the browser window.
  win = new BrowserWindow({
    x: 0,
    y: 0,
    width: size.width,
    height: size.height,
    webPreferences: {
      nodeIntegration: true,
    },
    autoHideMenuBar: false,
  });

  if (serve) {
    require('electron-reload')(__dirname, {
      electron: require(`${__dirname}/node_modules/electron`)
    });
    win.loadURL('http://localhost:4200');
  } else {
    win.loadURL(url.format({
      pathname: path.join(__dirname, 'dist/index.html'),
      protocol: 'file:',
      slashes: true
    }));
  }

  if (serve) {
    win.webContents.openDevTools();
  }

  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store window
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null;
  });

}

try {
  // This method will be called when Electron has finished
  // initialization and is ready to create browser windows.
  // Some APIs can only be used after this event occurs.
  app.on('ready', () => {
    createWindow();

    const menu = Menu.buildFromTemplate([
      {
        label: 'Electron',
        submenu:[
          {role: 'close'},
          {type: 'separator'},
          {role: 'quit'}
        ]
      },
      {
        label: 'Ansicht',
        submenu:[
          {role: 'reload'},
          {role: 'forcereload'},
          {role: 'toggledevtools'},
          {type: 'separator'},
          {role: 'zoomin'},
          {role: 'zoomout'},
          {role: 'resetzoom'},
          {type: 'separator'},
          {role: 'togglefullscreen'}
        ]
      },
      {
        label: 'Edit',
        submenu:[
          {role: 'undo'},
          {role: 'redo'},
          {type: 'separator'},
          {role: 'cut'},
          {role: 'copy'},
          {role: 'paste'},
          {role: 'delete'},
        ]
      },
      {
        label: 'Fenster',
        submenu:[
          {role: 'minimize'}
        ]
      },
      {
        label: 'Einstellungen',
        submenu:[
          {label: 'Laufwerkpfade einstellen',
            click() {
              win.webContents.send('change-paths');
            }
          }
        ]
      },
    ]);
    Menu.setApplicationMenu(menu);
  });

  // Quit when all windows are closed.
  app.on('window-all-closed', () => {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (win === null) {
      createWindow();
    }
  });

} catch (e) {
  // Catch Error
  // throw e;
}
