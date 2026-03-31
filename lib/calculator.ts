// 보험료 계산 핵심 로직
// Phase 2: 표준 가이드 보험료 (나이·성별 기준)
// Phase 4: 실납입 보험료 고도화 (직업급수·변력 반영)

export interface PremiumInput {
  age: number
  gender: 'M' | 'F'
  paymentPeriod: number
  coverageAmount?: number
  riders?: string[]
}

// 연령 계수 (나이에 따른 위험률 가중치)
function getAgeMultiplier(age: number, gender: 'M' | 'F'): number {
  // 성별 기본 계수
  const genderBase = gender === 'M' ? 1.0 : 0.85

  // 나이별 계수 (실제 보험사 요율 근사)
  const ageFactors: Record<number, number> = {
    20: 0.6, 25: 0.7, 30: 1.0, 35: 1.3, 40: 1.7,
    45: 2.2, 50: 2.9, 55: 3.8, 60: 5.0, 65: 6.5, 70: 8.5,
  }

  // 가장 가까운 나이 구간 찾기
  const ageKeys = Object.keys(ageFactors).map(Number).sort((a, b) => a - b)
  let factor = 1.0
  for (let i = 0; i < ageKeys.length; i++) {
    if (age <= ageKeys[i]) {
      factor = ageFactors[ageKeys[i]]
      break
    }
    factor = ageFactors[ageKeys[ageKeys.length - 1]]
  }

  return factor * genderBase
}

// 납입기간 계수 (단기납일수록 월납 보험료 높음)
function getPaymentPeriodMultiplier(years: number): number {
  if (years <= 10) return 2.0
  if (years <= 15) return 1.5
  if (years <= 20) return 1.0
  return 0.8
}

// 보험료 계산 메인 함수
export function calculatePremium(
  basePremium: number,
  input: PremiumInput,
  riderPremiums: number[] = []
): number {
  const ageMult = getAgeMultiplier(input.age, input.gender)
  const periodMult = getPaymentPeriodMultiplier(input.paymentPeriod)

  let premium = Math.round(basePremium * ageMult * periodMult)

  // 특약 보험료 합산
  const riderTotal = riderPremiums.reduce((sum, r) => sum + r, 0)
  premium += riderTotal

  // 100원 단위 반올림
  return Math.round(premium / 100) * 100
}

// 연령별 보험료 시뮬레이션 (차트용)
export function simulatePremiumByAge(
  basePremium: number,
  gender: 'M' | 'F',
  paymentPeriod: number
): { age: number; premium: number }[] {
  const ages = [25, 30, 35, 40, 45, 50, 55, 60]
  return ages.map((age) => ({
    age,
    premium: calculatePremium(basePremium, { age, gender, paymentPeriod }),
  }))
}

// 환급률 계산 (저축형 상품)
export function calculateReturnRate(
  monthlyPremium: number,
  paymentPeriod: number,
  coverageAmount: number
): number {
  const totalPaid = monthlyPremium * paymentPeriod * 12
  if (totalPaid === 0) return 0
  return Math.round((coverageAmount / totalPaid) * 100 * 10) / 10
}

export function formatCurrency(amount: number): string {
  if (amount >= 100000000) {
    return `${(amount / 100000000).toFixed(0)}억원`
  }
  if (amount >= 10000) {
    return `${(amount / 10000).toFixed(0)}만원`
  }
  return `${amount.toLocaleString()}원`
}
