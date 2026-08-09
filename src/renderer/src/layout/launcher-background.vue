<template>
  <section
    class="size-screen overflow-hidden bg-top bg-cover bg-no-repeat"
    :style="{
      backgroundImage: `url(${wallpaper})`,
    }"
  >
    <div
      class="size-full"
      :style="{
        backdropFilter: `blur(${config.blur}px)`,
        backgroundColor: `rgba(0,0,0,${config.mask / 100})`,
      }"
    >
      <slot />
    </div>
  </section>
</template>

<script setup lang="ts">
import { useLauncherUiStore } from '@/stores/launcher-ui';
import { useSettingStore } from '@/stores/setting';

const { wallpaper } = storeToRefs(useLauncherUiStore());
const { config } = storeToRefs(useSettingStore());
</script>

<style scoped lang="scss"></style>
