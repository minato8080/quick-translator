import { useState, useCallback } from 'react'

import { AlertCircle, CheckCircle2, XCircle } from 'lucide-react'

export type AlertType = 'success' | 'error' | 'info'

export interface AlertProps {
  type: AlertType
  title: string
  description: string
}

export const alertIcons = {
  success: CheckCircle2,
  error: XCircle,
  info: AlertCircle
}

export const alertColors = {
  success: 'bg-green-50 border-green-200 text-green-800',
  error: 'bg-red-50 border-red-200 text-red-800',
  info: 'bg-blue-50 border-blue-200 text-blue-800'
}

export function useAlertPopup() {
  const [alert, setAlert] = useState<AlertProps | null>(null)

  const showAlert = useCallback((type: AlertType, title: string, description: string) => {
    setAlert({ type, title, description })
    setTimeout(() => setAlert(null), 3000) // Hide alert after 3 seconds
  }, [])

  return { alert, showAlert }
}