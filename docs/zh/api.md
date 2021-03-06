# API

## 插件选项

### mode

指定渲染模式，可选值为 `'visible'` 和 `'hidden'`。

- Type: `string`
- Default: `'visible'`

例：

```js
import VueAsyncManager from 'vue-async-manager'

Vue.use(VueAsyncManager, {
  mode: 'hidden'
})
```

## `<Suspense>` 组件

### Props

| Name         | Description   | Type         | Default  |
| ------------ | ------------- | ------------ | ------------- |
| delay | `fallback` 内容的延迟展示的毫秒数 | `Number` | `0` |

### Slots

| Name         | Description   |
| ------------ | ------------- |
| fallback | 当异步调用为完成之前要展示的内容 |
| error | 当异步调用发生错误时展示的内容 |
| default | 真正要渲染的内容 |

### Events

| Name         | Description   |
| ------------ | ------------- |
| resolved | 当所有异步调用成功后触发 |
| rejected | 当某个异步调用发生错误时触发 |

### Suspense 组件的容器元素

`Vue2` 的有状态组件中不能有多个根元素，为了降低复杂度，内部使用一个 `div` 作为容器包裹层，假设我们有如下代码：

```html
<Suspense>
  <p slot="loading">loading</p>
  <p>Content</p>
</Suspense>
```

如果是在 `visible` 模式下，渲染出来的内容为：

```html
<div class="vue-suspense-wrapper">
  <p>loading</p>
  <p>Content</p>
</div>
```

如果是在 `hidden` 模式下，渲染出来的内容为：

```html

<div class="vue-suspense-wrapper">
  <p>loading</p>
  <div class="vue-suspense-hidden-wrapper" style="display: none;">
    <p>Content</p>
  </div>
</div>
```

可以通过为 `<Suspense>` 组件提供 `class` prop，从而为根元素添加额外的 `class`：

```html
<Suspense class="custom-class">
  <p slot="loading">loading</p>
  <p>Content</p>
</Suspense>
```

渲染的内容为：

```html {1}
<div class="custom-class vue-suspense-wrapper">
  <p>loading</p>
  <p>Content</p>
</div>
```

这是 `vue2` 的行为。

## Vue.setSuspenseOptions(options)

设置 Suspense 插件选项，例如：

```js
Vue.setSuspenseOptions({ mode: 'hidden' })
```