// Reads the details of one SEC Form D filing (its XML document).
// Form D gives the issuer, industry, amounts and state — never the investors.
import { XMLParser } from 'fast-xml-parser'

export interface FormDDetails {
  company: string
  industry: string | null
  fundType: string | null
  isFund: boolean
  isAmendment: boolean
  offeringTotal: number | null // null when "Indefinite"
  amountSold: number | null
  state: string | null
  firstSaleOn: string | null
  filedOn: string | null
}

const parser = new XMLParser({ ignoreAttributes: true, parseTagValue: false, trimValues: true })

function num(v: unknown): number | null {
  if (v == null) return null
  const n = Number(String(v).replace(/[^0-9.]/g, ''))
  return Number.isFinite(n) && String(v).trim() !== '' && !/indefinite/i.test(String(v)) ? n : null
}

function str(v: unknown): string | null {
  if (v == null || typeof v === 'object') return null
  const s = String(v).trim()
  return s || null
}

export function parseFormD(xml: string): FormDDetails | null {
  const doc = parser.parse(xml)?.edgarSubmission
  if (!doc) return null
  const issuer = doc.primaryIssuer ?? {}
  const offering = doc.offeringData ?? {}
  const group = offering.industryGroup ?? {}
  const amounts = offering.offeringSalesAmounts ?? {}
  const filing = offering.typeOfFiling ?? {}
  const firstSale = filing.dateOfFirstSale ?? {}

  const industry = str(group.industryGroupType)
  const fundType = str(group.investmentFundInfo?.investmentFundType)
  const company = str(issuer.entityName)
  if (!company) return null

  return {
    company,
    industry,
    fundType,
    isFund: industry === 'Pooled Investment Fund',
    isAmendment: String(filing.newOrAmendment?.isAmendment ?? 'false').toLowerCase() === 'true',
    offeringTotal: num(amounts.totalOfferingAmount),
    amountSold: num(amounts.totalAmountSold),
    state: str(issuer.issuerAddress?.stateOrCountry),
    firstSaleOn: str(firstSale.value),
    filedOn: str(doc.signatureBlock?.signature?.signatureDate) ?? null,
  }
}

export { formatUsd } from '../src/lib/format'
