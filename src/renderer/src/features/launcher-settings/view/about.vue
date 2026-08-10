<template>
  <Container view-class="py-8 flex flex-col gap-8">
    <ItemGroup>
      <p class="py-3 px-4">关于</p>

      <ItemSeparator />

      <Item size="sm">
        <ItemContent>
          <ItemTitle>反馈问题</ItemTitle>

          <ItemDescription> 反馈应用存在的bug </ItemDescription>
        </ItemContent>

        <ItemActions>
          <Button size="sm" variant="outline" @click="handleIssue">反馈</Button>
        </ItemActions>
      </Item>

      <Item size="sm">
        <ItemContent>
          <ItemTitle>版本</ItemTitle>

          <ItemDescription> 当前应用的版本</ItemDescription>
        </ItemContent>

        <ItemActions> v{{ appVersion }} </ItemActions>
      </Item>
    </ItemGroup>

    <ItemGroup>
      <p class="py-3 px-4">重置</p>

      <ItemSeparator />

      <Item size="sm">
        <ItemContent>
          <ItemTitle>恢复默认设置</ItemTitle>

          <ItemDescription> 把设置还原成默认配置 </ItemDescription>
        </ItemContent>

        <ItemActions>
          <Button size="sm" variant="destructive" @click="handleReset">
            重置
          </Button>
        </ItemActions>
      </Item>
    </ItemGroup>
  </Container>
</template>

<script setup lang="ts">
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemSeparator,
  ItemTitle,
  ItemActions,
  ItemGroup,
} from '@/components/ui/item';
import Container from '@/components/container/index.vue';
import { Button } from '@/components/ui/button';
import { appVersion } from '@shared/app-info';
import { useSettingStore } from '@/stores/setting';
import { issueUrl } from '@/map';
import MessageBox from '@/components/message-box';

const { resetConfig } = useSettingStore();
//反馈bug
const handleIssue = () => {
  ipc.openUrl(issueUrl);
};

//重置
const handleReset = async () => {
  const res = await MessageBox.confirm({
    title: '是否要恢复默认设置',
    description: '此操作将会将应用的所有设置恢复成默认设置。',
  });

  if (!res) return;

  resetConfig();
};
</script>

<style scoped lang="scss"></style>
