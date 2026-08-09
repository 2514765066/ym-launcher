import { BrowserWindow, screen } from 'electron';
import { join } from 'path';
import { browserWindows } from '.';
import { is } from '@electron-toolkit/utils';

export const createMainWindow = () => {
  const point = screen.getCursorScreenPoint();
  const display = screen.getDisplayNearestPoint(point);

  const bw = new BrowserWindow({
    x: display.bounds.x,
    y: display.bounds.y,
    width: display.bounds.width,
    height: display.bounds.height,
    frame: false,
    show: false,
    autoHideMenuBar: true,
    resizable: false,
    transparent: true,
    alwaysOnTop: true,
    skipTaskbar: true,

    webPreferences: {
      preload: join(__dirname, '../preload/index.mjs'),
      sandbox: false,
    },
  });

  browserWindows.set('main', bw);

  //开发模式
  if (is.dev) {
    bw.loadURL(`${process.env['ELECTRON_RENDERER_URL']}`);
    bw.webContents.openDevTools({ mode: 'detach' });
    bw.setAlwaysOnTop(false);
    bw.setSkipTaskbar(false);
  }
  //生产模式
  else {
    bw.loadFile(join(__dirname, '../renderer/index.html'));
  }

  //显示窗口
  const show = () => {
    bw.webContents.send('show');
    bw.setOpacity(0);
    bw.show();
    bw.focus();

    setTimeout(() => {
      bw.setOpacity(1);
    }, 100);
  };

  return [bw, show] as const;
};
