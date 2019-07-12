# API

## Plugin options

### mode

Specify the rendering mode, the optional values are `'visible'` and `'hidden'`.

- Type: `string`
- Default: `'visible'`

example:

```js
import VueAsyncManager from 'vue-async-manager'

Vue.use(VueAsyncManager, {
  mode: 'hidden'
})
```

## `<Suspense>` component

### Props

| Name         | Description   | Type         | Default  |
| ------------ | ------------- | ------------ | ------------- |
| delay | The number of milliseconds of delayed display of `fallback` content | `Number` | `0` |

### Slots

| Name         | Description   |
| ------------ | ------------- |
| fallback | What to show in the loading |
| error | What will be shown when an error occurs in an async call |
| default | What you really want to render |

### Events

| Name         | Description   |
| ------------ | ------------- |
| resolved | Triggered when all async calls succeed |
| rejected | Triggered when an async call has an error |

### Container element of the Suspense component

There can be at most one root element in a stateful component. To reduce the complexity, we internally use a `div` as the container wrapper, assuming we have the following code:

```html
<Suspense>
  <p slot="loading">loading</p>
  <p>Content</p>
</Suspense>
```

If it is in the `visible` mode, the rendered content is:

```html
<div class="vue-suspense-wrapper">
  <p>loading</p>
  <p>Content</p>
</div>
```

If it is in `hidden` mode, the rendered content is:

```html

<div class="vue-suspense-wrapper">
  <p>loading</p>
  <div class="vue-suspense-hidden-wrapper" style="display: none;">
    <p>Content</p>
  </div>
</div>
```

You can add extra `class` to the root element by supplying `class` prop for the `<Suspense>` component:

```html
<Suspense class="custom-class">
  <p slot="loading">loading</p>
  <p>Content</p>
</Suspense>
```

The rendered content is:

```html {1}
<div class="custom-class vue-suspense-wrapper">
  <p>loading</p>
  <p>Content</p>
</div>
```

This is the behavior of `vue2`.

## Vue.setSuspenseOptions(options)

Set the Suspense plugin options, for example:

```js
Vue.setSuspenseOptions({ mode: 'hidden' })
```