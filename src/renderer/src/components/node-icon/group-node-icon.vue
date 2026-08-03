<template>
  <div
    class="glass p-[10%] aspect-square grid grid-cols-2 grid-rows-2 gap-[8%] rounded-[24%] transition-transform ease-in-out"
    :style="{
      width: `${(nodeSize / 10) * 11}px`,
    }"
  >
    <AppNodeIcon
      class="rounded-[30%]"
      v-for="id in appIds.slice(0, 4)"
      :key="id"
      :id="id"
      is-group
    />
  </div>
</template>

<script setup lang="ts">
import AppNodeIcon from './app-node-icon.vue';
import { useLayoutStore } from '@/stores/layout';
import { useGroupStore } from '@/stores/group';

// 分组节点数据
const props = defineProps<{
  id: string;
}>();

// 启动台节点尺寸
const { nodeSize } = storeToRefs(useLayoutStore());

// 分组应用查询能力
const { getGroupAppIds } = useGroupStore();

// 分组内的应用 ID
const appIds = computed(() => {
  return getGroupAppIds(props.id);
});
</script>

<style scoped lang="scss"></style>
