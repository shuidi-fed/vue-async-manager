# Intro

<a href="https://circleci.com/gh/shuidi-fed/vue-async-manager/tree/master"><img src="https://img.shields.io/circleci/build/github/shuidi-fed/vue-async-manager/master.svg" alt="build status"/></a>
[![](https://img.shields.io/npm/v/vue-async-manager.svg)](https://www.npmjs.com/package/vue-async-manager)
<a href="https://github.com/shuidi-fed/vue-async-manager"><img src="https://img.shields.io/github/license/shuidi-fed/vue-async-manager.svg" alt="License"/></a>
<a href="http://commitizen.github.io/cz-cli/"><img src="https://img.shields.io/badge/commitizen-friendly-brightgreen.svg" alt="Commitizen friendly"/></a>

`vue-async-manager` can help you manage asynchronous calls more easily in `Vue` applications, including:

- Load asynchronous components
- Fetch data from the API

If you are familiar with `React Suspense`, then `vue-async-manager` provides an `<Suspense>` component with the same name to do the same thing, and does an extra functional design for this.

In addition, `vue-async-manager` also provides a **resource manager** to help you manage asynchronous API requests more easily.

Next you can check out the [Guide](/guide.html) to get started quickly, or check out [API](/api.html). At the same time, we provide a number of [Live Demos](/zh/demo.html) to help you understand `vue-async-manager`.

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

[Click to view more live demos](/demo.html)