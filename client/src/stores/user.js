
// stores/user.js
import { defineStore } from 'pinia';

export const useUserStore = defineStore('user', {
  state: () => ({
    userId: null,
    userRole: null,
    userFullName: null,
  }),
  actions: {
    async setUser(user) {
      this.userId = user.id;
      this.userRole = user.userRole;
      this.userFullName = user.firstName + ' ' + user.lastName;

      await window.electronStore.set('user', { userId: this.userId, userRole: this.userRole, userFullName: this.userFullName });
    },

    async loadUser() {
      const data = await window.electronStore.get('user');
      if (data) {
        this.userId = data.userId;
        this.userRole = data.userRole;
        this.userFullName = data.userFullName;
      }
    },

    logout() {
      this.userId = null;
      this.userRole = null;
      window.electronStore.delete('user');
    },
  },
});
