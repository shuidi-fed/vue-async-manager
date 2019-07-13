# Guide

> Manage asynchronous calls more easily in Vue apps

## What does an asynchronous call mean?

The asynchronous call mentioned here mainly refers to two things:

- Async component loading
- Send an async request to fetch data from the API

## Waiting for the loading of async components

In fact, in `Vue` the async component already supports displaying the `loading` component during the loading process. The following code is taken from the official website:

```js
new Vue({
  // ...
  components: {
    'my-component': () => ({
        // async component
        component: import('./my-async-component'),
        // loading component
        loading: LoadingComponent,
        // delay
        delay: 200
    })
  }
})
```

:::tip
`delay` is used to specify the delay time for displaying the `loading` component. The delay time in the above code is `200ms`. If the loading of the asynchronous component is completed within `200ms`, the `loading` component has no chance to be displayed.
:::

But it has two problems:

- 1、The `loading` component is closely tied to the async component, and the `loading` component cannot be promoted to a higher level and used for loading multiple asynchronous components.
- 2、If the async component itself still has asynchronous calls, such as the request API, the hiding of the `loading` component will not wait for the API request to complete.

`vue-async-manager` provides the `<Suspense>` component to solve the above two problems.

### 1、Create an async component using the `lazy` function

In the past, the way we created an async component was：

```js
const asyncComponent = () => import('./my-async.component.vue')
```

Now we use the `lazy` function provided by `vue-async-manager` to create the async component:

```js
import { lazy } from 'vue-async-manager'
 
const asyncComponent = lazy(() => import('./my-async.component.vue'))
```

As shown in the code above, just pass the original asynchronous factory function as a parameter to the `lazy` function.

### 2、Wrap async components with the `<Suspense>` component

```html
<template>
  <div id="app">
    <!-- Use the Suspense component to wrap a component tree that may have async components -->
    <Suspense>
      <!-- Loading slot -->
      <div slot="fallback">loading</div>
      <!-- Async component -->
      <asyncComponent1/>
      <asyncComponent2/>
    </Suspense>
  </div>
</template>

<script>
// Create async components
const asyncComponent1 = lazy(() => import('./my-async.component1.vue'))
const asyncComponent2 = lazy(() => import('./my-async.component2.vue'))
 
export default {
  name: 'App',
  components: {
    // Registration component
    asyncComponent1,
    asyncComponent2
  }
}
</script>
```

The `loading` component will only disappear after both `<asyncComponent1/>` and `<asyncComponent2/>` have been loaded.

:::tip
Live Demo: [Waiting for all async components to load](/demo.html#waiting-for-all-async-components-to-load)
:::

## Use with vue-router

When we develop the `Vue` application, the most common way to use asynchronous components is to do code splitting with `vue-router`, for example:

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

In order for the `<Suspense>` component to wait for the loading of this async component, we can wrap this async component factory function with the `lazy` function:

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

Finally, we only need to wrap the `<router-view>` component with the `<Suspense>` component:

```html
<Suspense :delay="200">
  <div slot="fallback">loading</div>
  <router-view/>
</Suspense>
```

:::tip
Live Demo: [With vue-router](/demo.html#use-with-vue-router)
:::

## How to display loading in the API request

In the past, we usually manually maintained whether to show `loading`, for example, when the "request to start", the `loading` was displayed. Hide the `loading` when "end of request". And if there are multiple requests for concurrency, you have to wait for all requests to complete before hiding `loading`. In short, you need to maintain the state of `loading` yourself, whether it is stored in the component or in `store`.

Now let's see how `vue-async-manager` solves the `loading` display problem in the API request process, assuming the following code:

```html
<Suspense>
  <div slot="fallback">loading...</div>
  <MyComponent/>
</Suspense>
```

The `<MyComponent>` component is rendered inside the `<Suspense>` component, which is a normal component. Inside the  `<Suspense>` component, an API request is sent, as shown in the following code:

```html
<!-- MyComponent.vue -->
<template>
  <!-- Display data -->
  <div>{{ res }}</div>
</template>
 
<script>
import { getAsyncData } from 'api'
 
export default {
  data: {
    res: {}
  },
  async created() {
    // Fetch data
    this.res = await getAsyncData(id)
  }
}
</script>
```

This is the code we often see, usually we send async requests in the `created` or `mounted` hooks. However, for the `<Suspense>` component, it does not know that it needs to wait for the async requests to complete before hiding the `loading`. To solve this problem, we can create a **resource manager** using the `createResource` function provided by `vue-async-manager`:

```html
<template>
  <!-- Display data -->
  <div>{{ $rm.$result }}</div>
</template>
 
<script>
import { getAsyncData } from 'api'
import { createResource } from 'vue-async-manager'
 
export default {
  created() {
    // Create a resource manager(rm)
    this.$rm = createResource((params) => getAsyncData(params))
    // Read data
    this.$rm.read(params)
  }
}
</script>
```

Pass a factory function to the `createResource` function, we create a **resource manager**: `$rm`, and then call the resource manager's `$rm.read()` function to read the data. Note that the above code is written in a synchronous manner, and the `<Suspense>` component knows that the component is making an async call, so the `<Suspense>` component will wait for the async call to complete before hiding `loading` .

In addition, we see the template part of the above code, the data we show is `$rm.$result`, in fact, after the async data is successfully acquired, the obtained data will be saved in the `$rm.$result` property, it's important to note that the property itself is reactive, so you don't need to declare it in the `data` option of the component.

****

:::tip
Live Demo: [Suspense component waits for resource manager to fetch data](/demo.html#suspense-waits-for-rm-to-fetch-data)
:::

## Use with vuex

With `vuex` it's very simple, just use `mapActions` to map `actions` to methods:

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
Live Demo: [Use with vuex](/demo.html#use-with-vuex)
:::

## Capture all async calls in the component tree

The `<Suspense>` component not only captures the loading of async components. If an async component itself has other async calls, such as reading data through the **Resource Manager**, the `<Suspense>` component can also capture these async calls and wait for all async calls to end before hiding `loading` .

Let's look at an example：

```html
<Suspense>
  <div slot="fallback">loading</div>
  <!-- MyLazyComponent is a component created by the lazy function -->
  <MyLazyComopnent/>
</Suspense>
```

The `<MyLazyComopnent/>` component is a component created by the `lazy` function, so the `<Suspense>` component can wait for the async component to load, whereas the async component itself reads the data through the **resource manager**:

```js
// Async component
export default {
  created() {
    // Read data through the resource manager
    this.$rm = createResource((params) => getAsyncData(params))
    this.$rm.read(params)
  }
}
```

At this point, the `<Suspense>` component will wait for the completion of both asynchronous calls before hiding `loading`, which are:

- 1、Async component loading
- 2、Async requests sent by **Resource Manager** within the async component

:::tip
Live Demo: [Suspense component waits for resource manager to fetch data](/demo.html#suspense-waits-for-rm-to-fetch-data)
:::

## Resource manager

We have been emphasizing a word: **Resource Manager**，the return value of the `createResource` function is a resource manager, which is an object, we usually use `$rm` to name.

The complete form of the resource manager is as follows:

```js {4-8}
this.$rm = createResource(() => getAsyncData())

this.$rm = {
    read(){},   // A function that calls this function to actually send an async request to fetch data
    $result,    // The initial value is null. After the async data is successfully acquired, the obtained data is stored.
    $error,     // The initial value is null, which holds the err data when the async request fails.
    $loading,   // A boolean value with an initial value of false, indicating whether the request is in progress
    fork()      // Create a new resource manager based on an existing resource manager
}
```

The `$rm.read()` function is used to send async requests to fetch data, which can be called multiple times, such as clicking the button to call it again. `$rm.$result` we have also seen it, which is used to store data obtained asynchronously. `$rm.$loading` is a Boolean value that indicates whether the request is in progress. Usually we can customize the `loading` display like this:

```html
<template>
  <!-- Control loading display -->
  <MyButton :loading="$rm.$loading" @click="submit" >提交</MyButton>
</template>
 
<script>
import { getAsyncData } from 'api'
import { createResource } from 'vue-async-manager'
 
export default {
  created() {
    // Create a resource manager
    this.$rm = createResource((params) => getAsyncData(params))
  },
  methods: {
    submit() {
      this.$rm.read(params)
    }
  }
}
</script>
```

:::tip
More importantly: **the `createResource()` can be used separately from `<Suspense>`.**
:::

If the resource manager has encountered an error while fetching data, the error data is stored in the `$rm.$error` property. The `$rm.fork()` function is used to create an identical resource manager based on the existing **resource manager**.

## Fork a resource manager

When an API is used to fetch data, and we need to fetch data twice, we only need to call `$rm.read()` twice:

```html {11-12}
<script>
import { getAsyncData } from 'api'
import { createResource } from 'vue-async-manager'
 
export default {
  created() {
    // Create a resource manager
    this.$rm = createResource((type) => getAsyncData(type))
     
    // Continuous fetch data twice
    this.$rm.read('top')
    this.$rm.read('bottom')
  }
}
</script>
```

But doing so will create a problem, since one **resource manager** is associated with only one `$rm.$result`, so in the above code, `$rm.$result` will only save the data of `$rm.read('bottom')`. Of course, sometimes this is expected, but if you need to store the data twice called, you need `fork` to create a new resource manager:

```html {9}
<script>
import { getAsyncData } from 'api'
import { createResource } from 'vue-async-manager'
 
export default {
  created() {
    // Create a resource manager
    this.$rm = createResource((type) => getAsyncData(type))
    // Fork a new resource manager based on the existing resource manager
    this.$rm2 = this.$rm.fork()
    
    // The data read twice will be stored separately
    this.$rm.read('top')
    this.$rm2.read('bottom')
  }
}
</script>
```

Thus, since `$rm` and `$rm2` are two separate resource managers, they do not affect each other.

## `prevent` option & duplicate submissions

Suppose we are submitting a form. If the user clicks the button twice, it will cause duplicate submissions, as in the following example:

```html {13}
<template>
  <button @click="submit">Submit</button>
</template>
<script>
import { getAsyncData } from 'api'
import { createResource } from 'vue-async-manager'
 
export default {
  created() {
    // Create a resource manager
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

In fact, we can provide the `prevent` option when creating the resource manager, so the created resource manager will automatically prevent duplicate submissions for us:

```html {11}
<template>
  <button @click="submit">Submit</button>
</template>
<script>
import { getAsyncData } from 'api'
import { createResource } from 'vue-async-manager'
 
export default {
  created() {
    // Create a resource manager with the prevent option
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

When a button is clicked for the first time, a request is sent and all new requests that occur before the request is completed are ignored.

## loading style

The style of `loading` can be divided into two types: one is to display only `loading` and not to display other content; the other is to display `loading` while rendering other content normally, such as a long loading bar at the top of the page. This load bar does not affect the normal rendering of other content.

So `vue-async-manager` provides two rendering modes:

```js
import VueAsyncManager from 'vue-async-manager'
Vue.use(VueAsyncManager, {
  // Specify the rendering mode, the optional value is 'visible' | 'hidden', the default value is: 'visible'
  mode: 'visible'
})
```

The rendering mode of `'visible'` is used by default. This means that `loading` can coexist with other content. If you don't want this rendering mode, you can specify `mode` to `'hidden'`.

So far, we have only seen the use of `<Suspense>` components to control the display of `loading`, and the contents of `loading` are determined by the `fallback` slot of the `<Suspense>` component. But sometimes we want to be more flexible, we often encounter such a scenario: when you click the button and display a tiny `loading` icon on the button, our code might look like this:

```html
<MyButton :loading="isLoading" >Submit</MyButton>
```

The style of `loading` is provided by the `<MyButton>` component，in other words, we abandoned the `fallback` slot of `<Suspense>` as `loading` to show. Therefore, we need to know if it is currently loading. We have already introduced the solution to this problem, we can use the resource manager's `$rm.$loading` property:

```html
<MyButton :loading="$rm.$loading" >Submit</MyButton>
```

## Error handling

When the `lazy` component fails to load, the `error` slot of the `<Suspense>` component is displayed. You can also customize the error handling by listening to the `rejected` event of `<Suspense>`.

:::tip
Live Demo: [Load failed to show error slot](/demo.html#load-failed-to-show-error-slot)
:::

In addition to displaying the `error` slot when an error occurs, you can also customize the processing by listening to the `rejected` event of the `<Suspense>` component:

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
Live Demo: [Through event processing error](/demo.html#through-event-processing-error)
:::

## About LRU Cache

`React Cache` uses the `LRU` algorithm to cache resources, which requires the API to be idempotent. However, in my working environment, there are very few APIs that are really idempotent in a given time period, so there is no provision for caching resources ability.
