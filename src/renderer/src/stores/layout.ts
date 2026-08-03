import { matchKeyword } from '@/utils/search';
import { useSettingStore } from './setting';
import { useLauncherUiStore } from './launcher-ui';
import { useDesktopStore } from './desktop';
import { useNodeStore } from './node';
import { getValue } from '@/utils/value';
import { chunk } from '@/utils/page';

type DesktopId = string | null;

// 将页面写回包含空槽的一维桌面数据
const getDesktopIds = (pages: string[][], pageSize: number) => {
  const desktopIds: DesktopId[] = [];
  const addedIds = new Set<string>();

  pages.forEach((page, pageIndex) => {
    let nodeCount = 0;

    page.forEach((id) => {
      if (addedIds.has(id)) {
        return;
      }

      addedIds.add(id);
      desktopIds.push(id);
      nodeCount++;
    });

    const isLastPage = pageIndex === pages.length - 1;

    if (!isLastPage || nodeCount === 0) {
      for (let index = nodeCount; index < pageSize; index++) {
        desktopIds.push(null);
      }
    }
  });

  return desktopIds;
};

export const useLayoutStore = defineStore('layout', () => {
  // 启动台节点数据
  const { nodes } = storeToRefs(useNodeStore());

  // 一维桌面数据
  const { desktopIds } = storeToRefs(useDesktopStore());

  // 启动台外观设置
  const { config } = storeToRefs(useSettingStore());

  // 启动台搜索关键词
  const { keyword, isSearching } = storeToRefs(useLauncherUiStore());

  // 选中的页
  const selectedPage = ref(0);

  // 节点尺寸
  const nodeSize = computed(() => {
    return (
      (window.innerWidth / config.value.colCount) *
      0.8 *
      (config.value.iconZoom / 100)
    );
  });

  //节点高度
  const nodeHeight = computed(() => {
    return (window.innerHeight - 128 - 70) / config.value.rowCount;
  });

  // 每页可容纳的节点数量
  const pageSize = computed(() => {
    return config.value.rowCount * config.value.colCount;
  });

  // 搜索结果中的节点 ID
  const searchIds = computed(() => {
    return Object.values(nodes.value)
      .filter((node) => {
        return matchKeyword([node.keyword, node.label], keyword.value);
      })
      .map((node) => node.id);
  });

  // 根据空槽边界或搜索结果拆分出的页面节点 ID
  const pages = computed(() => {
    return chunk(
      isSearching.value ? searchIds.value : desktopIds.value,
      pageSize.value,
    );
  });

  // 当前可见节点对应的页数
  const pageCount = computed(() => {
    return pages.value.length;
  });

  // 当前页面是否为空白页
  const isCurrentPageEmpty = computed(() => {
    return pageCount.value > 0 && pages.value[selectedPage.value]?.length === 0;
  });

  // 校正页码至当前有效范围
  const clampPage = (page: number) => {
    return Math.min(Math.max(page, 0), Math.max(pageCount.value - 1, 0));
  };

  // 设置选中的页面
  const setSelectedPage = (
    page: number | ((current: number, max: number) => number),
  ) => {
    const value = getValue(page, selectedPage.value, pageCount.value);

    selectedPage.value = clampPage(value);
  };

  // 写入拖拽后的页面并处理满页溢出
  const setDraggedDesktopPages = (draggedPages: string[][]) => {
    if (pageSize.value <= 0) {
      return;
    }

    for (let i = 0; i < draggedPages.length; i++) {
      const page = draggedPages[i];

      if (page.length <= pageSize.value) {
        continue;
      }

      const overflow = page.splice(pageSize.value);
      const nextPage = draggedPages[i + 1];

      if (nextPage && nextPage.length + overflow.length <= pageSize.value) {
        nextPage.push(...overflow);
        continue;
      }

      draggedPages.splice(i + 1, 0, overflow);
    }

    desktopIds.value = getDesktopIds(draggedPages, pageSize.value);
  };

  // 在当前页后插入空白页
  const insertBlankPage = () => {
    const index = pageCount.value
      ? (selectedPage.value + 1) * pageSize.value
      : 0;

    const emptyPage = Array<null>(pageSize.value).fill(null);

    while (desktopIds.value.length < index) {
      desktopIds.value.push(null);
    }

    desktopIds.value.splice(index, 0, ...emptyPage);

    setSelectedPage(selectedPage.value + 1);
  };

  // 删除当前空白页
  const removeBlankPage = () => {
    if (!isCurrentPageEmpty.value) {
      return;
    }

    const index = selectedPage.value * pageSize.value;

    desktopIds.value.splice(index, pageSize.value);

    setSelectedPage((c) => c - 1);
  };

  // 可见节点或布局变化后保持当前页有效
  watch(pageCount, () => {
    selectedPage.value = clampPage(selectedPage.value);
  });

  // 页面容量变化时保留旧页面边界并校正选中页
  watch(
    pageSize,
    (newPageSize, oldPageSize) => {
      if (newPageSize <= 0 || oldPageSize <= 0) {
        return;
      }

      const oldPages = chunk(desktopIds.value, oldPageSize);
      const resizedPages: string[][] = [];
      let resizedPageIndex = 0;

      oldPages.forEach((page, pageIndex) => {
        if (pageIndex < selectedPage.value) {
          resizedPageIndex += Math.max(Math.ceil(page.length / newPageSize), 1);
        }

        if (page.length === 0) {
          resizedPages.push(page);
          return;
        }

        while (page.length > 0) {
          resizedPages.push(page.splice(0, newPageSize));
        }
      });

      desktopIds.value = getDesktopIds(resizedPages, newPageSize);
      selectedPage.value = resizedPageIndex;
    },
    {
      flush: 'sync',
    },
  );

  return {
    selectedPage,
    pageSize,
    pages,
    pageCount,
    isCurrentPageEmpty,
    nodeSize,
    nodeHeight,
    setSelectedPage,
    setDraggedDesktopPages,
    insertBlankPage,
    removeBlankPage,
  };
});
