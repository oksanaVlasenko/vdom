let activeEffect = null
const targetMap = new WeakMap()

export function effect(fn) {
  activeEffect = fn
  fn()
  activeEffect = null
}

function track(target, key) {
  if (!activeEffect) return

  let depsMap = targetMap.get(target)
  if (!depsMap) {
    depsMap = new Map()
    targetMap.set(target, depsMap)
  }

  let dep = depsMap.get(key);
  if (!dep) {
    dep = new Set();
    depsMap.set(key, dep);
  }

  dep.add(activeEffect);
}

function trigger(target, key) {
  const depsMap = targetMap.get(target)
  if (!depsMap) return 

  const deps = depsMap.get(key)
  if (deps) {
    deps.forEach(effect => effect())
  }
}

export function ref(initialValue) {
  const deps = new Set()
  let value = initialValue

  return {
    get value() {
      if (activeEffect) deps.add(activeEffect)
      return value
    },
    set value(newVal) {
      value = newVal 
      deps.forEach(fn => fn())
    }
  }
}

export function reactive(obj) {
  return new Proxy(obj, {
    get(target, key) {
      track(target, key);
      return Reflect.get(target, key)
    }, 
    set(target, key, value) {
      const result = Reflect.set(target, key, value)
      trigger(target, key)
      return result
    }
  })
}

export function computed(getter) {
  const result = ref()

  effect(() => {
    result.value = getter()
  })

  return result
}

export function watch(source, callback) {
  let getter;
  
  if (typeof source === 'function') {
    getter = source; 
  } else {
    getter = () => traverse(source);
  }

  let oldValue = getter();
  let cleanup;

  const onCleanup = (fn) => {
    cleanup = fn;
  }

  const job = () => {
    if (cleanup) cleanup();
    const newValue = getter(); 

    if (cleanup) cleanup(); 
    callback(newValue, oldValue, onCleanup); 
    oldValue = newValue; 
  };

  

  effect(job);
}

function traverse(value, seen = new Set()) {
  if (typeof value !== 'object' || value === null || seen.has(value)) return value;
  seen.add(value);
  for (const key in value) {
    traverse(value[key], seen);
  }
  return value;
}
