// Seasonal Effects Manager
import { winterEffect, winterAnimation } from './winter.js'
import { springEffect, springAnimation } from './spring.js'
import { summerEffect, summerAnimation } from './summer.js'
import { autumnEffect, autumnAnimation } from './autumn.js'

export const seasons = {
  winter: { effect: winterEffect, animation: winterAnimation },
  spring: { effect: springEffect, animation: springAnimation },
  summer: { effect: summerEffect, animation: summerAnimation },
  autumn: { effect: autumnEffect, animation: autumnAnimation }
}

// Get current season based on month
export function getCurrentSeason() {
  const month = new Date().getMonth() + 1 // 1-12
  
  if (month === 12 || month === 1 || month === 2) {
    return 'winter'
  } else if (month >= 3 && month <= 5) {
    return 'spring'
  } else if (month >= 6 && month <= 8) {
    return 'summer'
  } else if (month >= 9 && month <= 11) {
    return 'autumn'
  }
  
  return 'winter' // default
}

// Get season configuration
export function getSeasonConfig(seasonName = null) {
  const season = seasonName || getCurrentSeason()
  return seasons[season]
}

// Get all available seasons
export function getAllSeasons() {
  return Object.keys(seasons).map(key => ({
    key,
    name: seasons[key].effect.name,
    icon: seasons[key].effect.icon
  }))
}
