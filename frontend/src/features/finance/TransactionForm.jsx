/**
 * TransactionForm — form to add a new income or expense.
 * Has fields for type, category, amount, description, and date.
 */
import { useState } from 'react';
import { apiPost } from '../../api/client';

// Categories for expenses and income
const EXPENSE_CATEGORIES = [
  'food', 'transport', 'entertainment', 'shopping',
  'bills', 'health', 'education', 'other'
];
const INCOME_CATEGORIES = ['salary', 'freelance', 'investment', 'other'];

export default function TransactionForm({ onTransactionAdded }) {
  const today = new Date().toISOString().slice(0, 10);

  const [form, setForm] = useState({
    type: 'expense',
    category: 'food',
    amount: '',
    description: '',
    date: today,
  });
  const [loading, setLoading] = useState(false);

  // Get the right categories based on type (income vs expense)
  const categories = form.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  // Update a form field
  const handleChange = (field, value) => {
    setForm((prev) => {
      const updated = { ...prev, [field]: value };
      // Reset category when switching between income/expense
      if (field === 'type') {
        updated.category = value === 'income' ? 'salary' : 'food';
      }
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.amount || parseFloat(form.amount) <= 0) return;

    setLoading(true);
    try {
      await apiPost('/finance/transactions', {
        ...form,
        amount: parseFloat(form.amount),
      });
      // Reset form but keep the date
      setForm({ type: 'expense', category: 'food', amount: '', description: '', date: today });
      onTransactionAdded();
    } catch (err) {
      console.error('Failed to add transaction:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Type selector (Income / Expense) */}
      <div className="flex gap-2">
        {['expense', 'income'].map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => handleChange('type', type)}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
              form.type === type
                ? type === 'income'
                  ? 'bg-green-100 text-green-700 border-2 border-green-300'
                  : 'bg-red-100 text-red-700 border-2 border-red-300'
                : 'bg-gray-50 text-gray-500 border-2 border-transparent hover:bg-gray-100'
            }`}
          >
            {type === 'income' ? '📈 Income' : '📉 Expense'}
          </button>
        ))}
      </div>

      {/* Category and Amount (side by side) */}
      <div className="grid grid-cols-2 gap-3">
        <select
          value={form.category}
          onChange={(e) => handleChange('category', e.target.value)}
          className="px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </option>
          ))}
        </select>

        <input
          type="number"
          value={form.amount}
          onChange={(e) => handleChange('amount', e.target.value)}
          placeholder="Amount (₹)"
          min="0"
          step="0.01"
          className="px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          required
        />
      </div>

      {/* Description and Date (side by side) */}
      <div className="grid grid-cols-2 gap-3">
        <input
          type="text"
          value={form.description}
          onChange={(e) => handleChange('description', e.target.value)}
          placeholder="Description (optional)"
          className="px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />

        <input
          type="date"
          value={form.date}
          onChange={(e) => handleChange('date', e.target.value)}
          className="px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          required
        />
      </div>

      {/* Submit button */}
      <button
        type="submit"
        disabled={loading || !form.amount}
        className="w-full py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
      >
        {loading ? 'Adding...' : '+ Add Transaction'}
      </button>
    </form>
  );
}
