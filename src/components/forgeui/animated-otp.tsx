'use client'

import { cn } from '@/lib/utils'
import { motion } from 'motion/react'
import React, { useEffect, useState } from 'react'

const digits = ['4', '8', '3', '1', '9', '7']

type AnimatedOTPProps = {
  delay?: number;
  value?: string;
  onChange?: (value: string) => void;
  length?: number;
  isInteractive?: boolean;
};

const AnimatedOTP = ({
  delay = 3500,
  value = '',
  onChange,
  length = 6,
  isInteractive = false
}: AnimatedOTPProps) => {
  const [animationKey, setAnimationKey] = useState(0)
  const delayTime = Math.max(delay, 3500)

  useEffect(() => {
    if (!isInteractive) {
      const interval = setInterval(() => {
        setAnimationKey((prev) => prev + 1)
      }, delayTime)
      return () => clearInterval(interval)
    }
  }, [delayTime, isInteractive])

  if (isInteractive) {
    return <InteractiveOTPInput value={value} onChange={onChange!} length={length} />
  }

  return (
    <OTPinput key={animationKey} />
  )
}

export default AnimatedOTP

const OTPinput = () => {
  const [activeIndex, setActiveIndex] = useState(0)
  const [fadeOut, setFadeOut] = useState(false)

  useEffect(() => {
    if (activeIndex > digits.length - 1) return

    const interval = setInterval(() => {
      setActiveIndex((prev) => prev + 1)
    }, 400)

    if (activeIndex === digits.length - 1) {
      setTimeout(() => {
        setFadeOut(true)
      }, 450)
    }

    return () => clearInterval(interval)
  }, [activeIndex])

  return (
    <div
      className={cn(
        'relative',
        'flex items-center justify-center',
        'h-[14rem] w-full max-w-[350px]',
        'rounded-md border bg-neutral-50 dark:bg-neutral-900',
        'shadow-[0_3px_10px_rgb(0,0,0,0.2)]'
      )}
    >
      <div className="absolute left-1/2 top-[25%] -translate-x-1/2">
        <div className="flex w-full items-center justify-center gap-3">
          {digits.map((digit, idx) => (
            <div
              key={idx}
              className={cn(
                'relative flex h-10 w-8 cursor-default items-center justify-center rounded-md bg-gradient-to-br from-neutral-100 to-neutral-50 text-primary dark:from-neutral-800 dark:to-neutral-800',
                'shadow-[0_3px_10px_rgb(0,0,0,0.2)]'
              )}
            >
              <motion.div
                className="absolute inset-0 rounded-md border border-cyan-400"
                initial={{
                  opacity: 0,
                  scale: 1,
                  filter: 'blur(0px)'
                }}
                animate={{
                  opacity: [0, 1, 0],
                  scale: [0.85, 1.3],
                  filter: 'blur(2px)'
                }}
                transition={{
                  duration: 0.5,
                  ease: 'easeInOut',
                  delay: 2.25
                }}
                style={{
                  boxShadow: 'inset 0 0 12px rgba(34, 211, 238, 0.5)'
                }}
              />
              {activeIndex === idx && (
                <motion.div
                  key={idx}
                  layoutId="glow"
                  className="absolute inset-0 rounded-md border border-cyan-400"
                  initial={idx === 0 ? { opacity: 0, scale: 1.7 } : { scale: 1.7 }}
                  animate={idx === 0 ? { opacity: 1, scale: 1 } : { scale: 1 }}
                  transition={{
                    type: 'spring',
                    stiffness: 500,
                    damping: 30
                  }}
                  style={{
                    boxShadow: 'inset 0 0 12px rgba(34, 211, 238, 0.6)'
                  }}
                >
                  <svg
                    viewBox="0 0 20 20"
                    className="absolute inset-0 h-full w-full"
                    strokeWidth="0.4"
                  >
                    <path
                      d="M 3 19 h 14"
                      className="stroke-cyan-400 dark:stroke-cyan-500"
                    />
                  </svg>
                </motion.div>
              )}
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: fadeOut ? 0 : 1 }}
                transition={{
                  duration: fadeOut ? 0.2 : 0.3,
                  ease: 'easeInOut',
                  delay: fadeOut ? 0 : idx * 0.43
                }}
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
              >
                {digit}
              </motion.span>
            </div>
          ))}
        </div>
        
      </div>
    </div>
  )
}

const InteractiveOTPInput = ({ 
  value, 
  onChange, 
  length 
}: { value: string; onChange: (val: string) => void; length: number }) => {
  const inputs = React.useRef<(HTMLInputElement | null)[]>([])

  const handleChange = (index: number, val: string) => {
    if (!/^\d*$/.test(val)) return
    
    const newValue = value.split('')
    newValue[index] = val
    onChange(newValue.join(''))
    
    if (val && index < length - 1) {
      inputs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !value[index] && index > 0) {
      inputs.current[index - 1]?.focus()
    }
  }

  return (
    <div className="flex gap-2">
      {Array.from({ length }).map((_, i) => (
        <input
          key={i}
          ref={(el) => (inputs.current[i] = el)}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[i] || ''}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          className={cn(
            'h-12 w-10 text-center text-lg rounded-md border',
            'focus:outline-none focus:ring-2 focus:ring-cyan-400',
            'bg-neutral-50 dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700'
          )}
        />
      ))}
    </div>
  )
}