#!/usr/bin/env sh
set -e

pnpm install

# 按拓扑序构建 packages/* 与 apps/*
pnpm build

# 输出各产物体积（CI 中同样执行）
pnpm size
