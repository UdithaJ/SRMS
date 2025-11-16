
// stores/user.js
import { defineStore } from 'pinia';

export const useUserStore = defineStore('user', {
  state: () => ({
    userId: null,
    userRole: null,
    userFullName: null,
    userProfileImage: null,
  }),
  actions: {
    async setUser(user) {
      this.userId = user.id;
      this.userRole = user.userRole;
      this.userFullName = user.firstName + ' ' + user.lastName;
      this.userProfileImage = user.profileImage || null;
      if (typeof window !== 'undefined' && window.electronStore) {
        await window.electronStore.set('user', { userId: this.userId, userRole: this.userRole, userFullName: this.userFullName, userProfileImage: this.userProfileImage });
      } else {
        try { localStorage.setItem('user', JSON.stringify({ userId: this.userId, userRole: this.userRole, userFullName: this.userFullName, userProfileImage: this.userProfileImage })); } catch {}
      }
    },

    async loadUser() {
      let data = null;
      if (typeof window !== 'undefined' && window.electronStore) {
        data = await window.electronStore.get('user');
      } else {
        try { data = JSON.parse(localStorage.getItem('user') || 'null'); } catch { data = null; }
      }
      if (data) {
        this.userId = data.userId;
        this.userRole = data.userRole;
        this.userFullName = data.userFullName;
        this.userProfileImage = data.userProfileImage || null;
      }
      return data;
    },

    logout() {
      this.userId = null;
      this.userRole = null;
      this.userFullName = null;
      this.userProfileImage = null;
      if (typeof window !== 'undefined' && window.electronStore) {
        window.electronStore.delete('user');
      } else {
        try { localStorage.removeItem('user'); } catch {}
      }
    },
  },
});
