<template>
  <div>
    <v-form ref="formRef" v-model="formValid">
      <v-row>
        <v-col cols="12" sm="6">
          <v-text-field label="First Name" v-model="firstName" :rules="[rules.required]" variant="solo" density="comfortable" hide-details="auto"></v-text-field>
        </v-col>
        <v-col cols="12" sm="6">
          <v-text-field label="Last Name" v-model="lastName" :rules="[rules.required]" variant="solo" density="comfortable" hide-details="auto"></v-text-field>
        </v-col>
        <v-col cols="12" sm="6">
          <v-text-field
            label="User Name"
            v-model="userName"
            :rules="[rules.required, rules.userName]"
            :error-messages="userNameExistsError ? [userNameExistsError] : []"
            variant="solo"
            density="comfortable"
            hide-details="auto"
          ></v-text-field>        
        </v-col>
        <v-col cols="12" sm="6">
          <v-text-field label="Reference No" v-model="referenceNo" :rules="[rules.required]" variant="solo" density="comfortable" hide-details="auto"></v-text-field>
        </v-col>

        <v-col cols="12" sm="6">
          <v-select :items="roles" item-title="label" item-value="value" label="User Role" v-model="userRole" :rules="[rules.required]" variant="solo" density="comfortable" hide-details="auto"></v-select>
        </v-col>

        <v-col cols="12" sm="6" v-if="userRole === 'section staff'">
          <v-select :items="sections" item-title="name" item-value="_id" label="Section" v-model="section" :rules="[rules.required]" variant="solo" density="comfortable" hide-details="auto"></v-select>
        </v-col>

        <v-col cols="12" sm="6">
          <v-text-field label="Password" v-model="password" :rules="[isEditMode ? rules.optional : rules.required]" type="password" variant="solo" density="comfortable" hide-details="auto" :placeholder="isEditMode ? 'Leave blank to keep current password' : ''"></v-text-field>
        </v-col>

        <v-col cols="12" sm="6">
          <v-file-input
            v-model="profileFile"
            accept="image/png, image/jpeg"
            label="Profile Image"
            prepend-icon="mdi-image"
            variant="solo"
            density="comfortable"
            :error="!!imageError"
            :error-messages="imageError ? [imageError] : []"
            hint="PNG or JPEG, up to 1MB"
            persistent-hint
            @update:modelValue="onProfileFileChange"
          ></v-file-input>
        </v-col>

        <v-col cols="12" sm="6">
          <div class="d-flex align-center" style="height: 100%;">
            <v-avatar size="64" class="mr-3">
              <v-img :src="profileImagePreview" />
            </v-avatar>
            <div class="text-caption text-grey">Preview</div>
          </div>
        </v-col>
      </v-row>

      <v-alert v-if="modalMessage" :type="modalError ? 'error' : 'success'" class="mt-3" density="compact">{{ modalMessage }}</v-alert>
    </v-form>
  </div>
</template>

<script setup>
import { ref, computed, watch, defineExpose } from 'vue'
const formRef = ref(null)
defineExpose({ formRef })
// Vuetify validation rules
const rules = {
  required: v => !!v || 'Required',
  optional: v => true,
  userName: validateUserName
}
const formValid = ref(false)
import userImg from '@/assets/user.png'

const props = defineProps({
  modelValue: { type: Object, default: () => ({}) },
  isEditMode: { type: Boolean, default: false },
  sections: { type: Array, default: () => [] },
  modalMessage: { type: String, default: '' },
  modalError: { type: Boolean, default: false },
  allUserNames: { type: Array, default: () => [] }

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
  const userNameExistsError = ref('')
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

const imageError = ref('')

function guessMimeFromBase64(b64) {
  return b64 && b64.startsWith('/9j/') ? 'image/jpeg' : 'image/png'
}

const profileImagePreview = computed(() => {
  if (profileImage.value) {
    const mime = profileFile.value?.type || guessMimeFromBase64(profileImage.value)
    return `data:${mime};base64,${profileImage.value}`
  }
  return userImg
})

const profileFile = ref(null)

function onProfileFileChange(files) {
  const file = Array.isArray(files) ? files[0] : files
  if (!file) { imageError.value = ''; return }
  // Validate type
  const validTypes = ['image/png', 'image/jpeg']
  if (!validTypes.includes(file.type)) {
    imageError.value = 'Only PNG or JPEG images are allowed'
    profileFile.value = null
    return
  }
  // Validate size (<= 1MB)
  const maxSize = 1024 * 1024
  if (file.size > maxSize) {
    imageError.value = 'Image size must be 1MB or less'
    profileFile.value = null
    return
  }
  imageError.value = ''
  const reader = new FileReader()
  reader.onload = (e) => {
    const result = e.target.result || ''
    const base64 = typeof result === 'string' ? result.split(',')[1] : ''
    if (base64) profileImage.value = base64
  }
  reader.readAsDataURL(file)
}

function validateUserName(v) {
  if (!v) return 'Required'
  // Only check if not edit mode or username changed
  if (!props.isEditMode || v !== props.modelValue.userName) {
    if (props.allUserNames.includes(v)) {
      userNameExistsError.value = 'User Name is already taken'
      return userNameExistsError.value
    }
  }
  userNameExistsError.value = ''
  return true
}
</script>

<style scoped>
.mt-2 { margin-top: 8px; }
</style>
