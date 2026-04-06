/**
 * Finance Page — the main page for the Finance Tracker feature.
 * Composes: TransactionForm, WeeklySummary, BudgetTip, TransactionList.
 */
import { useState, useEffect } from 'react';
import { apiGet } from '../api/client';
import Card from '../components/Card';
import TransactionForm from '../features/finance/TransactionForm';
import TransactionList from '../features/finance/TransactionList';
import WeeklySummary from '../features/finance/WeeklySummary';
import BudgetTip from '../features/finance/BudgetTip';

export default function Finance() {
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch both transactions and summary
  const fetchData = async () => {
    try {
      const [txns, sum] = await Promise.all([
        apiGet('/finance/transactions'),
        apiGet('/finance/summary'),
      ]);
      setTransactions(txns);
      setSummary(sum);
    } catch (err) {
      console.error('Failed to fetch finance data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Finance Tracker</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Add transaction form (left) */}
        <Card title="Add Transaction">
          <TransactionForm onTransactionAdded={fetchData} />
        </Card>

        {/* Weekly summary chart (middle) */}
        <Card title="This Week" className="lg:col-span-2">
          {loading ? (
            <p className="text-gray-400 text-sm">Loading...</p>
          ) : (
            <WeeklySummary summary={summary} />
          )}
        </Card>
      </div>

      {/* Budget tip */}
      {summary && <div className="mb-6"><BudgetTip tip={summary.budget_tip} /></div>}

      {/* Transaction history */}
      <Card title="Transaction History">
        {loading ? (
          <p className="text-gray-400 text-sm">Loading...</p>
        ) : (
          <TransactionList transactions={transactions} onRefresh={fetchData} />
        )}
      </Card>
    </div>
  );
}
