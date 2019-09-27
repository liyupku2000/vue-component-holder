import intfContainer from '../intf/IntfContainer'

export function registerMvm (vm, reg, id, uid) {
  const mvmReg = { ... reg }
  mvmReg.id = id
  mvmReg.uid = uid
  initIntf(vm, mvmReg)

  const type = mvmReg.type
  vm._holder.mvmRegs[type] = vm._holder.mvmRegs[type] || {}
  vm._holder.mvmRegs[type][id] = mvmReg
}

export function unregisterMvm (vm, mvmReg) {
  const { name, type, id, uid } = mvmReg
  vm._holder.intfs[name].delete(uid)
  delete vm._holder.mvmRegs[type][id]
}

function initIntf (vm, mvmReg) {
  const { name, uid } = mvmReg
  vm._holder.intfs[name] = vm._holder.intfs[name] || new intfContainer()
  mvmReg.intf = vm._holder.intfs[name].add(uid)
}