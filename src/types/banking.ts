export type BankTransaction = {
  id: string
  user_id: string
  transaction_date: string
  description: string
  amount: number
  category: string | null
  cleared: boolean
  created_at: string
  running_balance: number
}

export type Bill = {
  id: string
  user_id: string
  name: string
  amount: number
  is_recurring: boolean
  due_day_of_month: number | null
  due_date: string | null
  category: string | null
  active: boolean
  created_at: string
  isPaidThisPeriod: boolean
  paidDate: string | null
}

export type BudgetCategory = {
  id: string
  user_id: string
  category_name: string
  monthly_budget: number
  created_at: string
  spentThisMonth: number
}

export type Debt = {
  id: string
  user_id: string
  name: string
  balance: number
  interest_rate: number | null
  minimum_payment: number
  created_at: string
  updated_at: string
}

export type PayoffPlan = {
  monthsToPayoff: number
  totalInterestPaid: number
  payoffOrder: string[]
} | null

export type DebtPayoffResult = {
  totalBalance?: number
  totalMinimums?: number
  extraMonthly?: number
  hasAllInterestRates?: boolean
  avalanche?: PayoffPlan
  snowball?: PayoffPlan
  summary?: string | null
  note?: string
}
