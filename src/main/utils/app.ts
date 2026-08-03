import { nanoid } from 'nanoid';
import { basename, extname } from 'path';
import type { AppNode } from '@shared/type';
import { shell } from 'electron';
import { getPinyinKeyword } from './pinyin';

// 将应用路径转换为启动台节点
export const formatApps = async (paths: string[]): Promise<AppNode[]> => {
  return paths.map((path) => {
    // 应用文件扩展名
    const ext = extname(path);

    // 应用实际启动路径
    let target = path;

    if (ext == '.lnk') {
      target = shell.readShortcutLink(path).target;
    }

    // 应用节点显示名称
    const label = basename(path, ext);

    return {
      id: nanoid(),
      label,
      path: target,
      keyword: getPinyinKeyword(label),
      kind: 'app',
    };
  });
};

// 将文件夹路径转换为应用节点
export const formatFolders = (paths: string[]): AppNode[] => {
  return paths.map((path) => {
    // 文件夹节点显示名称
    const label = basename(path) || path;

    return {
      id: nanoid(),
      label,
      path,
      keyword: getPinyinKeyword(label),
      kind: 'app',
    };
  });
};
