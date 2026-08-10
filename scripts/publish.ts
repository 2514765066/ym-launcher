import { useGiteeReleases, useGithubReleases } from 'ym-release';
import { join } from 'path';
import { readFileSync } from 'fs';
import { name, version } from '../package.json';

const __dirname = import.meta.dirname;

const { GITEE_TOKEN, GH_TOKEN } = process.env;

if (!GITEE_TOKEN || !GH_TOKEN) {
  throw new Error('未找到token');
}

const giteeRelease = useGiteeReleases({
  token: GITEE_TOKEN!,
  repo: name,
  owner: 'zmy-devs',
});

const githubRelease = useGithubReleases({
  token: GH_TOKEN!,
  repo: name,
  owner: 'zmy-devs',
});

//获取更新内容
const getDoc = (version: string) => {
  const url = join(__dirname, '../docs/release-note.md');

  const doc = readFileSync(url).toString();

  const reg = new RegExp(`## ${version}([\\s\\S]*?)##`);

  const match = doc.match(reg);

  return match ? match[1].trim() : '发布第一个版本';
};

const main = async () => {
  const body = getDoc(version);

  const files = [
    join(__dirname, `../dist/latest.yml`),
    join(__dirname, `../dist/${name}-${version}.exe`),
  ];

  await giteeRelease({
    version,
    body,
    files,
  });

  await githubRelease({
    version,
    body,
    files,
  });
};

main();
