const CATEGORIES = []
const ACTIVES = new Set()
const STORAGE_KEY = 'Store.Log.Actives'

function saveActives() {
  ACTIVES.size ?
    localStorage[STORAGE_KEY] = JSON.stringify([...ACTIVES]) :
    localStorage.removeItem(STORAGE_KEY)
}

function loadActivate(cat) {
  const actives = JSON.parse(localStorage[STORAGE_KEY] || '[]')
  if (Array.isArray(actives) && actives.includes(cat)) {
    activate(cat)
  }
}

function activate(cat) {
  if (CATEGORIES.includes(cat)) {
    ACTIVES.add(cat)
  }
}

export default {
  updateActives(actives) {
    ACTIVES.clear()
    actives = actives || []
    actives.forEach(activate)
    saveActives()
  },

  getAllCategories() {
    return [ ...CATEGORIES ]
  },

  isActive(cat) {
    return ACTIVES.has(cat)
  },

  register(cat) {
    if (typeof cat === 'string') {
      if (!CATEGORIES.includes(cat)) {
        CATEGORIES.push(cat)
        CATEGORIES.sort()
        loadActivate(cat)
      }
    }
  }
}