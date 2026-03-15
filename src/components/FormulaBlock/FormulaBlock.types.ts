export interface FormulaVariable {
  symbol: string
  description: string
  unit?: string
}

export interface FormulaHTMLProps {
  mode: 'html'
  html: string
  variables?: FormulaVariable[]
  source?: string
}

export interface FormulaObjectProps {
  mode: 'fraction'
  numerator: string
  denominator: string
  result?: string
  variables?: FormulaVariable[]
  source?: string
}

export type FormulaBlockProps = FormulaHTMLProps | FormulaObjectProps
