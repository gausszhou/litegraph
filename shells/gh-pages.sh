#!/usr/bin/env sh

# 本地手动发布：构建 dist/ 并强制推送到 gh-pages 分支。
# 正常流程由 CI 的 deploy job 在 master 通过检查后自动执行，本脚本用于应急/离线发布。
set -e

rm -rf dist

# demo + 中英双语文档 + 站点入口页 + .nojekyll
pnpm pages:build

cd dist

git init
git add .

git remote add origin git@github.com:gausszhou/litegraph.git

git checkout -b gh-pages
time=$(date "+%Y-%m-%d %H:%M")
git commit -m "gh-pages: update in $time $1"
git push origin gh-pages -f

cd -
