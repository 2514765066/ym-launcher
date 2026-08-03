import { nanoid } from 'nanoid';
import type { AppNode } from '@shared/type';
import { useDesktopStore } from './desktop';
import { useGroupStore } from './group';
import { useLayoutStore } from './layout';
import { useNodeStore } from './node';
import { eventBus } from '@/utils/event-bus';

export const useCoreStore = defineStore('core', () => {
  const nodeStore = useNodeStore();
  const desktopStore = useDesktopStore();
  const groupStore = useGroupStore();
  const layoutStore = useLayoutStore();

  // 应用和分组节点
  const { nodes } = storeToRefs(nodeStore);

  // 节点数据操作
  const { getNode, appendNodes, isAppNode, isGroupNode } = nodeStore;

  // 桌面节点 ID
  const { desktopIds } = storeToRefs(desktopStore);

  // 桌面布局操作
  const { removeDesktopId } = desktopStore;

  // 分组数据操作
  const {
    getGroupAppIds,
    setGroupAppIds,
    addGroupApp,
    removeGroupApp,
    findAppGroupId,
    removeGroup,
  } = groupStore;

  // 启动台布局操作
  const { pageSize } = storeToRefs(layoutStore);
  const { setSelectedPage } = layoutStore;

  // 创建应用分组
  const createGroupNode = (targetId: string, dragId: string) => {
    // 组内应用不能再次合成分组
    if (findAppGroupId(targetId) || findAppGroupId(dragId)) {
      return;
    }

    // 作为新分组位置的应用节点
    const targetNode = getNode(targetId);

    // 拖入新分组的应用节点
    const dragNode = getNode(dragId);

    if (!isAppNode(targetNode) || !isAppNode(dragNode)) {
      return;
    }

    // 分组内保留的目标应用副本
    const newTargetNode: AppNode = {
      ...targetNode,
      id: nanoid(),
    };

    nodes.value[newTargetNode.id] = newTargetNode;

    nodes.value[targetNode.id] = {
      id: targetNode.id,
      label: '未命名',
      keyword: '',
      kind: 'group',
    };

    setGroupAppIds(targetNode.id, [newTargetNode.id, dragNode.id]);
    removeDesktopId(dragNode.id);
  };

  // 拆散应用分组
  const breakGroupNode = (groupId: string) => {
    // 需要拆散的应用分组
    const group = getNode(groupId);

    if (!isGroupNode(group)) {
      return;
    }

    const desktopIndex = desktopIds.value.indexOf(groupId);

    if (desktopIndex >= 0) {
      desktopIds.value.splice(desktopIndex, 1, ...getGroupAppIds(groupId));
    }

    removeGroup(groupId);
    delete nodes.value[group.id];
  };

  // 保存导入节点并跳转到最后一个新增节点所在页
  const appendImportedNodes = (importedNodes: AppNode[]) => {
    if (importedNodes.length === 0) {
      return;
    }

    appendNodes(importedNodes);
    desktopIds.value.push(...importedNodes.map((node) => node.id));
    setSelectedPage((_, max) => max - 1);
  };

  // 添加应用节点
  const addAppNode = async () => {
    // 用户选择后新增的应用节点
    const importedNodes = await ipc.addAppNode();

    appendImportedNodes(importedNodes);
  };

  // 添加文件夹应用节点
  const addFolderNode = async () => {
    // 用户选择后新增的文件夹节点
    const importedNodes = await ipc.addFolderNode();

    appendImportedNodes(importedNodes);
  };

  // 添加应用到已有分组
  const moveAppToGroup = (groupId: string, appId: string) => {
    // 接收应用的分组节点
    const groupNode = getNode(groupId);

    // 需要移动的应用节点
    const appNode = getNode(appId);

    if (!isGroupNode(groupNode) || !isAppNode(appNode)) {
      return;
    }

    // 应用移动前所属的分组 ID
    const sourceGroupId = findAppGroupId(appNode.id);

    if (sourceGroupId === groupNode.id) {
      return;
    }

    //超出最大内容
    if (getGroupAppIds(groupId).length >= pageSize.value) {
      eventBus.emit('error', `文件夹最多只能添加${pageSize.value}个应用`);
      return;
    }

    removeDesktopId(appNode.id);

    if (sourceGroupId) {
      removeGroupApp(sourceGroupId, appNode.id);

      if (getGroupAppIds(sourceGroupId).length <= 1) {
        breakGroupNode(sourceGroupId);
      }
    }

    addGroupApp(groupNode.id, appNode.id);
  };

  // 移除应用节点并清理所属分组
  const removeAppNode = (nodeId: string) => {
    // 待删除的应用节点
    const node = getNode(nodeId);

    if (!isAppNode(node)) {
      return;
    }

    // 包含待删除应用的分组 ID
    const parentGroupId = findAppGroupId(nodeId);

    if (parentGroupId) {
      removeGroupApp(parentGroupId, nodeId);

      if (getGroupAppIds(parentGroupId).length <= 1) {
        breakGroupNode(parentGroupId);
      }
    }

    removeDesktopId(nodeId);
    delete nodes.value[nodeId];
  };

  // 重命名节点
  const renameNode = async (id: string, label: string) => {
    // 需要重命名的节点
    const node = getNode(id);

    // 名称对应的搜索拼音
    const keyword = await ipc.getPinyin(label);

    node.label = label;
    node.keyword = keyword;
  };

  return {
    createGroupNode,
    breakGroupNode,
    addAppNode,
    addFolderNode,
    moveAppToGroup,
    removeAppNode,
    renameNode,
  };
});
