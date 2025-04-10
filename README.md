# Mini Vue-like Framework

A lightweight, custom JavaScript framework inspired by Vue.js for building reactive, component-based applications. It offers a simple approach to state management, event handling, and lifecycle hooks within your UI components.

## Features

- **Declarative Rendering**: Define your UI using HTML-like templates.
- **Reactivity**: The UI automatically updates whenever the state changes, supporting ref, reactive, and computed properties.
- **Event Handling**: Bind event listeners (like `click`) directly to state methods using `data-on` attributes.
- **Lifecycle Hooks**: Support for `created`, `beforeDestroy`, and `destroy` lifecycle methods.
- **Virtual DOM**: Efficient rendering through a diffing algorithm to minimize reflows and repaint.

## Installation

This is not a package but rather a simple, minimalistic framework. To get started, just include the files in your project.

1. **Download** the framework files.
2. **Import** the framework into your project.

## How to Use

This framework allows you to build reactive UI components with ease. Here's an example of how to get started:

### Example

```js
import { createAppVue, parseTemplate } from './miniVue';
import { ref } from './reactivity.js';

const app = createAppVue({
  template(state) {
    let temp = `<div>
      <button data-onclick="state.incrementCount">Increment</button>
      <p>Count: ${state.count.value}</p>
    </div>`

    return parseTemplate(temp, state)
  } ,
  setup() {
    const count = ref(0)

    const incrementCount = () => {
      count.value += 1;
    }

    return { count, incrementCount }
  },
  created(state) {
    console.log("App has been created", state);
  },
  beforeDestroy(state) {
    console.log("App is about to be destroyed", state);
  },
  destroy(state) {
    console.log("App has been destroyed", state);
  }
});

app.mount('#app');
```

## Lifecycle Hooks

- **created**: Runs once the app is created.
- **beforeDestroy**: Runs right before the app is destroyed.
- **destroy**: Runs when the app is destroyed.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.