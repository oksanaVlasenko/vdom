export function parseHTMLString(html, state) {
  const tagRegex = /<\s*\/?([a-zA-Z0-9\-]+)([^>]*)\/?\s*>/g;
  const attrRegex = /([:@a-zA-Z0-9\-]+)(?:\s*=\s*(['"])(.*?)\2)?/g;
  const selfClosingTags = ['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr', 'image'];

  const stack = [];
  const tagTree = [];

  let match;
  let currentParent = null;
  let lastIndex = 0;
  let lastTagSkipped = false;
  let skipTagName = null;

  while ((match = tagRegex.exec(html)) !== null) {
    const fullMatch = match[0];
    const tagName = match[1];
    const attrString = match[2].trim();
    const isClosing = fullMatch.startsWith("</");
    const isSelfClosing = fullMatch.endsWith("/>") || selfClosingTags.includes(tagName.toLowerCase());
    
    const textContent = html.slice(lastIndex, match.index).trim();
    
    if (!skipTagName && textContent && currentParent && !lastTagSkipped) {
      currentParent.children.push(textContent)
    } 

    lastIndex = tagRegex.lastIndex;
    
    if (isClosing) {
      if (skipTagName === tagName) {
        skipTagName = null; 
        continue;
      }

      if (!stack.length || stack[stack.length - 1].tag !== tagName) {
        console.warn(`❌ Tag mismatch or unexpected closing tag: </${tagName}>`);
      } else {
        const closed = stack.pop();
        if (stack.length === 0) {
          tagTree.push(closed);
          currentParent = null;
        } else {
          currentParent = stack[stack.length - 1];
        }
      }
    } else {
      if (skipTagName) {
        continue;
      }

      const attrs = {};
      const handlers = {};
      let attrMatch;
      
      while ((attrMatch = attrRegex.exec(attrString)) !== null) {
        const attr = attrMatch[1]
        let value = attrMatch[3] ?? true

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
          attrs[attr] = value
        }
      }   

      const tag = {
        type: 'element',
        tag: tagName,
        attributes: attrs,
        handlers,
        children: [],
        notAdded: false
      };

      for (const [key, value] of Object.entries(attrs)) {
        if (key === 'v-if' && value === 'false') {
          tag.notAdded = true
        } else if (key === 'v-else' && currentParent) {
          const previousChild = currentParent.children.find(i => i.type === 'element' && i.attributes['v-if']) 
          
          if (previousChild && previousChild.attributes['v-if'] === 'true') {
            tag.notAdded = true 
          }
        }
      }

      lastTagSkipped = tag.notAdded;

      if (tag.notAdded) {
        skipTagName = tagName;
        continue;
      }

      if (currentParent && !tag.notAdded) {
        currentParent.children.push(tag);
      }
 
      if (!tag.notAdded) {
        if (!isSelfClosing) {
          stack.push(tag); 
          currentParent = tag;
        } else if (!currentParent) {
          tagTree.push(tag);
        }
      }
      
    }
  }

  if (stack.length > 0) {
    console.warn("❌ Unmatched tags:", stack.map(t => `<${t.tag}>`).join(", "));
  } else {
    console.log("✅ All tags are properly matched.");
  }

  if (tagTree.length !== 1) {
    throw new Error(`❌ Only one root element is allowed! Found ${tagTree.length} root elements.`);
  }

  const result = {
    parentTag: tagTree[0].tag,
    attrs: tagTree[0].attributes,
    el: tagTree[0].children
  }

  return result
}

