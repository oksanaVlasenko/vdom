import createElement from "./createElement";
import { effect } from "./reactivity";
import render from './render';
import mount from './mount';
import diff from './diff';

function renderVNode(node) {
  if (typeof node === 'string') {
    return node;
  }

  return createElement(node.tag, {
    attrs: node.attributes,
    handlers: node.handlers,
    children: (node.children || []).map(renderVNode)
  });
}

function createVDOMFromTemplate(state, template, selector) {
  const vDom = template(state);
  
  return createElement(vDom.parentTag, {
    attrs: {
      ...vDom.attrs,
      id: selector.replace(/[^a-zA-Z]/g, '')
    },
    children: (vDom.el || []).map(renderVNode)
  });
}

export function createAppVue({ template, setup, created, beforeDestroy, destroy }) {
  return {
    mount(selector) {
      const container = document.querySelector(selector)
      const state = setup()
      
      let vApp = createVDOMFromTemplate(state, template, selector)

      const $app = render(vApp);
      let $rootEl = mount($app, container);

      if (created) {
        created(state);
      }      

      if (beforeDestroy) {
        window.addEventListener("beforeunload", () => {
          beforeDestroy(state);
        });
      }

      effect(() => {
        const vNewApp = createVDOMFromTemplate(state, template, selector)

        const patch = diff(vApp, vNewApp);
        $rootEl = patch($rootEl); 

        vApp = vNewApp;
      })

      if (destroy) {
        window.addEventListener("unload", () => {
          destroy(state);
        });
      }
    }
  }
}