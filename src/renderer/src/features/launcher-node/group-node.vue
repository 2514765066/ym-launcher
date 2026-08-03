<template>
  <BaseNode
    :data="data"
    @pointerenter="notSelf && handleEnter()"
    @pointerleave="notSelf && handleLeave()"
    @pointerup="notSelf && handleDrop()"
    @click="handleClick"
  >
    <GroupNodeIcon
      :class="{
        'scale-115': notSelf && isHover,
      }"
      :id="data.id"
    />
  </BaseNode>
</template>

<script setup lang="ts">
import { useIsHover } from '@/hooks/use-hover.js';
import { useCoreStore } from '@/stores/core';
import { eventBus } from '@/utils/event-bus';
import { GroupNode } from '@shared/type';
import { useLauncherUiStore } from '@/stores/launcher-ui';
import BaseNode from './base-node.vue';
import GroupNodeIcon from '@/components/node-icon/group-node-icon.vue';

// 分组节点数据
const props = defineProps<{
  data: GroupNode;
}>();

// 当前拖拽的节点 ID
const { dragNodeId } = storeToRefs(useLauncherUiStore());

// 分组移动能力
const { moveAppToGroup } = useCoreStore();

// 分组节点悬停状态
const [isHover, handleEnter, handleLeave] = useIsHover();

//当前元素不是自己
const notSelf = computed(() => {
  return dragNodeId.value && props.data.id != dragNodeId.value;
});

// 处理放入分组
const handleDrop = () => {
  handleLeave();

  moveAppToGroup(props.data.id, dragNodeId.value!);
};

// 打开应用分组
const handleClick = () => {
  if (dragNodeId.value) {
    return;
  }

  eventBus.emit('openGroupDialog', props.data.id);
};
</script>

<style scoped lang="scss"></style>
