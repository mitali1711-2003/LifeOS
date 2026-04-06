/**
 * TransactionList — displays a table of all transactions.
 * Income rows are green-tinted, expense rows are red-tinted.
 */
import { apiDelete } from '../../api/client';

export default function TransactionList({ transactions, onRefresh }) {
  const handleDelete = async (txnId) => {
    if (!window.confirm('Delete this transaction?')) return;
    try {
      await apiDelete(`/finance/transactions/${txnId}`);
      onRefresh();
    } catch (err) {
      console.error('Failed to delete transaction:', err);
    }
  };

  if (transactions.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <p className="text-4xl mb-3">💸</p>
        <p className="text-sm">No transactions yet. Add one above!</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-gray-500 border-b border-gray-100">
            <th className="py-2 px-3 font-medium">Date</th>
            <th className="py-2 px-3 font-medium">Type</th>
            <th className="py-2 px-3 font-medium">Category</th>
            <th className="py-2 px-3 font-medium">Amount</th>
            <th className="py-2 px-3 font-medium">Description</th>
            <th className="py-2 px-3 font-medium"></th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((txn) => (
            <tr
              key={txn.id}
              className={`border-b border-gray-50 ${
                txn.type === 'income' ? 'bg-green-50/50' : 'bg-red-50/50'
              }`}
            >
              <td className="py-2.5 px-3 text-gray-600">{txn.date}</td>
              <td className="py-2.5 px-3">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                  txn.type === 'income'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
                }`}>
                  {txn.type}
                </span>
              </td>
              <td className="py-2.5 px-3 text-gray-600 capitalize">{txn.category}</td>
              <td className={`py-2.5 px-3 font-medium ${
                txn.type === 'income' ? 'text-green-600' : 'text-red-600'
              }`}>
                {txn.type === 'income' ? '+' : '-'}₹{txn.amount.toFixed(2)}
              </td>
              <td className="py-2.5 px-3 text-gray-500">{txn.description || '—'}</td>
              <td className="py-2.5 px-3">
                <button
                  onClick={() => handleDelete(txn.id)}
                  className="text-gray-300 hover:text-red-500 transition-colors"
                  title="Delete"
                >
                  ✕
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
