# 简介

<a href="https://circleci.com/gh/shuidi-fed/vue-async-manager/tree/master"><img src="https://img.shields.io/circleci/build/github/shuidi-fed/vue-async-manager/master.svg" alt="build status"/></a>
[![](https://img.shields.io/npm/v/vue-async-manager.svg)](https://www.npmjs.com/package/vue-async-manager)
<a href="https://github.com/shuidi-fed/vue-async-manager"><img src="https://img.shields.io/github/license/shuidi-fed/vue-async-manager.svg" alt="License"/></a>
<a href="http://commitizen.github.io/cz-cli/"><img src="https://img.shields.io/badge/commitizen-friendly-brightgreen.svg" alt="Commitizen friendly"/></a>

`vue-async-manager` 能帮助你在 `Vue` 应用中更轻松的管理异步调用，具体包括：

- 异步组件的加载
- 从 API 中获取数据

如果你熟悉 `React Suspense`，那么 `vue-async-manager` 提供了同名的 `<Suspense>` 组件来完成同样的事情，并对此做了额外的功能设计。

除此之外 `vue-async-manager` 还提供了“资源管理器”，用来帮助你更轻松的管理异步的 API 请求。

接下来你可以查看 [指南](/zh/guide.html) 以快速开始，或者查看 [API](/zh/api.html)。同时我们提供了许多个 [在线演示](/zh/demo.html) 来帮助你了解 `vue-async-manager`。

## 安装

```sh
yarn add vue-async-manager
```

或者使用 `npm`：

```sh
npm install vue-async-manager --save
```

## 使用

```js
import Vue from "vue"
import VueAsyncManager from "vue-async-manager"

Vue.use(VueAsyncManager, options)
```

[点击查看更多在线演示](/zh/demo.html)