import createElement from './vdom/createElement';
import render from './vdom/render';
import mount from './vdom/mount';
import diff from './vdom/diff';
import createState from './vdom/createState'
import { ref, computed, reactive, watch, created } from './vdom/reactivity.js';
import { createAppVue, parseTemplate, parseBtn } from './vdom/miniVue.js';
import { eventManager } from './vdom/eventListeners.js'

// const initialState = {
//   anotherCount: '4',
//   name: 'Oksans',
//   surname: 'Vlasenko'
// }

// const proxyHandler = () => {
//   const vNewApp = createVApp(5);
//   const patch = diff(vApp, vNewApp);

//   // we might replace the whole $rootEl,
//   // so we want the patch will return the new $rootEl
//   $rootEl = patch($rootEl);

//   vApp = vNewApp;
// }

// const state = createState(initialState, proxyHandler)

// console.log(state, ' state')

// function listOfState() {
//   console.log(state, ' state IN LIST')
//   const list = [];

//   for (const s of Object.values(state)) {
//     console.log(s, ' SSSS')
//     list.push(createElement('li', {
//       children: [s]
//     }))
//   }

//   return list; 
// }



// function createVApp(count) {
//   return createElement('div', {
//     attrs: {
//       id: 'app',
//       dataCount: count, // we use the count here,
//     },
//     children: [
//       'The current count is: ',
//       String(count), // and here
//       'Proxy: ',
//       createElement('ul', {
//         children: listOfState()
//       }),
//       createElement('li', {
//         children: [
//           'The current count is: '
//         ]
//       }),
//       createElement('img', {
//         attrs: {
//           src: 'https://media.giphy.com/media/cuPm4p4pClZVC/giphy.gif',
//         },
//       })
//     ],
//   });
// } 

// let vApp = createVApp(0, state.anotherCount);
// const $app = render(vApp);
// let $rootEl = mount($app, document.getElementById('app'));


// setInterval(() => {
//   const n = Math.floor(Math.random() * 10);
//   const vNewApp = createVApp(n);
//   const patch = diff(vApp, vNewApp);

//   // we might replace the whole $rootEl,
//   // so we want the patch will return the new $rootEl
//   $rootEl = patch($rootEl);

//   vApp = vNewApp;
// }, 1000);

// setTimeout(() => {
//   state.anotherCount = 'new count though reactivity'

//   console.log(state, ' STATE UPDATED')
// }, 5000);

//console.log($app);

const btnEl = createAppVue({
  setup() {
    const text = ref('click me')
    const count = ref(0)
    const btnClick = () => {
      count.value++
    }

    return { text, count, btnClick }
  },
  template(state) {
    const html = (strings, ...values) => String.raw({ raw: strings }, ...values);
    let temp = html`
      <div>
        <button data-onclick="state.btnClick" style="color:blue;">${state.text.value}</button>
        <p>Count: ${state.count.value}</p>
      </div>
    `

    return parseTemplate(temp, state)
  }
})

btnEl.mount('#app');

const app = createAppVue({
  setup() {
    const a = ref(1);
    const b = ref(2);
    const imgUrl = ref('')

    const sum = computed(() => a.value + b.value);
    const obj = reactive({
      name: 'Oksana',
      surname: 'Vlasenko'
    })

    const fetchUser = async () => {
      const userId = Math.floor(Math.random() * 11) + 1

      await fetch(`https://reqres.in/api/users/${userId}`)
        .then(response => response.json())
        .then(json => {
          imgUrl.value = json.data.avatar
          obj.name = json.data.first_name
          obj.surname = json.data.last_name
        })
    }

    return { a, b, sum, obj, imgUrl, fetchUser };
  },

  created(state) {
    state.fetchUser()
  },

  destroy() {
    eventManager.removeAllEventListeners()
  },

  template(state) {
    let temp = `
      <div>
        <img src="${state.imgUrl.value}" alt='photo' />

        <p value='example'>A: ${state.a.value}</p>
        <p style="color:blue;">B: ${state.b.value}</p>
        <p>Sum: ${state.sum.value}</p>
        <h3 data-set="heafer" alt='title photo'> Name: ${state.obj.name}</h3>
        <h2> Surname: ${state.obj.surname}</h2>
        
        <button data-onclick="state.fetchUser">Change User</button>
      </div>
    `;

    return parseTemplate(temp, state)
  }
});

app.mount('#vueApp');


