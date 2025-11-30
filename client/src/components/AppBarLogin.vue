<template>
  <v-app-bar
    class="login-app-bar"
    height="64"
    elevation="0"
    flat
    style="width: 100vw; left: 0; right: 0; position: fixed; top: 0; z-index: 100;"
  >
    <div class="login-branding">
      <span class="login-system-name">CIMS</span>
      <span class="login-system-slogan">Digitalizing Today for a Better Tomorrow</span>
    </div>
  </v-app-bar>
</template>

<script setup>
// No logic needed for login app bar
</script>

<style scoped lang="scss">
.login-app-bar {
  background: var(--app-bar-color, #5B93FF) !important;
  color: #fff;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  border-radius: 0 !important;
  padding: 0 32px;
}
.login-branding {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  height: 100%;
}
.login-system-name {
  font-size: 24px;
  font-weight: 700;
  letter-spacing: 2px;
  color: #fff;
}
.login-system-slogan {
  font-size: 12px;
  font-weight: 400;
  color: #e0e0e0;
  letter-spacing: 1px;
  text-transform: uppercase;
}
</style>
