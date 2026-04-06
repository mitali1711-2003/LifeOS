/**
 * FinanceOverview — income vs expense with dark theme.
 */
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import Card from '../../components/Card';

export default function FinanceOverview({ data }) {
  if (!data) return null;

  const chartData = [
    { name: 'Income', amount: data.this_week_income },
    { name: 'Expense', amount: data.this_week_expense },
  ];

  return (
    <Card title="Weekly Finance">
      {/* Stat badges */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="text-center p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
          <p className="text-xs text-emerald-400">Income</p>
          <p className="text-base font-bold text-emerald-300 stat-number">₹{data.this_week_income.toFixed(0)}</p>
        </div>
        <div className="text-center p-3 rounded-xl bg-red-500/10 border border-red-500/20">
          <p className="text-xs text-red-400">Expenses</p>
          <p className="text-base font-bold text-red-300 stat-number">₹{data.this_week_expense.toFixed(0)}</p>
        </div>
      </div>

      {/* Bar chart */}
      {(data.this_week_income > 0 || data.this_week_expense > 0) && (
        <ResponsiveContainer width="100%" height={120}>
          <BarChart data={chartData}>
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9ca3af' }} />
            <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} />
            <Tooltip
              formatter={(value) => `₹${value.toFixed(2)}`}
              contentStyle={{ background: '#1e1e3f', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#e2e8f0' }}
            />
            <Bar dataKey="amount" radius={[6, 6, 0, 0]}>
              <Cell fill="#10b981" />
              <Cell fill="#ef4444" />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}

      {/* Budget tip */}
      {data.budget_tip && (
        <p className="text-xs text-amber-300 bg-amber-500/10 border border-amber-500/20 p-2.5 rounded-lg mt-3">
          {data.budget_tip}
        </p>
      )}
    </Card>
  );
}
