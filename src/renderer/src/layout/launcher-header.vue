<template>
  <section class="pt-16 pb-5 flex-center gap-4">
    <div class="glass w-70 h-11 px-4 flex items-center gap-3 rounded-full">
      <Search class="text-foreground/70" />

      <input
        class="size-full outline-none"
        placeholder="搜索应用"
        v-model.trim="keyword"
        :spellcheck="false"
      />
    </div>

    <Tooltip content="打开设置" shortcut="Ctrl+,">
      <button
        class="glass size-11 flex-center rounded-full cursor-pointer"
        @click="handleSetting"
      >
        <Settings class="text-foreground/70" />
      </button>
    </Tooltip>
  </section>
</template>

<script setup lang="ts">
import { useLauncherUiStore } from '@/stores/launcher-ui';
import { eventBus } from '@/utils/event-bus';
import { Search, Settings } from '@lucide/vue';
import Tooltip from '@/components/tooltip.vue';

// 搜索关键字
const { keyword } = storeToRefs(useLauncherUiStore());

const handleSetting = () => {
  eventBus.emit('settingDialog');
};
</script>

<style scoped lang="scss"></style>
