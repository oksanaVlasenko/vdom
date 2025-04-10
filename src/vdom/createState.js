const handler = (onUpdate) => ({
  get(target, prop) {
    console.log(`Property "${prop}" was accessed.`);
    return target[prop];
  },
  set(target, prop, value) {
    
    target[prop] = value;
    console.log('CALL SETTER')
    onUpdate()
    return true; 
  },
})

const createState = (state, onUpdate) => {
  if (!state || Object.prototype.toString.call(state) !== '[object Object]') {
    throw new Error('State must be an object!')
  }

  let proxyState = new Proxy(state, handler(onUpdate))

  return proxyState
}

export default createState