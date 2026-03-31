// 카카오 알림톡 발송 (모집인 알림·상담요청 공통)
// 실제 운영 시 카카오비즈니스 채널 연동 필요

export interface KakaoNotifyPayload {
  to: string      // 수신 전화번호
  templateCode: string
  variables: Record<string, string>
}

export async function sendKakaoAlimtalk(payload: KakaoNotifyPayload): Promise<boolean> {
  // 카카오 API 키가 없으면 콘솔 로그만
  if (!process.env.KAKAO_CLIENT_ID) {
    console.log('[카카오 알림톡 시뮬레이션]', JSON.stringify(payload, null, 2))
    return true
  }

  // 실제 카카오 비즈니스 API 연동 (Phase 4)
  // TODO: 카카오 알림톡 API 연동
  console.log('[카카오 알림톡]', payload.to, payload.templateCode)
  return true
}

// 상담 요청 알림 (모집인에게)
export async function notifyConsultationRequest({
  agentPhone,
  agentName,
  clientName,
  productName,
  premium,
  preferredTime,
  requestedAt,
}: {
  agentPhone: string
  agentName: string
  clientName: string
  productName: string
  premium?: number
  preferredTime: string
  requestedAt: Date
}) {
  const timeLabels: Record<string, string> = {
    morning: '오전 9~12시',
    afternoon: '오후 12~6시',
    evening: '오후 6시 이후',
  }

  const message = `[InsureComp Pro] 가입 상담 요청 알림

고객명: ${clientName} 고객님
요청 상품: ${productName}
예상 보험료: 약 ${premium ? premium.toLocaleString() + '원' : '상담 후 결정'}
희망 연락: ${timeLabels[preferredTime] || preferredTime}
요청 시각: ${requestedAt.toLocaleString('ko-KR')}

▶ 상담 관리 바로가기`

  console.log(`[${agentName}] 알림: ${message}`)

  return sendKakaoAlimtalk({
    to: agentPhone,
    templateCode: 'CONSULT_REQUEST_01',
    variables: {
      '#{모집인명}': agentName,
      '#{고객명}': clientName,
      '#{상품명}': productName,
      '#{희망연락}': timeLabels[preferredTime] || preferredTime,
    },
  })
}

// 제안서 이동 알림 (모집인에게)
export async function notifyProposalViewed({
  agentPhone,
  agentName,
  clientName,
  proposalTitle,
}: {
  agentPhone: string
  agentName: string
  clientName: string
  proposalTitle: string
}) {
  return sendKakaoAlimtalk({
    to: agentPhone,
    templateCode: 'PROPOSAL_VIEWED_01',
    variables: {
      '#{모집인명}': agentName,
      '#{고객명}': clientName,
      '#{제안서명}': proposalTitle,
    },
  })
}
