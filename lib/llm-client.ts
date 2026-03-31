// LLM 추상화 레이어 - GPT-4o / Claude / Gemini 교체 가능

export interface RecommendationInput {
  clientAge: number
  clientGender: string
  occupation?: string
  healthCondition?: string
  incomeLevel?: string
  topProducts: {
    productName: string
    companyName: string
    category: string
    aiScore: number
    keyCoverages: string[]
    monthlyPremium: number
  }[]
}

export interface LLMClient {
  generateRecommendation(input: RecommendationInput): Promise<Record<string, string>>
}

// OpenAI GPT-4o 클라이언트
class OpenAIClient implements LLMClient {
  async generateRecommendation(input: RecommendationInput): Promise<Record<string, string>> {
    const { default: OpenAI } = await import('openai')
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

    const prompt = buildPrompt(input)
    const response = await client.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
    })

    const content = response.choices[0].message.content || '{}'
    return JSON.parse(content)
  }
}

// Anthropic Claude 클라이언트
class AnthropicClient implements LLMClient {
  async generateRecommendation(input: RecommendationInput): Promise<Record<string, string>> {
    const Anthropic = (await import('@anthropic-ai/sdk')).default
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

    const prompt = buildPrompt(input)
    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      messages: [{ role: 'user', content: `${SYSTEM_PROMPT}\n\n${prompt}` }],
    })

    const content = (response.content[0] as any).text || '{}'
    // JSON 파싱 시도
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (jsonMatch) return JSON.parse(jsonMatch[0])
    return {}
  }
}

// 폴백 클라이언트 (API 키 없을 때 기본 텍스트 생성)
class FallbackClient implements LLMClient {
  async generateRecommendation(input: RecommendationInput): Promise<Record<string, string>> {
    const result: Record<string, string> = {}
    input.topProducts.forEach((prod, idx) => {
      const rank = idx + 1
      result[`product${rank}_reason`] =
        `${input.clientGender === 'M' ? '남성' : input.clientGender === 'F' ? '여성' : '고객'}님의 연령대(${input.clientAge}세)와 생활 패턴을 고려했을 때, ` +
        `${prod.companyName} ${prod.productName}은 ${prod.keyCoverages.slice(0, 2).join('·')} 등 ` +
        `핵심 보장을 합리적인 보험료(월 ${prod.monthlyPremium.toLocaleString()}원)로 제공합니다. ` +
        `종합 평가 점수 ${prod.aiScore.toFixed(0)}점으로 강력히 추천드립니다.`
    })
    return result
  }
}

// 프롬프트 빌더
function buildPrompt(input: RecommendationInput): string {
  const productsText = input.topProducts
    .map(
      (p, i) =>
        `추천 상품 ${i + 1}: ${p.companyName} ${p.productName} (종합점수: ${p.aiScore.toFixed(0)}점)\n` +
        `  주요보장: ${p.keyCoverages.join(', ')}\n` +
        `  월보험료: 약 ${p.monthlyPremium.toLocaleString()}원`
    )
    .join('\n\n')

  return `고객 정보:
- 나이: ${input.clientAge}세
- 성별: ${input.clientGender === 'M' ? '남성' : '여성'}
- 직업: ${input.occupation || '일반직'}
- 건강상태: ${input.healthCondition || '양호'}
- 소득 수준: ${input.incomeLevel === 'high' ? '고소득' : input.incomeLevel === 'mid' ? '중간' : '일반'}

${productsText}

위 고객에게 각 상품을 2~3문장으로 추천 이유를 작성해주세요.
반드시 JSON 형식으로만 응답하세요:
{"product1_reason": "...", "product2_reason": "...", "product3_reason": "..."}`
}

const SYSTEM_PROMPT = `당신은 10년 이상 경력의 대한민국 보험 전문 FP(Financial Planner)입니다.
고객 정보와 추천 상품 데이터를 분석하여 고객 맞춤형 추천 이유를 작성해주세요.
전문적이지만 고객이 이해하기 쉬운 언어로 작성하고, 구체적인 보장 내용과 고객 상황을 연결하여 설명하세요.
과도한 세일즈 언어보다 객관적이고 신뢰할 수 있는 표현을 사용하세요.`

// 팩토리 함수 - 환경변수에 따라 자동 선택
export function getLLMClient(): LLMClient {
  const provider = process.env.LLM_PROVIDER || 'fallback'

  if (provider === 'anthropic' && process.env.ANTHROPIC_API_KEY?.startsWith('sk-ant-')) {
    return new AnthropicClient()
  }
  if (provider === 'openai' && process.env.OPENAI_API_KEY?.startsWith('sk-')) {
    return new OpenAIClient()
  }
  return new FallbackClient()
}
