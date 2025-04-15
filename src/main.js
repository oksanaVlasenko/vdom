import { ref, reactive } from './vdom/reactivity.js';
import { createAppVue } from './vdom/miniVue.js';
import { eventManager } from './vdom/eventListeners.js'
import { parseHTMLString } from './vdom/htmlParser.js'

const app = createAppVue({
  setup() {
    const imgUrl = ref('')
    const isShown = ref(true)

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

    const switchBlock = () => {
      isShown.value = !isShown.value
    }

    return { obj, imgUrl, isShown, fetchUser, switchBlock };
  },

  created(state) {
    state.fetchUser()
  },

  destroy() {
    eventManager.removeAllEventListeners()
  },

  template(state) {
    let temp = `
      <div id="parentDiv" class="container">
        <small> just text </small>
        
        <p v-if="${state.isShown.value}" style="color:red;">
          Show if

          <small class="text-span"> text in v-if </small>
        </p>

        <p v-else style="color:green;">
          Show else

          <small class="text-span"> text in v-else </small>
        </p>

        <button data-onclick="state.switchBlock">Switch p</button>

        <section>
          <div class='img-container'>
            <img src="${state.imgUrl.value}" alt='photo' />
          </div>

          <h3> Name: ${state.obj.name}</h3>
          <h2> Surname: ${state.obj.surname}</h2>

          <button data-onclick="state.fetchUser">Change User</button>
        </section>
      </div>
    `;

    return parseHTMLString(temp, state)
  }
});

app.mount('#vueApp');


