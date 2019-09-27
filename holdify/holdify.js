var UNIQUE_ID = 0;
var unparse = require('./unparse');

module.exports = function holdify (holderNode) {
  holdifyName(holderNode);
  holdifyUidAndVars(holderNode);
  holdifyTemplate(holderNode);
}

function holdifyName (holderNode) {
  if (!holderNode.attrsMap['name'] && !holderNode.attrsMap[':name']) {
    addAttr(holderNode, 'name', '"VueHolder' + UNIQUE_ID++ + '"');
    holderNode.plain = false;
  }
}

function holdifyUidAndVars (holderNode) {
  var uidMatches = [], uidAdds = [], vars = [];
  var uid = parseUidAttr(holderNode);
  var node = holderNode;
  while (node) {
    if (node.for) {
      var uidItem = uid.find(i => i.name === node.iterator1);
      if (uidItem && uidItem.name === uidItem.value) { // v-for="(city, name) in cities", uid = { name }
        vars.push({
          name: '*' + node.alias,
          value: node.for + '[' + node.iterator1 + ']'
        });
      } else {
        var pattern = '#' + node.alias + '#';
        uidItems = uid.filter(i => i.value.includes(pattern));
        if (uidItems.length) {      // v-for="city in cities", uid = { name: #city#.name, state: #city#.state }
          var regex = new RegExp(pattern, 'g');
          var expr = uidItems.map(uidItem =>
            '(' + uidItem.value.replace(regex, node.alias) + ')===' + uidItem.name
          ).join(' && ');
          vars.push({
            name: '*' + node.alias,
            value: 'Object.values(' + node.for + ').find(' + node.alias + ' => ' + expr + ')'
          });
          uidMatches.push(node.alias);
        } else if (node.attrsMap[':key']) {
          var keyExpr = node.attrsMap[':key'].trim();
          if (keyExpr === node.alias) { // v-for="name in cityNames" :key="name"
            uidAdds.push(keyExpr);
          }
          else if (keyExpr === node.iterator1) { // v-for="(city, name) in cities" :key="name"
            vars.push({
              name: '*' + node.alias,
              value: node.for + '[' + keyExpr + ']'
            });
            uidAdds.push(keyExpr);
          } else {     // v-for="city in cities" :key="city.name"
            var newUidName = '__uid_' + node.alias;
            var expr = '(' + keyExpr + ')===' + newUidName;
            vars.push({
              name: '*' + node.alias,
              value: 'Object.values(' + node.for + ').find(' + node.alias + ' => ' + expr + ')'
            });
            uidAdds.push(newUidName + ': ' + keyExpr);
          }
        } else {  // v-for="area in [city.area]"
          vars.push({
            name: node.alias,
            value: node.for + '[0]'
          });
        }
      }
    }
    node = node.parent;
  }

  holdifyUid(holderNode, uidMatches, uidAdds.reverse());
  holdifyVars(holderNode, vars);
}

function holdifyUid (holderNode, matches, adds) {
  var attr = holderNode.attrsMap[':uid'];
  if (attr && matches.length) {
    var regex = new RegExp('#('+ matches.join('|') + ')#', 'g');
    attr = attr.replace(regex, '$1');
  }

  if (adds.length) {
    attr = attr || '{}';
    var exists = attr.trim().substring(1, attr.length - 1).trim();
    if (exists.length) {
      adds = [ exists, ...adds ];
    }
    attr = '{' + adds.join() + '}';
  }

  if (attr) {
    if (holderNode.attrsMap.hasOwnProperty(':uid')) {
      holderNode.attrsMap[':uid'] = attr;
      holderNode.attrs.find(a => a.name === 'uid').value = attr;
      holderNode.attrsList.find(a => a.name === ':uid').value = attr;
    } else {
      holderNode.attrsMap[':uid'] = attr;
      holderNode.attrs.push({ name: 'uid', value: attr, dynamic: false });
      holderNode.attrsList.push({ name: ':uid', value: attr });
    }
  }
}

function holdifyVars (holderNode, vars) {
  if (!holderNode.attrsMap[':vars']) {
    var varsAttr = '{ ';
    varsAttr += vars.reverse().map(v =>
      '"' + v.name + '": "' + v.value.replace(/"/g, '\\"') + '"'
    ).join();
    varsAttr += ' }';
    addAttr(holderNode, 'vars', varsAttr);
  }
}

function holdifyTemplate (holderNode) {
  if (holderNode.children && holderNode.children.length && !holderNode.attrsMap.template) {
    const childNode = holderNode.children[0];
    const template = '"' + unparse(childNode) + '"';
    holderNode.children = [];
    addAttr(holderNode, 'template', template);
  }
}

function parseUidAttr (holderNode) {
  var res = [];
  var attr = holderNode.attrsMap[':uid'];
  if (attr) {
    attr = attr.trim();
    attr = attr.substring(1, attr.length - 1).trim();
    // split by commas outside of quotes
    // not a strict regexp
    // assuming people would not construct uids with quotes
    attr.split(/(,)(?=(?:[^"'`]|["|'|`][^"'`]*["|'|`])*$)/).forEach(seg => {
      var index = seg.indexOf(':');
      if (index === -1) {
        seg = seg.trim();
        res.push({
          name: seg,
          value: seg
        });
      } else {
        res.push({
          name: seg.substring(0, index).trim(),
          value: seg.substring(index+1).trim()
        })
      }
    });
  }
  return res;
}

function addAttr (node, name, value) {
  node.attrs = node.attrs || [];
  node.attrs.push({
    name,
    value,
    dynamic: false
  });
  node.attrsList.push({
    name,
    value
  });
  node.attrsMap[name] = value;
}