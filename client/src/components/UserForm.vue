<template>
  <div>
    <v-form>
      <v-row>
        <v-col cols="12" sm="6">
          <v-text-field label="First Name" v-model="firstName"></v-text-field>
        </v-col>
        <v-col cols="12" sm="6">
          <v-text-field label="Last Name" v-model="lastName"></v-text-field>
        </v-col>
        <v-col cols="12" sm="6">
          <v-text-field label="User Name" v-model="userName"></v-text-field>
        </v-col>
        <v-col cols="12" sm="6">
          <v-text-field label="Reference No" v-model="referenceNo"></v-text-field>
        </v-col>

        <v-col cols="12" sm="6">
          <v-file-input
            v-model="profileFile"
            accept="image/*"
            label="Profile Image"
            prepend-icon="mdi-image"
            @update:modelValue="onProfileFileChange"
          ></v-file-input>
        </v-col>

        <v-col cols="12" sm="6">
          <div class="d-flex align-center">
            <v-avatar size="80" class="mr-4">
              <v-img :src="profileImagePreview" />
            </v-avatar>
            <div class="text-caption">Image Preview</div>
          </div>
        </v-col>

        <v-col cols="12" sm="6">
          <v-select :items="roles" item-title="label" item-value="value" label="User Role" v-model="userRole"></v-select>
        </v-col>

        <v-col cols="12" sm="6" v-if="userRole === 'section staff'">
          <v-select :items="sections" item-title="name" item-value="_id" label="Section" v-model="section"></v-select>
        </v-col>

        <v-col cols="12" sm="6">
          <v-text-field label="Password" v-model="password" type="password" :placeholder="isEditMode ? 'Leave blank to keep current password' : ''"></v-text-field>
        </v-col>
      </v-row>

      <v-alert v-if="modalMessage" :type="modalError ? 'error' : 'success'" class="mt-2">{{ modalMessage }}</v-alert>
    </v-form>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import userImg from '@/assets/user.png'

const props = defineProps({
  modelValue: { type: Object, default: () => ({}) },
  isEditMode: { type: Boolean, default: false },
  sections: { type: Array, default: () => [] },
  modalMessage: { type: String, default: '' },
  modalError: { type: Boolean, default: false }
})

const emit = defineEmits(['update:modelValue','role-change'])

const roles = [
  { value: 'admin', label: 'Admin' },
  { value: 'reporter', label: 'Reporter' },
  { value: 'section staff', label: 'Section Staff' },
  { value: 'ads', label: 'ADS' },
  { value: 'ds', label: 'DS' }
]

const firstName = computed({
  get: () => props.modelValue.firstName || '',
  set: (v) => emit('update:modelValue', { ...props.modelValue, firstName: v })
})
const lastName = computed({
  get: () => props.modelValue.lastName || '',
  set: (v) => emit('update:modelValue', { ...props.modelValue, lastName: v })
})
const userName = computed({
  get: () => props.modelValue.userName || '',
  set: (v) => emit('update:modelValue', { ...props.modelValue, userName: v })
})
const referenceNo = computed({
  get: () => props.modelValue.referenceNo || '',
  set: (v) => emit('update:modelValue', { ...props.modelValue, referenceNo: v })
})

const userRole = computed({
  get: () => props.modelValue.userRole || '',
  set: (v) => {
    emit('update:modelValue', { ...props.modelValue, userRole: v })
    emit('role-change')
  }
})

const section = computed({
  get: () => props.modelValue.section || '',
  set: (v) => emit('update:modelValue', { ...props.modelValue, section: v })
})

const password = computed({
  get: () => props.modelValue.password || '',
  set: (v) => emit('update:modelValue', { ...props.modelValue, password: v })
})

const profileImage = computed({
  get: () => props.modelValue.profileImage || '',
  set: (v) => emit('update:modelValue', { ...props.modelValue, profileImage: v })
})

const profileImagePreview = computed(() => profileImage.value ? `data:image/png;base64,${profileImage.value}` : userImg)

const profileFile = ref(null)

function onProfileFileChange(files) {
  const file = Array.isArray(files) ? files[0] : files
  if (!file) return
  const reader = new FileReader()
  reader.onload = (e) => {
    const result = e.target.result || ''
    const base64 = typeof result === 'string' ? result.split(',')[1] : ''
    if (base64) profileImage.value = base64
  }
  reader.readAsDataURL(file)
}
</script>

<style scoped>
.mt-2 { margin-top: 8px; }
</style>
