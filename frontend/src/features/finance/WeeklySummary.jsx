/**
 * WeeklySummary — shows a bar chart of spending by category
 * and income vs expense comparison using Recharts.
 */
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

// Colors for the chart bars
const COLORS = ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

export default function WeeklySummary({ summary }) {
  if (!summary) return null;

  // Prepare data for the category breakdown chart
  const categoryData = Object.entries(summary.by_category).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    amount: value,
  }));

  // Income vs Expense comparison
  const comparisonData = [
    { name: 'Income', amount: summary.total_income },
    { name: 'Expense', amount: summary.total_expense },
  ];

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <p className="text-xs text-green-600 font-medium">Income</p>
          <p className="text-lg font-bold text-green-700">₹{summary.total_income.toFixed(0)}</p>
        </div>
        <div className="text-center p-3 bg-red-50 rounded-lg">
          <p className="text-xs text-red-600 font-medium">Expenses</p>
          <p className="text-lg font-bold text-red-700">₹{summary.total_expense.toFixed(0)}</p>
        </div>
        <div className={`text-center p-3 rounded-lg ${summary.net >= 0 ? 'bg-blue-50' : 'bg-orange-50'}`}>
          <p className={`text-xs font-medium ${summary.net >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
            Net
          </p>
          <p className={`text-lg font-bold ${summary.net >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>
            ₹{summary.net.toFixed(0)}
          </p>
        </div>
      </div>

      {/* Income vs Expense bar chart */}
      {(summary.total_income > 0 || summary.total_expense > 0) && (
        <div>
          <p className="text-xs text-gray-500 font-medium mb-2">Income vs Expenses</p>
          <ResponsiveContainer width="100%" height={150}>
            <BarChart data={comparisonData}>
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(value) => `₹${value.toFixed(2)}`} />
              <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                <Cell fill="#10b981" />
                <Cell fill="#ef4444" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Spending by category chart */}
      {categoryData.length > 0 && (
        <div>
          <p className="text-xs text-gray-500 font-medium mb-2">Spending by Category</p>
          <ResponsiveContainer width="100%" height={150}>
            <BarChart data={categoryData} layout="vertical">
              <XAxis type="number" tick={{ fontSize: 12 }} />
              <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 12 }} />
              <Tooltip formatter={(value) => `₹${value.toFixed(2)}`} />
              <Bar dataKey="amount" radius={[0, 4, 4, 0]}>
                {categoryData.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
