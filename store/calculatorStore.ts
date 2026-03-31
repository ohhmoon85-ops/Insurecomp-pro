import { create } from 'zustand'

interface CalculatorStore {
  age: number
  gender: 'M' | 'F'
  paymentPeriod: number
  includeOptional: boolean
  setAge: (age: number) => void
  setGender: (gender: 'M' | 'F') => void
  setPaymentPeriod: (period: number) => void
  setIncludeOptional: (include: boolean) => void
}

export const useCalculatorStore = create<CalculatorStore>((set) => ({
  age: 35,
  gender: 'M',
  paymentPeriod: 20,
  includeOptional: false,
  setAge: (age) => set({ age }),
  setGender: (gender) => set({ gender }),
  setPaymentPeriod: (paymentPeriod) => set({ paymentPeriod }),
  setIncludeOptional: (includeOptional) => set({ includeOptional }),
}))
