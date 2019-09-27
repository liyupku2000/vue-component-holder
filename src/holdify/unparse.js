function unparse (astNode) {
  if (astNode.tag) {
    var res = '<' + astNode.tag;
    res += unparseAttrs(astNode.attrsMap);
    res += unparseNodes(astNode.children);
    res += unparseNodes(astNode.scopedSlots);
    res += '</' + astNode.tag + '>';
    return res;
  } else if (astNode.text) {
    return astNode.text;
  } else {
    throw new Error("holdify's unparse: unhandled ast node\n" + astNode);
  }
}

function unparseAttrs ( attrsMap ) {
  var s = '';
  if (attrsMap) {
    Object.keys(attrsMap).forEach(function(attrName) {
      s += ' ' + attrName;
      const attrValue = attrsMap[attrName];
      if (attrValue) {
        s += '=\\"' + attrValue + '\\"';
      }
    });
    s += '>';
  }
  return s;
}

function unparseNodes (nodes) {
  var s = '';
  if (nodes) {
    Object.values(nodes).forEach(function(node) {
      s += unparse(node);
    });
  }
  return s;
}

module.exports = unparse;