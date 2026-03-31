// AI 추천 엔진 - 가중치 점수 계산 + LLM 자연어 생성

import { getLLMClient, RecommendationInput } from './llm-client'
import { calculatePremium } from './calculator'

export interface ClientProfile {
  age: number
  gender: 'M' | 'F'
  occupation?: string
  healthCondition?: string
  incomeLevel?: 'low' | 'mid' | 'high'
  priorities?: {
    cancer?: number    // 암 보장 우선순위 (0-10)
    brain?: number     // 뇌 보장 우선순위
    heart?: number     // 심장 보장 우선순위
    hospitalBed?: number // 입원일당
    premium?: number   // 보험료 부담 (낮을수록 선호)
    renewal?: number   // 비갱신 선호 (높을수록 비갱신 선호)
  }
}

export interface ProductWithCoverages {
  id: string
  productName: string
  category: string
  premiumBase: number
  renewalType: string
  paymentPeriod: number
  coveragePeriod: number
  minAge: number
  maxAge: number
  company: { name: string }
  coverages: {
    coverageName: string
    amount: number
    unit: string
    isOptional: boolean
    riderPremium: number | null
    category: string | null
  }[]
}

export interface ScoredProduct {
  product: ProductWithCoverages
  aiScore: number
  aiRank: number
  aiReason: string
  monthlyPremium: number
  scoreBreakdown: {
    coverageScore: number
    premiumScore: number
    renewalScore: number
    ageScore: number
  }
}

// 가중치 점수 계산
function calculateWeightedScore(
  product: ProductWithCoverages,
  profile: ClientProfile
): { total: number; breakdown: ScoredProduct['scoreBreakdown'] } {
  const priorities = profile.priorities || {
    cancer: 7, brain: 6, heart: 6, hospitalBed: 5, premium: 5, renewal: 6,
  }

  // 보장 점수 계산
  let coverageScore = 0
  const coverageMap: Record<string, number> = {}

  for (const cov of product.coverages) {
    if (cov.isOptional) continue
    const cat = cov.category?.toLowerCase() || ''
    const name = cov.coverageName

    if (cat === '암' || name.includes('암')) {
      coverageMap['cancer'] = Math.max(coverageMap['cancer'] || 0, cov.amount)
    }
    if (cat === '뇌' || name.includes('뇌')) {
      coverageMap['brain'] = Math.max(coverageMap['brain'] || 0, cov.amount)
    }
    if (cat === '심장' || name.includes('심근')) {
      coverageMap['heart'] = Math.max(coverageMap['heart'] || 0, cov.amount)
    }
  }

  // 보장금액을 점수로 변환 (3천만 기준 100점)
  const cancerScore = Math.min(100, ((coverageMap['cancer'] || 0) / 30000000) * 100)
  const brainScore = Math.min(100, ((coverageMap['brain'] || 0) / 20000000) * 100)
  const heartScore = Math.min(100, ((coverageMap['heart'] || 0) / 20000000) * 100)

  coverageScore =
    cancerScore * (priorities.cancer || 7) * 0.1 +
    brainScore * (priorities.brain || 6) * 0.1 +
    heartScore * (priorities.heart || 6) * 0.1

  // 보험료 점수 (월 10만원 기준, 낮을수록 높은 점수)
  const monthlyPremium = calculatePremium(product.premiumBase, {
    age: profile.age,
    gender: profile.gender,
    paymentPeriod: product.paymentPeriod,
  })
  const premiumScore = Math.max(0, 100 - (monthlyPremium / 200000) * 100)

  // 갱신형 점수 (비갱신형 선호)
  const renewalScore =
    product.renewalType === 'NON_RENEWABLE' ? 100 :
    product.renewalType === 'MIXED' ? 60 : 20

  // 나이 적합도 점수
  const ageScore = profile.age >= product.minAge && profile.age <= product.maxAge ? 100 : 0

  const total =
    coverageScore * 0.4 +
    premiumScore * (priorities.premium || 5) * 0.01 * 0.3 +
    renewalScore * (priorities.renewal || 6) * 0.01 * 0.2 +
    ageScore * 0.1

  return {
    total: Math.min(100, Math.round(total * 10) / 10),
    breakdown: {
      coverageScore: Math.round(coverageScore),
      premiumScore: Math.round(premiumScore),
      renewalScore: Math.round(renewalScore),
      ageScore,
    },
  }
}

// 메인 추천 함수
export async function generateRecommendations(
  products: ProductWithCoverages[],
  profile: ClientProfile
): Promise<ScoredProduct[]> {
  // 1단계: 가중치 점수 계산 (빠른 DB 쿼리만)
  const scored = products
    .map((product) => {
      const { total, breakdown } = calculateWeightedScore(product, profile)
      const monthlyPremium = calculatePremium(product.premiumBase, {
        age: profile.age,
        gender: profile.gender,
        paymentPeriod: product.paymentPeriod,
      })
      return { product, aiScore: total, monthlyPremium, scoreBreakdown: breakdown }
    })
    .filter((s) => s.scoreBreakdown.ageScore > 0)
    .sort((a, b) => b.aiScore - a.aiScore)
    .slice(0, 3)

  // 2단계: LLM 자연어 추천 이유 생성
  const llmInput: RecommendationInput = {
    clientAge: profile.age,
    clientGender: profile.gender,
    occupation: profile.occupation,
    healthCondition: profile.healthCondition,
    incomeLevel: profile.incomeLevel,
    topProducts: scored.map((s) => ({
      productName: s.product.productName,
      companyName: s.product.company.name,
      category: s.product.category,
      aiScore: s.aiScore,
      keyCoverages: s.product.coverages
        .filter((c) => !c.isOptional)
        .slice(0, 3)
        .map((c) => c.coverageName),
      monthlyPremium: s.monthlyPremium,
    })),
  }

  const llmClient = getLLMClient()
  let reasons: Record<string, string> = {}
  try {
    reasons = await llmClient.generateRecommendation(llmInput)
  } catch (e) {
    console.error('LLM 추천 생성 실패:', e)
  }

  return scored.map((s, idx) => ({
    ...s,
    aiRank: idx + 1,
    aiReason: reasons[`product${idx + 1}_reason`] || '고객 프로필 분석 기반 추천 상품입니다.',
  }))
}
