import { useLauncherUiStore } from '@/stores/launcher-ui';
import { useClass } from './class';
import { useShortcut } from './shortcut';
import { useWheel } from './wheel';

// 壁纸亮度判定阈值
const lightnessThreshold = 0.5;

// 壁纸亮度采样边长
const sampleSize = 48;

// 读取 Base64 壁纸的平均感知亮度
const getWallpaperLightness = async (wallpaper: string) => {
  if (!wallpaper) {
    return 0;
  }

  // 待分析的壁纸图片
  const image = new Image();

  // 图片加载完成后的亮度结果
  const lightness = new Promise<number>((resolve) => {
    image.onload = () => {
      try {
        const canvas = document.createElement('canvas');

        canvas.width = sampleSize;
        canvas.height = sampleSize;

        const context = canvas.getContext('2d', {
          willReadFrequently: true,
        });

        if (!context) {
          resolve(0);
          return;
        }

        context.drawImage(image, 0, 0, sampleSize, sampleSize);

        // 壁纸采样后的 RGBA 像素数据
        const pixels = context.getImageData(0, 0, sampleSize, sampleSize).data;

        // 每个像素的感知亮度
        const lightnessValues = Array.from(
          {
            length: pixels.length / 4,
          },
          (_, index) => {
            const offset = index * 4;

            return (
              (pixels[offset] * 0.2126 +
                pixels[offset + 1] * 0.7152 +
                pixels[offset + 2] * 0.0722) /
              255
            );
          },
        );

        // 壁纸整体平均感知亮度
        const totalLightness = lightnessValues.reduce((total, value) => {
          return total + value;
        }, 0);

        resolve(totalLightness / lightnessValues.length);
      } catch {
        resolve(0);
      }
    };

    image.onerror = () => {
      resolve(0);
    };
  });

  image.src = wallpaper;

  return lightness;
};

// 初始化启动台运行时能力
export const useRuntimeStore = defineStore('runtime', () => {
  // 启动台壁纸状态操作
  const { setWallpaper } = useLauncherUiStore();

  //获取壁纸
  const refreshWallpaper = async () => {
    // 当前系统壁纸的 Base64 数据
    const wallpaper = await ipc.getWallpaper();

    // 当前壁纸的平均感知亮度
    const lightness = await getWallpaperLightness(wallpaper);

    // 当前壁纸对应的全局主题
    const isDarkTheme = lightness < lightnessThreshold;

    document.documentElement.classList.toggle('dark', isDarkTheme);
    setWallpaper(wallpaper);
  };

  //每次打开重新获取壁纸
  ipc.on('show', refreshWallpaper);

  refreshWallpaper();
  useClass();
  useShortcut();
  useWheel();
});
