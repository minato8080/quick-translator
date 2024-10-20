'use client'

import { motion, AnimatePresence } from 'framer-motion'

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { alertIcons, alertColors, type AlertProps } from '@/hooks/useAlertPopup'


export function AlertPopup({ alert }: { alert: AlertProps | null }) {
  const AlertIcon = alertIcons[alert?.type || "info"]

  return (
    <div className="fixed top-4 right-4 left-4 z-50 pointer-events-none flex justify-center">
      <AnimatePresence>
          {alert && (
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-md pointer-events-auto"
            >
              <Alert className={`${alertColors[alert.type]} border shadow-lg`}>
                <AlertIcon className="h-4 w-4" />
                <AlertTitle>{alert.title}</AlertTitle>
                <AlertDescription>{alert.description}</AlertDescription>
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>
    </div>
  )
}