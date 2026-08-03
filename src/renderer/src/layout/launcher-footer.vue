<template>
  <section class="py-5 flex-center">
    <main
      class="w-fit p-2.5 flex gap-3 rounded-full transition-all"
      :class="{
        glass: isHover,
      }"
      @mouseenter="handleEnter"
      @mouseleave="handleLeave"
    >
      <div
        class="size-2.5 rounded-full backdrop-blur bg-background/30 dark:bg-foreground/30 hover:scale-110 transition-transform"
        :class="{
          'bg-background! dark:bg-foreground!': selectedPage == index,
        }"
        v-for="(_, index) in pageCount"
        :key="index"
        @click="setSelectedPage(index)"
      ></div>
    </main>
  </section>
</template>

<script setup lang="ts">
import { useIsHover } from '@/hooks/use-hover';
import { useLayoutStore } from '@/stores/layout';

const launcherLayoutStore = useLayoutStore();
const { selectedPage, pageCount } = storeToRefs(launcherLayoutStore);
const { setSelectedPage } = launcherLayoutStore;

const [isHover, handleEnter, handleLeave] = useIsHover(0);
</script>

<style scoped lang="scss"></style>
