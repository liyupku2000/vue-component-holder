export default function() {
  let _root, _level

  return {
    get (uid) {
      if (_level === 0) {
        return _root
      } else {
        uid = Object.values(uid)
        if (uid.length >= _level) {
          uid = uid.slice(0, _level)
          let obj = _root
          uid.forEach(key => {
            obj = obj[key]
          })
          return obj
        } else {
          throw new Error(`require ${_level - args.length} more arg(s)`)
        }
      }
    },

    add (uid) {
      _root = _root || {}
      if (uid === undefined) {
        _level = 0
        return _root
      } else {
        uid = Object.values(uid)
        _level = _level || uid.length
        let obj = _root
        uid.forEach(key => {
          obj = (obj[key] = obj[key] || {})
        })
        return obj
      }
    },

    delete (uid) {
      if (!_level) {
        _root = undefined
      } else {
        uid = Object.values(uid)
        if (uid.length === _level) {
          let obj = _root
          uid.slice(0, -1).forEach(key => {
            obj = obj[key]
          })
          const lastKey = uid[_level-1]
          delete obj[lastKey]
        } else {
          throw new Error(`invalid uid [${uid}]`)
        }
      }
    },
  }
}