import { formatApps, formatFolders } from '../utils/app';
import { app, BrowserWindow, dialog, shell } from 'electron';
import type { IpcMainInvokeEvent } from 'electron';
import { readFile } from 'fs/promises';
import { getWallpaper as _getWallpaper } from 'wallpaper';
import { autoUpdater } from 'electron-updater';
import { setHotCorner as _setHotCorner } from '../hooks/hot-corner';
import { setStartShortcut as _setStartShortcut } from '../hooks/start-shortcut';
import type { HotCornerPosition } from '@shared/type';
import { getPathIcon } from '../utils/icon';
import { getPinyinKeyword } from '../utils/pinyin';

// 获取名称对应的搜索拼音
export const getPinyin = (_, label: string) => {
  return getPinyinKeyword(label);
};

//获取壁纸
export const getWallpaper = async () => {
  const path = await _getWallpaper();

  const buffer = await readFile(path);

  const ext = path.split('.').pop(); // 获取扩展名

  return `data:image/${ext};base64,${buffer.toString('base64')}`;
};

//添加应用
export const addAppNode = async ({ sender }: IpcMainInvokeEvent) => {
  const bw = BrowserWindow.fromWebContents(sender);

  const result = await dialog.showOpenDialog(bw!, {
    title: '添加应用程序',
    properties: ['openFile', 'multiSelections'],
    filters: [
      {
        name: '应用',
        extensions: ['lnk', 'exe'],
      },
    ],
  });

  if (result.canceled) {
    return [];
  }

  return formatApps(result.filePaths);
};

// 添加文件夹
export const addFolderNode = async ({ sender }: IpcMainInvokeEvent) => {
  // 发起文件夹选择的窗口
  const bw = BrowserWindow.fromWebContents(sender);

  // 用户选择的文件夹
  const result = await dialog.showOpenDialog(bw!, {
    title: '添加文件夹',
    properties: ['openDirectory', 'multiSelections'],
  });

  if (result.canceled) {
    return [];
  }

  return formatFolders(result.filePaths);
};

// 获取应用图标的 Base64 数据
export const getIcon = async (_, target: string) => {
  return getPathIcon(target);
};

//隐藏应用
export const hidden = ({ sender }: IpcMainInvokeEvent) => {
  const bw = BrowserWindow.fromWebContents(sender);

  bw?.hide();
};

// 打开文件
export const openPath = (_, path: string) => {
  hidden(_);

  shell.openPath(path);
};

// 打开文件所在位置
export const openPathInFolder = (_, path: string) => {
  hidden(_);
  shell.showItemInFolder(path);
};

// 打开网址
export const openUrl = async (_, url: string) => {
  hidden(_);

  shell.openExternal(url);
};

//检查更新
export const checkUpdate = async () => {
  const res = await autoUpdater.checkForUpdates();

  if (!res?.isUpdateAvailable) {
    return false;
  }

  return res?.updateInfo.version;
};

//安装
export const installUpdate = () => {
  autoUpdater.quitAndInstall(true, true);
};

//设置启动角配置
export const setHotCorner = (
  _,
  config: { disabled: boolean; position: HotCornerPosition },
) => {
  _setHotCorner(config);
};

//设置快速启动的快捷键
export const setStartShortcut = (_, shortcut: string) => {
  _setStartShortcut(shortcut);
};

//设置开机自启动
export const setOpenAtLogin = (_, openAtLogin: boolean) => {
  app.setLoginItemSettings({ openAtLogin });
};
