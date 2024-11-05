#!/usr/bin/env sh

set -e

rm -rf dist

# build demo
pnpm --filter @litegraph/editor build
pnpm docs:build

cd dist 

git init
git add .

git remote add origin git@github.com:gausszhou/litegraph.git

git checkout -b gh-pages
time=$(date "+%Y-%m-%d %H:%M")
git commit -m "gh-pages: update in $time $1"
git push origin gh-pages -f

cd -