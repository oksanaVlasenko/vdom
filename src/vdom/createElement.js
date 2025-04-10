export default (tagName,{ attrs = {}, children = [], handlers = {}}) => {
  const vElem = Object.create(null);

  Object.assign(vElem, {
    tagName,
    attrs,
    children,
    handlers
  });

  return vElem;
};