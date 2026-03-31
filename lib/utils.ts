import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  if (amount >= 100000000) return `${(amount / 100000000).toFixed(0)}억원`
  if (amount >= 10000) return `${(amount / 10000).toFixed(0)}만원`
  return `${amount.toLocaleString()}원`
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('ko-KR', {
    year: 'numeric', month: '2-digit', day: '2-digit',
  })
}

export function getCategoryLabel(category: string): string {
  const map: Record<string, string> = {
    LIFE: '종신보험', CI: 'CI보험', HEALTH: '건강보험',
    ACCIDENT: '상해보험', SAVINGS: '저축보험',
  }
  return map[category] || category
}

export function getRenewalLabel(type: string): string {
  const map: Record<string, string> = {
    NON_RENEWABLE: '비갱신형', RENEWABLE: '갱신형', MIXED: '혼합형',
  }
  return map[type] || type
}

export function getCoverageLabel(years: number): string {
  return years === 999 ? '종신' : `${years}년`
}

export function getPreferredTimeLabel(time: string): string {
  const map: Record<string, string> = {
    morning: '오전 (9~12시)',
    afternoon: '오후 (12~6시)',
    evening: '저녁 (6시 이후)',
  }
  return map[time] || time
}

// 간단한 XOR 기반 텍스트 난독화 (개발용, 실제 운영 시 AES-256 사용)
export function encryptText(text: string): string {
  return Buffer.from(text).toString('base64')
}

export function decryptText(encoded: string): string {
  try {
    return Buffer.from(encoded, 'base64').toString('utf-8')
  } catch {
    return encoded
  }
}

export function maskPhone(phone: string): string {
  if (!phone) return ''
  return phone.replace(/(\d{3})-?(\d{4})-?(\d{4})/, '$1-****-$3')
}
