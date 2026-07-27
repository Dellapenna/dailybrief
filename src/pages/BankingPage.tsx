import Disclosure from '@/components/Disclosure'
import { Wallet, Receipt, PieChart, TrendingDown } from 'lucide-react'
import RegisterCard from '@/features/banking/RegisterCard'
import BillsCard from '@/features/banking/BillsCard'
import BudgetCard from '@/features/banking/BudgetCard'
import DebtPayoffCard from '@/features/banking/DebtPayoffCard'

/**
 * Banking — manual entry only, like a paper checkbook register, not
 * real bank sync (Plaid-style linking), per direct request. Four
 * sections: the register itself, bills with due dates, budget vs
 * actual spending (pulled from the register's own categories), and a
 * real per-debt payoff calculator (genuine amortization math, not
 * AI-estimated — see debt-payoff.ts) that works even with just balance
 * + minimum payment, no interest rate required, per direct request.
 */
export default function BankingPage() {
  return (
    <div>
      <h1 className="font-display text-2xl font-semibold tracking-tight text-rdp-text">Banking</h1>
      <p className="mt-1 text-sm text-rdp-text-dim">Track it. Plan it. Pay it down.</p>

      <div className="mt-5 space-y-3">
        <Disclosure title="Register" subtitle="Manual entry, running balance" icon={Wallet} defaultOpen>
          <RegisterCard />
        </Disclosure>

        <Disclosure title="Bills" subtitle="Due dates, mark as paid" icon={Receipt} defaultOpen>
          <BillsCard />
        </Disclosure>

        <Disclosure title="Budget" subtitle="Planned vs. actual, by category" icon={PieChart}>
          <BudgetCard />
        </Disclosure>

        <Disclosure title="Debt Payoff" subtitle="Real avalanche/snowball calculator" icon={TrendingDown} defaultOpen>
          <DebtPayoffCard />
        </Disclosure>
      </div>
    </div>
  )
}
