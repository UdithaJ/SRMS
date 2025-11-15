// import { defineStore } from 'pinia'

// export const useUserStore = defineStore('user', {
//   state: () => ({
//     role: null,
//     username: null
//   }),

//   actions: {
//     setRole(role) {
//       this.role = role
//     },
//     setUser(name) {
//       this.username = name
//     },
//     logout() {
//     this.roles = []
//     this.token = ''
//     this.user = null
// }
//   }

// })


// stores/user.js
import { defineStore } from 'pinia';

export const useUserStore = defineStore('user', {
  state: () => ({
    userId: null,
    userRole: null,
  }),
  actions: {
    async setUser(user) {
      this.userId = user.id;
      this.userRole = user.userRole;

      await window.electronStore.set('user', { userId: this.userId, userRole: this.userRole });
    },

    async loadUser() {
      const data = await window.electronStore.get('user');
      if (data) {
        this.userId = data.userId;
        this.userRole = data.userRole;
      }
    },

    logout() {
      this.userId = null;
      this.userRole = null;
      window.electronStore.delete('user');
    },
  },
});
