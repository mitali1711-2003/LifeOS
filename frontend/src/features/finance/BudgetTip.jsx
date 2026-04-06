/**
 * BudgetTip — displays a budget suggestion from the backend.
 * Shows in a styled card with a lightbulb icon.
 */
export default function BudgetTip({ tip }) {
  if (!tip) return null;

  return (
    <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
      <div className="flex items-start gap-3">
        <span className="text-2xl">💡</span>
        <div>
          <p className="text-sm font-medium text-amber-800">Budget Tip</p>
          <p className="text-sm text-amber-700 mt-1">{tip}</p>
        </div>
      </div>
    </div>
  );
}
