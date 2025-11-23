import { ref } from 'vue'

const show = ref(false)
const message = ref('')
const type = ref('success') // 'success', 'error', 'warning', 'info'
const timeout = ref(3000)

export function useToast() {
  const showToast = (msg, toastType = 'success', duration = 3000) => {
    message.value = msg
    type.value = toastType
    timeout.value = duration
    show.value = true
  }

  const hideToast = () => {
    show.value = false
  }

  return {
    show,
    message,
    type,
    timeout,
    showToast,
    hideToast
  }
}
