<template>
  <Button
    :class="{
      'px-2': !isRecording,
    }"
    variant="outline"
    size="sm"
    @click="handleClick"
    @keydown.stop.prevent="handleShortcutKeydown"
    @blur="handleBlur"
  >
    <span v-if="isRecording">请按下快捷键</span>

    <span class="text-muted-foreground" v-else-if="!model">暂无快捷键</span>

    <template v-for="(key, index) in shortcutParts" :key="key" v-else>
      <span v-if="typeof key === 'string'">
        {{ key }}
      </span>

      <component :is="key" v-else />

      <span v-if="index < shortcutParts.length - 1">+</span>
    </template>
  </Button>

  <Tooltip content="清空快捷键">
    <Button variant="outline" size="icon-sm" @click="clearShortcut">
      <CircleX class="text-destructive-foreground" />
    </Button>
  </Tooltip>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button';
import { formatShortcut } from '@/utils/format';
import { CircleX } from '@lucide/vue';
import Tooltip from './tooltip.vue';

const model = defineModel<string>({
  required: true,
});

const isRecording = ref(false);

//拆分快捷键
const shortcutParts = computed(() => {
  return formatShortcut(model.value, false);
});

//开始
const handleClick = (event: MouseEvent) => {
  isRecording.value = true;
  (event.currentTarget as HTMLButtonElement).focus();
};

//结束
const handleBlur = () => {
  isRecording.value = false;
};

//处理按下
const handleShortcutKeydown = async (event: KeyboardEvent) => {
  if (!isRecording.value) {
    return;
  }

  if (event.key == 'Control' || event.key == 'Shift' || event.key == 'Alt') {
    event.preventDefault();
    return;
  }

  const result: string[] = [];

  if (event.ctrlKey) {
    result.push('Control');
  }

  if (event.shiftKey) {
    result.push('Shift');
  }

  if (event.altKey) {
    result.push('Alt');
  }

  result.push(event.key.toUpperCase());

  model.value = result.join('+');

  isRecording.value = false;
};

//清空快捷键
const clearShortcut = () => {
  model.value = '';
};
</script>

<style scoped lang="scss"></style>
