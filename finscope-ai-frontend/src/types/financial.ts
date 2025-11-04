export interface FinancialRecord {
  user_email: string
  income: number
  expenses: number
  savings: number
  category: string
  description?: string
  date: string
}

export interface HistoryFilters {
  user_email?: string
  start_date?: string
  end_date?: string
}
