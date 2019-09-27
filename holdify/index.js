var changeCase = require('change-case');
var holdify = require('./holdify');

function makeHoldifyFn (extensionTypes) {
  var testFn = makeTestFn(extensionTypes);

  return function(astNode) {
    const tag = changeCase.kebabCase(astNode.tag);
    if (tag && tag.startsWith('vue-')) {
      type = tag.substring(4);
      if (type === 'holder' || testFn(type)) {
        holdify(astNode)
      }
    }
  }
}

function makeTestFn (extensionTypes) {
  if (extensionTypes) {
    if (typeof extensionTypes === 'string') {
      extensionTypes = extensionTypes.split(/[\s|,]+/g)
    }
    if (Array.isArray(extensionTypes)) {
      extensionTypes = extensionTypes.map(type => changeCase.kebabCase(type))
      return type => extensionTypes.includes(type)
    }
  }
  return () => false
}

module.exports = makeHoldifyFn