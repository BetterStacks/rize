'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface FormCardProps {
  title: string
  description: string
  children: ReactNode
  className?: string
}

export function FormCard({ title, description, children, className }: FormCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`px-4 ${className || ''}`}
    >
      <Card className="bg-white w-full mt-6 shadow-xl dark:bg-dark-bg border border-neutral-300/60 dark:border-dark-border/80 rounded-3xl">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-medium dark:text-white">
            {title}
          </CardTitle>
          <CardDescription className="text-left leading-snug">
            {description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {children}
        </CardContent>
      </Card>
    </motion.div>
  )
}