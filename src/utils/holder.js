function registerHolder (vm, reg) {
  if (reg && typeof reg === 'object' && typeof reg.name === 'string') {
    vm._holder.regs[reg.name] = reg
    return reg
  }
}

function findHolderReg (vm, name) {
  return vm._holder.regs[name]
}

function findVueHolderEl (vm, id) {
  const holderVm = vm.$children.find(c => c._isVueHolder && c.vhid === id)
  return holderVm && holderVm.$el
}

function emptyVueHolderEl (holderEl) {
  if (holderEl && holderEl.lastChild) {
    holderEl.removeChild(holderEl.lastChild)
  }
}

export {
  registerHolder,
  findHolderReg,
  findVueHolderEl,
  emptyVueHolderEl
}