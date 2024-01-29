interface OnboardingActions {
  text: string
  theme: 'primary' | 'secondary' | 'dark' | 'outline' | 'none' | 'success' | 'danger'
  type: 'mark-as-complete' | 'mark-as-skip' | 'plain-url' | 'finalize'
  url?: string
}
interface Onboarding {
  _id: string
  title: string
  content: string
  videoAttachment?: FileManager.FileResponse
  actions?: OnboardingActions[]
  mapFields?: 'social-access' | 'brand-overview'
  renderFeature?: 'brand-overview' | 'pricing'
  order: number
  createdAt: string | Date
  deleted: boolean
}

interface OnboardingProgress {
  _id: string
  business: string
  onboarding: string
  status: 'pending' | 'completed' | 'skiped'
}
