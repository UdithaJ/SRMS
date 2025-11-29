import { defineStore } from 'pinia'

export const useThemeStore = defineStore('theme', {
  state: () => ({
    isDark: false, // Default to light theme
  }),
  
  actions: {
    async loadTheme() {
      let savedTheme = null
      
      // Try to load from electron store first
      if (typeof window !== 'undefined' && window.electronStore) {
        savedTheme = await window.electronStore.get('theme')
      } else {
        // Fallback to localStorage
        try {
          savedTheme = localStorage.getItem('theme')
        } catch (e) {
          console.error('Failed to load theme from localStorage:', e)
        }
      }
      
      if (savedTheme !== null) {
        this.isDark = savedTheme === 'dark'
      } else {
        // If no saved theme, default to light theme
        this.isDark = false
      }
      
      this.applyTheme()
    },
    
    async setTheme(isDark) {
      this.isDark = isDark
      
      // Save to electron store if available
      if (typeof window !== 'undefined' && window.electronStore) {
        await window.electronStore.set('theme', isDark ? 'dark' : 'light')
      } else {
        // Fallback to localStorage
        try {
          localStorage.setItem('theme', isDark ? 'dark' : 'light')
        } catch (e) {
          console.error('Failed to save theme to localStorage:', e)
        }
      }
      
      this.applyTheme()
    },
    
    toggleTheme() {
      this.setTheme(!this.isDark)
    },
    
    applyTheme() {
      const htmlElement = document.documentElement
      
      if (this.isDark) {
        htmlElement.classList.add('dark-theme')
        htmlElement.classList.remove('light-theme')
      } else {
        htmlElement.classList.add('light-theme')
        htmlElement.classList.remove('dark-theme')
      }
    }
  }
})
