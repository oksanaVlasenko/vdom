export default (tagName,{ attrs = {}, children = [], handlers = {}}) => {
  const vElem = Object.create(null);

  delete attrs['v-if'];
  delete attrs['v-else'];

  Object.assign(vElem, {
    tagName,
    attrs,
    children,
    handlers
  });

  return vElem;
};