import { Variants } from 'framer-motion'

export const messyGridVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      type: 'spring',
      stiffness: 260,
      damping: 20,
    },
  },
}

export const messyGridItemVariants: Variants = {
  hidden: { opacity: 0, x: -50, rotate: 0 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    // margin: i <= 2 ? 0 : -16,
    rotate: i % 2 === 0 ? 6 : -6,
    transition: {
      delay: i * 0.1,
      duration: 0.25,
    },
  }),
}
export const mansoryGridVariants: Variants = {
  hidden: {
    // spacing: -100,
  },
  visible: {
    // spacing: -100,
  },
}
export const mansoryGridItemVariants: Variants = {
  hidden: { opacity: 0, y: 50, rotate: 0 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    marginTop: i === 0 ? 0 : 16,
    transition: {
      delay: i * 0.1,
      duration: 0.25,
    },
  }),
}
