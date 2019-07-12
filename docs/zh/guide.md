# 指南

> 在 Vue 应用中更轻松的管理异步调用

## 异步调用指的是什么？

这里所说的异步调用，主要指的是两件事儿：

- 异步组件(`Async Component`)的加载
- 发送异步请求从 API 中获取数据

## 等待异步组件的加载

实际上 `Vue` 的异步组件已经支持在加载过程中展示 `loading` 组件的功能，如下代码取自官网：

```js
new Vue({
  // ...
  components: {
    'my-component': () => ({
        // 异步组件
        component: import('./my-async-component'),
        // 加载异步组件过程中展示的 loading 组件
        loading: LoadingComponent,
        // loading 组件展示的延迟时间
        delay: 200
    })
  }
})
```

:::tip
`delay` 用于指定 `loading` 组件展示的延迟时间，如上代码中延迟时间为 `200ms`，如果异步组件的加载在 `200ms` 之内完成，则 `loading` 组件就没有展示的机会。
:::

但它存在两个问题：

- 1、`loading` 组件与异步组件紧密关联，无法将 `loading` 组件提升，并用于多个异步组件的加载。
- 2、如果异步组件自身仍有异步调用，例如请求 API，那么 `loading` 组件是不会等待 API 请求完成之后才隐藏的。

`vue-async-manager` 提供了 `<Suspense>` 组件，可以解决如上两个问题。

### 1、使用 lazy 函数创建异步组件

过去我们创建一个异步组件的方式是：

```js
const asyncComponent = () => import('./my-async.component.vue')
```

现在我们使用 `vue-async-manager` 提供的 `lazy` 函数来创建异步组件：

```js
import { lazy } from 'vue-async-manager'
 
const asyncComponent = lazy(() => import('./my-async.component.vue'))
```

如上代码所示，仅仅是将原来的异步工厂函数作为参数传递给 `lazy` 函数即可。

### 2、使用 `<Suspense>` 组件包裹异步组件

```html
<template>
  <div id="app">
    <!-- 使用 Suspense 组件包裹可能出现异步组件的组件树 -->
    <Suspense>
      <!-- 展示 loading -->
      <div slot="fallback">loading</div>
      <!-- 异步组件 -->
      <asyncComponent1/>
      <asyncComponent2/>
    </Suspense>
  </div>
</template>

<script>
// 创建异步组件
const asyncComponent1 = lazy(() => import('./my-async.component1.vue'))
const asyncComponent2 = lazy(() => import('./my-async.component2.vue'))
 
export default {
  name: 'App',
  components: {
    // 注册组件
    asyncComponent1,
    asyncComponent2
  }
}
</script>
```

只有当 `<asyncComponent1/>` 和 `<asyncComponent2/>` 全部加载完毕后，`loading` 组件才会消失。

:::tip
Live Demo: [等待所有异步组件加载完毕](/zh/demo.html#等待所有异步组件加载完毕)
:::

## 配合 vue-router 使用

我们在开发 `Vue` 应用时，最常使用异步组件的方式是配合 `vue-router` 做代码拆分，例如：

```js
const router = new VueRouter({
  routes: [
    {
      path: '/',
      component: () => import('./my-async-component.vue')
    }
  ]
})
```

为了让 `<Suspense>` 组件等待这个异步组件的加载，我们可以使用 `lazy` 函数包裹这个异步组件工厂函数：

```js {5}
const router = new VueRouter({
  routes: [
    {
      path: '/',
      component: lazy(() => import('./my-async-component.vue'))
    }
  ]
})
```

最后我们只需要用 `<Suspense>` 组件包裹渲染出口(`<router-view>`)即可：

```html
<Suspense :delay="200">
  <div slot="fallback">loading</div>
  <!-- 渲染出口 -->
  <router-view/>
</Suspense>
```

:::tip
Live Demo: [配合 vue-router](/zh/demo.html#配合-vue-router)
:::

## API请求中如何展示 loading

过去，大多是手动维护 `loading` 的展示，例如“开始请求”时展示 `loading`，“请求结束”后隐藏 `loading`。而且如果有多个请求并发时，你就得等待所有请求全部完成后再隐藏 `loading`。总之你需要自己维护 `loading` 的状态，无论这个状态是存储在组件内，还是 `store` 中。

现在来看看 `vue-async-manager` 是如何解决 API 请求过程中 `loading` 展示问题的，假设有如下代码：

```html
<Suspense>
  <div slot="fallback">loading...</div>
  <MyComponent/>
</Suspense>
```

在 `<Suspense>` 组件内渲染了 `<MyComponent>` 组件，该组件是一个普普通通的组件，在该组件内部，会发送 API 请求，如下代码所示：

```html
<!-- MyComponent.vue -->
<template>
  <!-- 展示请求回来的数据 -->
  <div>{{ res }}</div>
</template>
 
<script>
import { getAsyncData } from 'api'
 
export default {
  data: {
    res: {}
  },
  async created() {
    // 异步请求数据
    this.res = await getAsyncData(id)
  }
}
</script>
```

这是我们常见的代码，通常在 `created` 或者 `mounted` 钩子中发送异步请求获取数据，然而这样的代码对于 `<Suspense>` 组件来说，它并不知道需要等待异步数据获取完成后再隐藏 `loading`。为了解决这个问题，我们可以使用 `vue-async-manager` 提供的 `createResource` 函数创建一个**资源管理器**：

```html
<template>
  <!-- 展示请求回来的数据 -->
  <div>{{ $rm.$result }}</div>
</template>
 
<script>
import { getAsyncData } from 'api'
import { createResource } from 'vue-async-manager'
 
export default {
  created() {
    // 创建一个资源管理器
    this.$rm = createResource((params) => getAsyncData(params))
    // 读取数据
    this.$rm.read(params)
  }
}
</script>
```

为 `createResource` 函数传递一个工厂函数，我们创建了一个**资源管理器** `$rm`，接着调用资源管理器的 `$rm.read()` 函数进行读取数据。大家注意，上面的代码是以同步的方式来编写的，并且 `<Suspense>` 组件能够知道该组件正在进行异步调用，因此 `<Suspense>` 组件将等待该异步调用结束之后再隐藏 `loading`。

另外我们观察如上代码中的模板部分，我们展示的数据是 `$rm.$result`，实际上异步数据获取成功之后，得到的数据会保存在**资源管理器**的 `$rm.$result` 属性上，需要注意的是，该属性本身就是响应式的，因此你无需在组件的 `data` 中事先声明。

****

:::tip
Live Demo: [Suspense 组件等待资源管理器获取数据完成](/zh/demo.html#suspense-组件等待资源管理器获取数据完成)
:::

## 配合 vuex

配合 `vuex` 很简单，只需要使用 `mapActions` 将 `actions` 映射为方法即可：

```js {4, 7}
export default {
  name: "AsyncComponent",
  methods: {
    ...mapActions(['increase'])
  },
  created() {
    this.$rm = createResource(() => this.increase())
    this.$rm.read()
  }
};
```

:::tip
Live Demo: [配合 vuex](/zh/demo.html#配合-vuex)
:::

## 捕获组件树中的所有异步调用

`<Suspense>` 组件不仅能捕获异步组件的加载，如果该异步组件自身还有其他的异步调用，例如通过**资源管理器**获取数据，那么 `<Suspense>` 组件也能够捕获到这些异步调用，并等待所有异步调用结束之后才隐藏 `loading` 状态。

我们来看一个例子：

```html
<Suspense>
  <div slot="fallback">loading</div>
  <!-- MyLazyComponent 是通过 lazy 函数创建的组件 -->
  <MyLazyComopnent/>
</Suspense>
```

在这段代码中，`<MyLazyComopnent/>` 组件是一个通过 `lazy` 函数创建的组件，因此 `<Suspense>` 组件可以等待该异步组件的加载，然而异步组件自身又通过**资源管理器**获取数据：

```js
// 异步组件
export default {
  created() {
    // 创建一个资源管理器
    this.$rm = createResource((params) => getAsyncData(params))
    this.$rm.read(params)
  }
}
```

这时候，`<Suspense>` 组件会等待两个异步调用全部结束之后才隐藏 `loading`，这两个异步调用分别是：

- 1、异步组件的加载
- 2、异步组件内部通过**资源管理器**发出的异步请求

:::tip
这个 Demo 也展示了如上描述的功能：

Live Demo: [Suspense 组件等待资源管理器获取数据完成](/zh/demo.html#suspense-组件等待资源管理器获取数据完成)
:::

## 资源管理器

前面我们一直在强调一个词：**资源管理器**，我们把通过 `createResource()` 函数创建的对象称为**资源管理器(`Resource Manager`)**，因此我们约定使用名称 `$rm` 来存储 `createResource()` 函数的返回值。

资源管理器的完整形态如下：

```js {4-8}
this.$rm = createResource(() => getAsyncData())

this.$rm = {
    read(){},   // 一个函数，调用该函数会真正发送异步请求获取数据
    $result,    // 初始值为 null，异步数据请求成功后，保存着取得的数据
    $error,     // 初始值为 null，当异步请求出错时，其保存着 err 数据
    $loading,   // 一个boolean值，初始值为 false，代表着是否正在请求中
    fork()      // 根据已有资源管理器 fork 一个新的资源管理器
}
```

其中 `$rm.read()` 函数用来发送异步请求获取数据，可多次调用，例如点击按钮再次调用其获取数据。`$rm.$result` 我们也已经见过了，用来存储异步获取来的数据。`$rm.$loading` 是一个布尔值，代表着请求是否正在进行中，通常我们可以像如下这样自定义 `loading` 展示：

```html
<template>
  <!-- 控制 loading 的展示 -->
  <MyButton :loading="$rm.$loading" @click="submit" >提交</MyButton>
</template>
 
<script>
import { getAsyncData } from 'api'
import { createResource } from 'vue-async-manager'
 
export default {
  created() {
    // 创建一个资源管理器
    this.$rm = createResource((id) => getAsyncData(id))
  },
  methods: {
    submit() {
      this.$rm.read(id)
    }
  }
}
</script>
```

:::tip
更重要的一点是：**资源管理器可以脱离 `<Suspense>` 单独使用。**
:::

如果资源管理器在请求数据的过程中发生了错误，则错误数据会保存在 `$rm.$error` 属性中。`$rm.fork()` 函数用来根据已有**资源管理器**创建一个一模一样的资源管理器出来。

## fork 一个资源管理器

当一个 API 用来获取数据，并且我们需要并发的获取两次数据，那么只需要调用两次 `$rm.read()` 即可：

```html {11-12}
<script>
import { getAsyncData } from 'api'
import { createResource } from 'vue-async-manager'
 
export default {
  created() {
    // 创建一个资源管理器
    this.$rm = createResource((type) => getAsyncData(type))
     
    // 连续获取两次数据
    this.$rm.read('top')
    this.$rm.read('bottom')
  }
}
</script>
```

但是这么做会产生一个问题，由于一个**资源管理器**对应一个 `$rm.$result`，它只维护一份请求回来的数据以及 `loading` 状态，因此如上代码中，`$rm.$result` 最终只会保存 `$rm.read('bottom')` 的数据。当然了，有时候这是符合需求的，但如果需要保存两次调用的数据，那么就需要 `fork` 出一个新的资源管理器：

```html {9}
<script>
import { getAsyncData } from 'api'
import { createResource } from 'vue-async-manager'
 
export default {
  created() {
    // 创建一个资源管理器
    this.$rm = createResource((type) => getAsyncData(type))
    this.$rm2 = this.$rm.fork()
     
    // 连续获取两次数据
    this.$rm.read('top')
    this.$rm2.read('bottom')
  }
}
</script>
```

这样，由于 `$rm` 与 `$rm2` 是两个独立的资源管理器，因此它们互不影响。

## prevent 选项与防止重复提交

假设我们正在提交表单，如果用户连续两次点击按钮，就会造成重复提交，如下例子：

```html {13}
<template>
  <button @click="submit">提交</button>
</template>
<script>
import { getAsyncData } from 'api'
import { createResource } from 'vue-async-manager'
 
export default {
  created() {
    // 创建一个资源管理器
    this.$rm = createResource((type) => getAsyncData(type))
  },
  methods: {
    submit() {
      this.$rm.read(data)
    }
  }
}
</script>
```

实际上，我们可以在创建资源管理器的时候提供 `prevent` 选项，这样创建出来的资源管理器将自动为我们防止重复提交：

```html {11}
<template>
  <button @click="submit">提交</button>
</template>
<script>
import { getAsyncData } from 'api'
import { createResource } from 'vue-async-manager'
 
export default {
  created() {
    // 创建一个资源管理器
    this.$rm = createResource((type) => getAsyncData(type), { prevent: true })
  },
  methods: {
    submit() {
      this.$rm.read(data)
    }
  }
}
</script>
```

当第一次点击按钮时会发送一个请求，在这个请求完成之前，将不会再次发送下一次请求。直到上一次请求完成之后，`$rm.read()` 函数才会再次发送请求。

## loading 的展示形态

`loading` 的展示形态可以分为两种：一种是只展示 `loading`，不展示其他内容；另一种是正常渲染其他内容的同时展示 `loading`，比如页面顶部有一个长长的加载条，这个加载条不影响其他内容的正常渲染。

因此 `vue-async-manager` 提供了两种渲染模式：

```js
import VueAsyncManager from 'vue-async-manager'
Vue.use(VueAsyncManager, {
  mode: 'visible' // 指定渲染模式，可选值为 'visible' | 'hidden'，默认值为：'visible'
})
```

默认情况下采用 `'visible'` 的渲染模式，意味着 `loading` 的展示可以与其他内容共存，如果你不想要这种渲染模式，你可以指定 `mode` 为 `'hidden'`。

另外以上介绍的内容都是由 `<Suspense>` 组件来控制 `loading` 的展示，并且 `loading` 的内容由 `<Suspense>` 组件的 `fallback` 插槽决定。但有的时候我们希望更加灵活，我们经常遇到这样的场景：点击按钮的同时在按钮上展示一个微小的 `loading` 状态，我们的代码看上去可能是这样的：

```html
<MyButton :loading="isLoading" >提交</MyButton>
```

`loading` 的形态由 `<MyButton>` 组件提供，换句话说，我们抛弃了 `<Suspense>` 的 `fallback` 插槽作为 `loading` 来展示。因此，我们需要一个手段来得知当前是否处于正在加载的状态，在上面我们已经介绍了该问题的解决办法，我们可以使用资源管理器的 `$rm.$loading` 属性：

```html
<MyButton :loading="$rm.$loading" >提交</MyButton>
```

## 错误处理

当 `lazy` 组件加载失败会展示 `<Suspense>` 组件的 `error` 插槽，你也可以通过监听 `<Suspense>` 的 `rejected` 事件来自定义错误处理。

:::tip
Live Demo: [加载失败展示 error 插槽](/zh/demo.html#加载失败展示-error-插槽)
:::

当错误发生时除了展示 `error` 插槽，你还可以通过监听 `<Suspense>` 组件的 `rejected` 事件来自定义处理：

```html
<template>
  <Suspense :delay="200" @rejected="handleError">
    <p class="fallback" slot="fallback">loading</p>
    <AsyncComponent/>
  </Suspense>
</template>
<script>
export default {
  // ......
  methods: {
    handleError() {
      // Custom behavior
    }
  }
};
</script>
```

:::tip
Live Demo: [通过事件处理 error](/zh/demo.html#通过事件处理-error)
:::

## 关于 LRU 缓存

`React Cache` 使用 `LRU` 算法缓存资源，这要求 API 具有幂等性，然而在我的工作环境中，在给定时间周期内真正幂等的 API 很少，因此暂时没有提供对缓存资源的能力。