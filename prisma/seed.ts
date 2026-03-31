import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // GA 생성
  const ga = await prisma.gA.upsert({
    where: { id: 'ga-001' },
    update: {},
    create: {
      id: 'ga-001',
      name: 'InsureComp Pro GA',
      brandColor: '#2563EB',
      phone: '02-1234-5678',
    },
  })

  // GA 관리자 생성
  const adminPw = await bcrypt.hash('admin1234', 10)
  await prisma.user.upsert({
    where: { email: 'admin@insurecomp.kr' },
    update: {},
    create: {
      name: 'GA 관리자',
      email: 'admin@insurecomp.kr',
      password: adminPw,
      role: 'GA_ADMIN',
      gaId: ga.id,
    },
  })

  // 모집인 생성
  const agentPw = await bcrypt.hash('agent1234', 10)
  const agent = await prisma.user.upsert({
    where: { email: 'agent@insurecomp.kr' },
    update: {},
    create: {
      id: 'agent-001',
      name: '김모집',
      email: 'agent@insurecomp.kr',
      password: agentPw,
      role: 'AGENT',
      licenseNo: 'FC-2024-001234',
      phone: '010-1234-5678',
      gaId: ga.id,
    },
  })

  // 보험회사 생성
  const companies = await Promise.all([
    prisma.insuranceCompany.upsert({
      where: { id: 'company-001' },
      update: {},
      create: { id: 'company-001', name: '삼성생명', ratingGrade: 'AAA' },
    }),
    prisma.insuranceCompany.upsert({
      where: { id: 'company-002' },
      update: {},
      create: { id: 'company-002', name: '한화생명', ratingGrade: 'AA+' },
    }),
    prisma.insuranceCompany.upsert({
      where: { id: 'company-003' },
      update: {},
      create: { id: 'company-003', name: '교보생명', ratingGrade: 'AAA' },
    }),
    prisma.insuranceCompany.upsert({
      where: { id: 'company-004' },
      update: {},
      create: { id: 'company-004', name: '현대해상', ratingGrade: 'AA' },
    }),
  ])

  // 보험 상품 생성
  const products = [
    {
      id: 'prod-001',
      companyId: companies[0].id,
      productName: '삼성생명 무배당 통합보험',
      category: 'CI',
      premiumBase: 89000,
      renewalType: 'NON_RENEWABLE',
      paymentPeriod: 20,
      coveragePeriod: 999,
      minAge: 0,
      maxAge: 60,
      description: '3대 질병(암·뇌·심장)을 중점 보장하는 종신형 통합보험',
    },
    {
      id: 'prod-002',
      companyId: companies[1].id,
      productName: '한화생명 암보험 플러스',
      category: 'HEALTH',
      premiumBase: 52000,
      renewalType: 'RENEWABLE',
      paymentPeriod: 10,
      coveragePeriod: 10,
      minAge: 15,
      maxAge: 70,
      description: '암 진단비 및 항암 치료비 특화 상품',
    },
    {
      id: 'prod-003',
      companyId: companies[2].id,
      productName: '교보생명 든든한종신보험',
      category: 'LIFE',
      premiumBase: 120000,
      renewalType: 'NON_RENEWABLE',
      paymentPeriod: 20,
      coveragePeriod: 999,
      minAge: 0,
      maxAge: 55,
      description: '사망보장과 3대 질병 보장을 결합한 종신보험',
    },
    {
      id: 'prod-004',
      companyId: companies[3].id,
      productName: '현대해상 굿앤굿어린이CI',
      category: 'CI',
      premiumBase: 43000,
      renewalType: 'NON_RENEWABLE',
      paymentPeriod: 15,
      coveragePeriod: 999,
      minAge: 0,
      maxAge: 30,
      description: '어린이 전용 CI보험, 태아부터 가입 가능',
    },
  ]

  for (const prod of products) {
    await prisma.product.upsert({
      where: { id: prod.id },
      update: {},
      create: prod,
    })
  }

  // 보장 항목 (Coverage) 생성
  const coverageData = [
    // 삼성생명 무배당 통합보험
    { productId: 'prod-001', coverageName: '일반암 진단비', amount: 30000000, category: '암' },
    { productId: 'prod-001', coverageName: '유사암 진단비', amount: 5000000, category: '암' },
    { productId: 'prod-001', coverageName: '뇌졸중 진단비', amount: 20000000, category: '뇌' },
    { productId: 'prod-001', coverageName: '급성심근경색 진단비', amount: 20000000, category: '심장' },
    { productId: 'prod-001', coverageName: '입원일당', amount: 30000, unit: '일', category: '입원' },
    { productId: 'prod-001', coverageName: '항암방사선·약물치료비', amount: 5000000, isOptional: true, riderPremium: 8000, category: '치료' },
    // 한화생명 암보험 플러스
    { productId: 'prod-002', coverageName: '일반암 진단비', amount: 50000000, category: '암' },
    { productId: 'prod-002', coverageName: '유사암 진단비', amount: 10000000, category: '암' },
    { productId: 'prod-002', coverageName: '항암치료비', amount: 10000000, category: '치료' },
    { productId: 'prod-002', coverageName: '암수술비', amount: 3000000, category: '수술' },
    { productId: 'prod-002', coverageName: '암입원일당', amount: 50000, unit: '일', category: '입원' },
    // 교보생명 든든한종신보험
    { productId: 'prod-003', coverageName: '사망보험금', amount: 100000000, category: '사망' },
    { productId: 'prod-003', coverageName: '일반암 진단비', amount: 20000000, category: '암' },
    { productId: 'prod-003', coverageName: '뇌졸중 진단비', amount: 20000000, category: '뇌' },
    { productId: 'prod-003', coverageName: '급성심근경색 진단비', amount: 20000000, category: '심장' },
    { productId: 'prod-003', coverageName: '재해입원일당', amount: 20000, unit: '일', category: '입원', isOptional: true, riderPremium: 5000 },
    // 현대해상 어린이CI
    { productId: 'prod-004', coverageName: '일반암 진단비', amount: 20000000, category: '암' },
    { productId: 'prod-004', coverageName: '백혈병 진단비', amount: 30000000, category: '암' },
    { productId: 'prod-004', coverageName: '뇌졸중 진단비', amount: 10000000, category: '뇌' },
    { productId: 'prod-004', coverageName: '선천성이상아특약', amount: 5000000, isOptional: true, riderPremium: 3000, category: '선천성' },
    { productId: 'prod-004', coverageName: '어린이입원일당', amount: 30000, unit: '일', category: '입원' },
  ]

  for (let i = 0; i < coverageData.length; i++) {
    const cov = coverageData[i]
    await prisma.coverage.upsert({
      where: { id: `cov-${String(i + 1).padStart(3, '0')}` },
      update: {},
      create: { id: `cov-${String(i + 1).padStart(3, '0')}`, ...cov, sortOrder: i },
    })
  }

  console.log('✅ Seeding complete!')
  console.log('  - GA:', ga.name)
  console.log('  - Admin:', 'admin@insurecomp.kr / admin1234')
  console.log('  - Agent:', 'agent@insurecomp.kr / agent1234')
  console.log('  - Companies:', companies.length)
  console.log('  - Products:', products.length)
  console.log('  - Coverages:', coverageData.length)
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
