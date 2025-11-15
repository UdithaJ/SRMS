<template>
  <div class="create-section">
    <h2>Create Section</h2>
    <form @submit.prevent="createSection">
      <div>
        <label for="sectionId">Section ID:</label>
        <input type="text" v-model="sectionId" id="sectionId" required />
      </div>
      <div>
        <label for="name">Section Name:</label>
        <input type="text" v-model="name" id="name" required />
      </div>
      <button type="submit">Create Section</button>
    </form>

    <p v-if="message" :class="{ error: isError, success: !isError }">{{ message }}</p>
  </div>
</template>

<script>
import axios from 'axios';
import { ref } from 'vue';

export default {
  name: 'CreateSection',
  setup() {
    const sectionId = ref('');
    const name = ref('');
    const message = ref('');
    const isError = ref(false);

    const createSection = async () => {
      try {
        const response = await axios.post('http://127.0.0.1:3000/api/sections', {
          sectionId: sectionId.value,
          name: name.value
        });

        message.value = response.data.message;
        isError.value = false;

        // Clear form
        sectionId.value = '';
        name.value = '';
      } catch (err) {
        isError.value = true;
        if (err.response && err.response.data && err.response.data.message) {
          message.value = err.response.data.message;
        } else {
          message.value = 'An error occurred';
        }
      }
    };

    return {
      sectionId,
      name,
      message,
      isError,
      createSection
    };
  }
};
</script>

<style scoped>
.create-section {
  max-width: 400px;
  margin: 0 auto;
}
form div {
  margin-bottom: 1rem;
}
button {
  padding: 0.5rem 1rem;
}
.success {
  color: green;
}
.error {
  color: red;
}
</style>
