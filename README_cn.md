# OpenList（前端）

![License MIT](https://img.shields.io/badge/license-MIT-green)
[![GitHub package.json version](https://img.shields.io/github/package-json/v/OpenListTeam/OpenList-Frontend)](./package.json)
[![NPM Version](https://img.shields.io/npm/v/%40openlist-frontend%2Fopenlist-frontend)](https://www.npmjs.com/package/@openlist-frontend/openlist-frontend)
[![NPM Downloads](https://img.shields.io/npm/dw/%40openlist-frontend%2Fopenlist-frontend)](https://www.npmjs.com/package/@openlist-frontend/openlist-frontend)
[![NPM Last Update](https://img.shields.io/npm/last-update/%40openlist-frontend%2Fopenlist-frontend)](https://www.npmjs.com/package/@openlist-frontend/openlist-frontend)

- [English](./README.md) | 中文

## 二次开发说明

本仓库包含基于 OpenList Frontend 的二次开发前端修改。我不是 OpenList Frontend 原仓库作者，也不声明对上游项目的作者身份；原项目及上游贡献归 OpenList Team 及其贡献者所有。

当前工作区主要为服务器下载功能新增了前端界面和多语言支持，包括工具栏/右键菜单入口、服务器下载任务面板、管理端任务入口、用户权限文案、服务器下载目录设置文案，以及英文和简体中文文案。请将这些内容视为下游修改。

## 构建

可以使用 [构建脚本](./build.sh)。

```plaintext
Usage: ./build.sh [--dev|--release] [--compress|--no-compress] [--enforce-tag] [--skip-i18n] [--lite]

Options (will overwrite environment setting):
  --dev         Build development version
  --release     Build release version (will check if git tag match package.json version)
  --compress    Create compressed archive
  --no-compress Skip compression
  --enforce-tag Force git tag requirement for both dev and release builds
  --skip-i18n   Skip i18n build step
  --lite        Build lite version

Environment variables:
  OPENLIST_FRONTEND_BUILD_MODE=dev|release (default: dev)
  OPENLIST_FRONTEND_BUILD_COMPRESS=true|false (default: false)
  OPENLIST_FRONTEND_BUILD_ENFORCE_TAG=true|false (default: false)
  OPENLIST_FRONTEND_BUILD_SKIP_I18N=true|false (default: false)
```

## 许可证

MIT

## 致谢

[OpenList](https://github.com/OpenListTeam/OpenList) 是一个有韧性、社区驱动的 [AList](https://github.com/AlistGo/alist) 分支，旨在防御基于信任的开源攻击。
