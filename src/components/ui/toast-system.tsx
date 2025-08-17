'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, AlertCircle, XCircle, Info, X } from 'lucide-react'
import { createContext, useContext, useState, ReactNode } from 'react'
import { cn } from '@/lib/utils'

type ToastType = 'success' | 'error' | 'warning' | 'info'

interface Toast {
  id: string
  type: ToastType
  title: string
  description?: string
  duration?: number
  emoji?: string
}

interface ToastContextType {
  toasts: Toast[]
  showToast: (toast: Omit<Toast, 'id'>) => void
  removeToast: (id: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export const useToast = () => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within ToastProvider')
  }
  return context
}

const toastIcons = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertCircle,
  info: Info,
}

const toastStyles = {
  success: {
    bg: 'bg-gradient-to-r from-green-500 to-emerald-500',
    border: 'border-green-500/20',
    text: 'text-white',
    icon: 'text-white',
  },
  error: {
    bg: 'bg-gradient-to-r from-red-500 to-red-600',
    border: 'border-red-500/20',
    text: 'text-white',
    icon: 'text-white',
  },
  warning: {
    bg: 'bg-gradient-to-r from-yellow-500 to-orange-500',
    border: 'border-yellow-500/20',
    text: 'text-white',
    icon: 'text-white',
  },
  info: {
    bg: 'bg-gradient-to-r from-blue-500 to-purple-500',
    border: 'border-blue-500/20',
    text: 'text-white',
    icon: 'text-white',
  },
}

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: () => void }) {
  const Icon = toastIcons[toast.type]
  const styles = toastStyles[toast.type]

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 50, scale: 0.3 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
      className={cn(
        'relative overflow-hidden rounded-2xl border shadow-lg backdrop-blur-sm p-4 max-w-md',
        styles.bg,
        styles.border
      )}
    >
      {/* Background effects */}
      <div className="absolute inset-0 bg-white/10 backdrop-blur-sm" />
      <div className="absolute top-0 left-0 w-full h-1 bg-white/20" />
      
      <div className="relative flex items-start gap-3">
        {/* Icon or Emoji */}
        <div className="flex-shrink-0 mt-0.5">
          {toast.emoji ? (
            <span className="text-xl">{toast.emoji}</span>
          ) : (
            <Icon className={cn('h-5 w-5', styles.icon)} />
          )}
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className={cn('font-semibold text-sm', styles.text)}>
            {toast.title}
          </p>
          {toast.description && (
            <p className={cn('text-xs mt-1 opacity-90', styles.text)}>
              {toast.description}
            </p>
          )}
        </div>
        
        {/* Close button */}
        <motion.button
          onClick={onRemove}
          className={cn(
            'flex-shrink-0 p-1 rounded-full hover:bg-white/20 transition-colors',
            styles.text
          )}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <X className="h-4 w-4" />
        </motion.button>
      </div>
    </motion.div>
  )
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const showToast = (toast: Omit<Toast, 'id'>) => {
    const id = Date.now().toString()
    const newToast = { ...toast, id }
    
    setToasts((prev) => [...prev, newToast])
    
    // Auto remove after duration
    const duration = toast.duration || 5000
    setTimeout(() => {
      removeToast(id)
    }, duration)

    // Haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate?.(toast.type === 'error' ? [100, 50, 100] : [50])
    }
  }

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }

  return (
    <ToastContext.Provider value={{ toasts, showToast, removeToast }}>
      {children}
      
      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-[100] space-y-2">
        <AnimatePresence mode="popLayout">
          {toasts.map((toast) => (
            <ToastItem
              key={toast.id}
              toast={toast}
              onRemove={() => removeToast(toast.id)}
            />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

// Convenience hooks for different toast types
export const useSuccessToast = () => {
  const { showToast } = useToast()
  return (title: string, description?: string, emoji?: string) =>
    showToast({ type: 'success', title, description, emoji })
}

export const useErrorToast = () => {
  const { showToast } = useToast()
  return (title: string, description?: string, emoji?: string) =>
    showToast({ type: 'error', title, description, emoji })
}

export const useWarningToast = () => {
  const { showToast } = useToast()
  return (title: string, description?: string, emoji?: string) =>
    showToast({ type: 'warning', title, description, emoji })
}

export const useInfoToast = () => {
  const { showToast } = useToast()
  return (title: string, description?: string, emoji?: string) =>
    showToast({ type: 'info', title, description, emoji })
}