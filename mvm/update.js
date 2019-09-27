import { findVueHolderEl, emptyVueHolderEl} from '../utils/holder'
import { cleanMvm } from './clean'
import { createMvm } from './create'

export async function udpateMvms (vm, type) {
  const mvmRegs = vm._holder.mvmRegs[type]
  if (mvmRegs) {
    const options = vm._holder.options[type] || {}
    let updatedHolders = await Promise.all(
      Object.values(mvmRegs).map(async mvmReg => {
        const holderEl = findVueHolderEl(vm, mvmReg.id)
        if (holderEl) {
          if (mvmReg.docked) {
            callCbFn(options.cbExisted, vm, mvmReg)
          } else {
            mvmReg.docked = true
            return await dockMvm(vm, holderEl, mvmReg, options)
          }
        } else {
          cleanMvm(vm, mvmReg)
          return mvmReg.name
        }
      })
    )
    updatedHolders = updatedHolders.filter(name => name)
    return [...new Set(updatedHolders)]
  }
}

async function dockMvm(vm, holderEl, mvmReg, options) {
  emptyVueHolderEl(holderEl)
  const mvm = vm._holder.mvms[mvmReg.id]
  if (mvm) {
    holderEl.appendChild(mvm.$el)
  } else {
    await createMvm(vm, mvmReg)
    callCbFn(options.cbCreated, vm, mvmReg)
    return mvmReg.name
  }
}

function callCbFn(cb, ...args) {
  if (cb) {
    cb(...args)
  }
}