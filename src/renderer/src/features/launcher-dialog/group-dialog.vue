<template>
  <Dialog v-model:open="visible">
    <DialogContent
      class="glass min-w-[80%] px-0 outline-0 rounded-[48px] border-0"
      overlay-class="bg-transparent"
      :aria-describedby="undefined"
      :show-close-button="false"
    >
      <DialogTitle
        class="w-full absolute top-0 translate-y-[calc(-100%-32px)] text-center text-2xl font-normal"
      >
        {{ groupNode?.label }}
      </DialogTitle>

      <LauncherContextMenu>
        <section
          ref="contentRef"
          class="size-full grid place-items-center"
          :style="{
            gridTemplateColumns: `repeat(${config.colCount}, minmax(0, 1fr))`,
          }"
          data-kind="group-dialog"
          @pointerenter="dragNodeId && handleEnter()"
          @pointerleave="dragNodeId && handleLeave()"
        >
          <LauncherNode
            :style="{
              height: `${nodeHeight * 0.8}px`,
            }"
            v-for="id in groupAppIds"
            :key="id"
            :id="id"
          />
        </section>
      </LauncherContextMenu>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { SortableEvent } from 'sortablejs';
import LauncherNode from '@/features/launcher-node/index.vue';
import LauncherContextMenu from '@/features/launcher-context-menu/index.vue';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { useNodeStore } from '@/stores/node';
import { useCoreStore } from '@/stores/core';
import { useHover } from '@/hooks/use-hover';
import { eventBus } from '@/utils/event-bus.js';
import { useSortable } from '@/hooks/use-sortable';
import { useLauncherUiStore } from '@/stores/launcher-ui';
import { useSettingStore } from '@/stores/setting';
import { useGroupStore } from '@/stores/group';
import { useLayoutStore } from '@/stores/layout';

// 启动台外观设置
const { config } = storeToRefs(useSettingStore());

// 节点查询能力
const { getNode } = useNodeStore();

// 分组拆分能力
const { breakGroupNode } = useCoreStore();

// 启动台拖拽与桌面隐藏状态
const { dragNodeId, hiddenDesktop } = storeToRefs(useLauncherUiStore());

// 启动台拖拽状态操作
const { setDragNodeId } = useLauncherUiStore();

// 分组应用数据操作
const { getGroupAppIds, setGroupAppIds, removeGroupApp } = useGroupStore();

const { nodeHeight } = storeToRefs(useLayoutStore());

// 分组内容容器
const contentRef = useTemplateRef('contentRef');

//组id
const groupId = ref('');

// 弹窗可见状态
const visible = ref(false);

// 当前弹窗对应的有效分组
const groupNode = computed(() => {
  // 当前弹窗关联的节点
  const node = getNode(groupId.value);

  return node?.kind === 'group' ? node : undefined;
});

// 当前分组内的应用 ID
const groupAppIds = computed(() => {
  return getGroupAppIds(groupId.value);
});

// 分组弹窗悬停关闭操作
const [handleLeave, handleEnter] = useHover(() => {
  visible.value = false;
}, 500);

//拖拽开始
const handleStart = (e: SortableEvent) => {
  setDragNodeId(e.item.dataset.id);
};

//拖拽结束
const handleEnd = () => {
  setDragNodeId();

  if (!contentRef.value || !groupNode.value) {
    return;
  }

  // 排序后的分组应用 ID
  const ids = Array.from(
    contentRef.value.querySelectorAll<HTMLElement>('[data-id]'),
  ).map((item) => item.dataset.id!);

  setGroupAppIds(groupId.value, ids);
};

//拖拽离开组
const handleRemove = (e: SortableEvent) => {
  const appId = e.item.dataset.id!;

  removeGroupApp(groupId.value, appId);

  if (!groupNode.value || groupAppIds.value.length > 1) {
    return;
  }

  //如果只有一个节点拆分
  breakGroupNode(groupId.value);
};

const { createSortable } = useSortable(contentRef, {
  onStart: handleStart,
  onEnd: handleEnd,
  onRemove: handleRemove,
});

watch(visible, async (value) => {
  if (value === false) {
    hiddenDesktop.value = false;
    return;
  }

  await nextTick();

  createSortable();
});

// 分组被拆散后同步关闭弹窗
watch(
  groupNode,
  (node) => {
    if (node || !visible.value) {
      return;
    }

    visible.value = false;
  },
  {
    flush: 'sync',
  },
);

eventBus.on('openGroupDialog', (id) => {
  groupId.value = id;
  hiddenDesktop.value = true;
  visible.value = true;
});

ipc.on('show', () => {
  visible.value = false;
});
</script>

<style scoped lang="scss"></style>
