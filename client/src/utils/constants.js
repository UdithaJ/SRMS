// User Role Labels
export const ROLE_LABELS = {
  admin: 'Admin',
  reporter: 'Reporter',
  'section staff': 'Section Staff',
  ads: 'ADS',
  ds: 'DS'
}

// Helper function to get role label
export const getRoleLabel = (role) => ROLE_LABELS[role] || role || '-'
