<template>
  <section class="size-full flex-center flex-col gap-2" :data-id="data.id">
    <div
      class="flex-center flex-col"
      :data-id="data.id"
      :data-menu-kind="data.kind"
      v-on-long-press="handleLongPress"
      @mousedown.left="handleMousedown"
      @mouseup.left="handleMouseup"
      @click.stop
    >
      <slot></slot>
    </div>

    <span class="w-full truncate text-center" :class="config.iconTitleSize">
      {{ data.label }}
    </span>
  </section>
</template>

<script setup lang="ts">
import { vOnLongPress } from '@vueuse/components';
import { useLauncherUiStore } from '@/stores/launcher-ui';
import { useSettingStore } from '@/stores/setting';
import { Node } from '@shared/type';

const props = defineProps<{
  data: Node;
}>();

const emits = defineEmits<{
  click: [];
}>();

// 启动台搜索状态
const { isSearching } = storeToRefs(useLauncherUiStore());
const { setStatus } = useLauncherUiStore();
const { config } = storeToRefs(useSettingStore());

let time = 0;

const handleMousedown = () => {
  time = Date.now();
};

const handleMouseup = () => {
  const diff = Date.now() - time;

  if (diff > 200) {
    return;
  }

  emits('click');
};

const handleLongPress = () => {
  if (isSearching.value) {
    return;
  }

  setStatus('remove');
};
</script>

<style scoped lang="scss"></style>
