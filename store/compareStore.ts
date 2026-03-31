import { create } from 'zustand'

export interface ProductSummary {
  id: string
  productName: string
  category: string
  premiumBase: number
  renewalType: string
  paymentPeriod: number
  coveragePeriod: number
  company: { name: string; logoUrl: string | null }
  coverages: {
    id: string
    coverageName: string
    amount: number
    unit: string
    isOptional: boolean
    riderPremium: number | null
    category: string | null
  }[]
}

interface CompareStore {
  selectedProducts: ProductSummary[]
  addProduct: (product: ProductSummary) => void
  removeProduct: (productId: string) => void
  clearProducts: () => void
  isSelected: (productId: string) => boolean
}

export const useCompareStore = create<CompareStore>((set, get) => ({
  selectedProducts: [],

  addProduct: (product) => {
    const { selectedProducts } = get()
    if (selectedProducts.length >= 4) return
    if (selectedProducts.find((p) => p.id === product.id)) return
    set({ selectedProducts: [...selectedProducts, product] })
  },

  removeProduct: (productId) => {
    set({ selectedProducts: get().selectedProducts.filter((p) => p.id !== productId) })
  },

  clearProducts: () => set({ selectedProducts: [] }),

  isSelected: (productId) => get().selectedProducts.some((p) => p.id === productId),
}))
