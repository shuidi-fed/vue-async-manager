# vue-async-manager

**This project has been deprecated**

<a href="https://circleci.com/gh/shuidi-fed/vue-async-manager/tree/master"><img src="https://img.shields.io/circleci/build/github/shuidi-fed/vue-async-manager/master.svg" alt="build status"/></a>
[![](https://img.shields.io/npm/v/vue-async-manager.svg)](https://www.npmjs.com/package/vue-async-manager)
<a href="https://github.com/shuidi-fed/vue-async-manager"><img src="https://img.shields.io/github/license/shuidi-fed/vue-async-manager.svg" alt="License"/></a>
<a href="http://commitizen.github.io/cz-cli/"><img src="https://img.shields.io/badge/commitizen-friendly-brightgreen.svg" alt="Commitizen friendly"/></a>

Manage asynchronous calls more easily in Vue apps.

## Intro

`vue-async-manager` can help you manage asynchronous calls more easily in `Vue` applications, including:

- Load asynchronous components
- Fetch data from the API

If you are familiar with `React Suspense`, then `vue-async-manager` provides an `<Suspense>` component with the same name to do the same thing, and does an extra functional design for this.

In addition, `vue-async-manager` also provides a **resource manager** to help you manage asynchronous API requests more easily.

Next you can check out the [Guide](https://shuidi-fed.github.io/vue-async-manager/guide.html) to get started quickly, or check out [API](https://shuidi-fed.github.io/vue-async-manager/api.html). At the same time, we provide a number of [Live Demos](https://shuidi-fed.github.io/vue-async-manager/demo.html) to help you understand `vue-async-manager`.

## Installation

```sh
yarn add vue-async-manager
```

Or use `npm`:

```sh
npm install vue-async-manager --save
```

## Usage

```js
import Vue from "vue"
import VueAsyncManager from "vue-async-manager"

Vue.use(VueAsyncManager, options)
```

- [Click to view more live demos](https://shuidi-fed.github.io/vue-async-manager/demo.html)
- [Click to view more live demos](https://shuidi-fed.github.io/vue-async-manager/demo.html)
- [Click to view more live demos](https://shuidi-fed.github.io/vue-async-manager/demo.html)

## Author

**vue-async-manager** © [HcySunYang](https://github.com/HcySunYang), Released under the [MIT](./LICENSE) License.<br>
Authored and maintained by HcySunYang.

> [homepage](http://hcysun.me/homepage/) · GitHub [@HcySunYang](https://github.com/HcySunYang) · Twitter [@HcySunYang](https://twitter.com/HcySunYang)
