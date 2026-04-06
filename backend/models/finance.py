"""
Finance model — handles all database operations for income/expenses.
"""
from datetime import date, timedelta


def get_transactions(db, filters=None):
    """
    Get all transactions with optional filters.
    Filters can include: type, category, from_date, to_date.
    """
    query = "SELECT * FROM transactions WHERE 1=1"
    params = []

    if filters:
        if filters.get("type"):
            query += " AND type = ?"
            params.append(filters["type"])
        if filters.get("category"):
            query += " AND category = ?"
            params.append(filters["category"])
        if filters.get("from"):
            query += " AND date >= ?"
            params.append(filters["from"])
        if filters.get("to"):
            query += " AND date <= ?"
            params.append(filters["to"])

    query += " ORDER BY date DESC"
    rows = db.execute(query, params).fetchall()

    return [
        {
            "id": row["id"],
            "type": row["type"],
            "category": row["category"],
            "amount": row["amount"],
            "description": row["description"],
            "date": row["date"],
        }
        for row in rows
    ]


def create_transaction(db, data):
    """
    Add a new transaction (income or expense).
    data should have: type, category, amount, description, date
    """
    cursor = db.execute(
        """INSERT INTO transactions (type, category, amount, description, date)
           VALUES (?, ?, ?, ?, ?)""",
        (data["type"], data["category"], data["amount"],
         data.get("description", ""), data["date"])
    )
    db.commit()

    # Return the newly created transaction
    row = db.execute(
        "SELECT * FROM transactions WHERE id = ?",
        (cursor.lastrowid,)
    ).fetchone()

    return {
        "id": row["id"],
        "type": row["type"],
        "category": row["category"],
        "amount": row["amount"],
        "description": row["description"],
        "date": row["date"],
    }


def delete_transaction(db, txn_id):
    """
    Delete a transaction by ID.
    Returns True if found and deleted, False otherwise.
    """
    cursor = db.execute("DELETE FROM transactions WHERE id = ?", (txn_id,))
    db.commit()
    return cursor.rowcount > 0


def get_summary(db, from_date=None, to_date=None):
    """
    Get a financial summary for a date range.
    Returns total income, total expenses, net savings,
    spending by category, and a budget tip.
    """
    # Default to current week (Monday to Sunday)
    if not from_date or not to_date:
        today = date.today()
        # Find this week's Monday (weekday 0 = Monday)
        monday = today - timedelta(days=today.weekday())
        sunday = monday + timedelta(days=6)
        from_date = monday.isoformat()
        to_date = sunday.isoformat()

    # Total income for the period
    row = db.execute(
        "SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE type = 'income' AND date BETWEEN ? AND ?",
        (from_date, to_date)
    ).fetchone()
    total_income = row["total"]

    # Total expenses for the period
    row = db.execute(
        "SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE type = 'expense' AND date BETWEEN ? AND ?",
        (from_date, to_date)
    ).fetchone()
    total_expense = row["total"]

    # Expenses grouped by category
    rows = db.execute(
        """SELECT category, SUM(amount) as total
           FROM transactions
           WHERE type = 'expense' AND date BETWEEN ? AND ?
           GROUP BY category
           ORDER BY total DESC""",
        (from_date, to_date)
    ).fetchall()
    by_category = {row["category"]: row["total"] for row in rows}

    # Generate a simple budget tip
    budget_tip = generate_budget_tip(total_income, total_expense, by_category)

    return {
        "total_income": total_income,
        "total_expense": total_expense,
        "net": round(total_income - total_expense, 2),
        "by_category": by_category,
        "budget_tip": budget_tip,
        "from_date": from_date,
        "to_date": to_date,
    }


def generate_budget_tip(total_income, total_expense, by_category):
    """
    Generate a simple budget suggestion based on spending patterns.
    These are basic rules — Phase 3 will add AI-powered insights.
    """
    # If no data yet
    if total_income == 0 and total_expense == 0:
        return "Start tracking your income and expenses to get personalized tips!"

    # If no income recorded
    if total_income == 0:
        return f"You've spent ₹{total_expense:.0f} this week. Add your income to see how you're doing!"

    # Check if overspending
    expense_ratio = total_expense / total_income
    if expense_ratio > 0.8:
        return f"⚠️ You've spent {expense_ratio:.0%} of your income this week. Try to keep expenses under 80%."

    # Check if top category is too high
    if by_category:
        top_category = max(by_category, key=by_category.get)
        top_amount = by_category[top_category]
        category_ratio = top_amount / total_income
        if category_ratio > 0.4:
            return f"💡 '{top_category}' takes up {category_ratio:.0%} of your income (₹{top_amount:.0f}). Consider setting a budget for it."

    # Good savings
    savings_ratio = (total_income - total_expense) / total_income
    if savings_ratio > 0.3:
        return f"🎉 Great job! You're saving {savings_ratio:.0%} of your income this week."

    return "💰 Keep tracking your spending daily for better insights!"
