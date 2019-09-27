import { unregisterMvm } from './register'
import { findVueHolderEl, emptyVueHolderEl} from '../utils/holder'

export function cleanMvm (vm, mvmReg) {
  unregisterMvm(vm, mvmReg)

  const id = mvmReg.id

  if (mvmReg.template) {
    const mvm = vm._holder.mvms[id]
    if (mvm) {
      delete vm._holder.mvms[id]
      mvm.$destroy()
      emptyVueHolderEl(findVueHolderEl(vm, id))
    }
  }

  if (mvmReg.cleanFunc) {
    vm.$log('clean', `Call cleanFunc on '${id}'`)
    mvmReg.cleanFunc.call(vm)
  }
}

export function cleanMvms (vm, type) {
  const mvmRegs = vm._holder.mvmRegs[type]
  if (mvmRegs) {
    Object.values(mvmRegs).forEach(mvmReg => {
      cleanMvm(vm, mvmReg)
    })
  }
}