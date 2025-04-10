import createElement from "./createElement";
import { effect } from "./reactivity";
import render from './render';
import mount from './mount';
import diff from './diff';

export function parseTemplate(template, state) {
  let parentTag = ''
  let childrenEl = []

  const tagRegex = /^\s*<\/?(\w+)/
  const selfRegex = /<(\w+)([^>]*?)\s*\/?>/
  const innerTagRegex = /<[^>]*>/g
  const attrsRegex = /\s*([^\s=]+)=(["'])(.*?)\2/g

  let arrayOfStr = template.split('\n ').filter(str => str.trim())

  arrayOfStr.forEach(str => {
    let result = str.replace(innerTagRegex, '').trim(); 
    let tag = str.match(tagRegex)
    let selfTag = str.match(selfRegex)
    let match;
    const attributes = {};
    const handlers = {}

    while ((match = attrsRegex.exec(str)) !== null) {
      const attr = match[1]
      let value = match[3]

      if (attr.startsWith('data-on')) {
        const methodMatch = value.match(/^state\.(\w+)$/);

        if (methodMatch) {
          const handlerName = methodMatch[1];
    
          if (typeof state[handlerName] === 'function') {
            value = state[handlerName];
            handlers[attr] = value; 
          } else {
            console.warn(`Method ${handlerName} not found in state.`);
          }
        } else {
          console.warn(`Invalid method format for attribute ${attr}: ${value}`);
        }
      } else {
        attributes[attr] = value
      }
    }

    const isSelfClosing = selfTag ? selfTag[2].includes('/') || str.includes('/>') : false;

    if (result && tag[1] || isSelfClosing) {
      childrenEl.push({
        tag: tag[1],  
        content: result,
        attributes,
        handlers  
      });
    } else {
      parentTag = tag[1]
    }
  });

  const result = {
    parentTag,
    el: childrenEl
  }

  return result
}

function createVDOMFromTemplate(state, template, selector) {
  const vDom = template(state);
  
  return createElement(vDom.parentTag, {
    attrs: {
      id: selector.replace(/[^a-zA-Z]/g, '')
    },
    children: vDom.el.map(child => createElement(child.tag, {
      children: [child.content],
      attrs: child.attributes,
      handlers: child.handlers
    }))
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