import pinyin from 'pinyin';

// 将名称转换为用于搜索的连续拼音
export const getPinyinKeyword = (label: string) => {
  return pinyin(label).join('');
};
