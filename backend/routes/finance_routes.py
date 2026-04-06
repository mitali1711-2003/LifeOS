"""
Finance API routes — handles all HTTP requests for /api/finance.
"""
from flask import Blueprint, request, jsonify
from database import get_db
from models.finance import (
    get_transactions, create_transaction, delete_transaction, get_summary
)

finance_bp = Blueprint("finance", __name__, url_prefix="/api/finance")


@finance_bp.route("/transactions", methods=["GET"])
def list_transactions():
    """
    GET /api/finance/transactions?type=expense&category=food&from=2026-04-01&to=2026-04-06
    Returns transactions, optionally filtered.
    """
    # Read optional query parameters from the URL
    filters = {
        "type": request.args.get("type"),
        "category": request.args.get("category"),
        "from": request.args.get("from"),
        "to": request.args.get("to"),
    }

    db = get_db()
    transactions = get_transactions(db, filters)
    db.close()
    return jsonify(transactions)


@finance_bp.route("/transactions", methods=["POST"])
def add_transaction():
    """
    POST /api/finance/transactions
    Create a new transaction. Expects JSON with: type, category, amount, date.
    """
    data = request.get_json()

    # Validate required fields
    if not data:
        return jsonify({"error": "Request body is required"}), 400

    required = ["type", "category", "amount", "date"]
    for field in required:
        if not data.get(field):
            return jsonify({"error": f"'{field}' is required"}), 400

    # Validate type
    if data["type"] not in ("income", "expense"):
        return jsonify({"error": "Type must be 'income' or 'expense'"}), 400

    # Validate amount
    try:
        data["amount"] = float(data["amount"])
        if data["amount"] <= 0:
            raise ValueError()
    except (ValueError, TypeError):
        return jsonify({"error": "Amount must be a positive number"}), 400

    db = get_db()
    transaction = create_transaction(db, data)
    db.close()
    return jsonify(transaction), 201


@finance_bp.route("/transactions/<int:txn_id>", methods=["DELETE"])
def remove_transaction(txn_id):
    """DELETE /api/finance/transactions/:id — Delete a transaction."""
    db = get_db()
    deleted = delete_transaction(db, txn_id)
    db.close()

    if deleted:
        return jsonify({"message": "Transaction deleted"})
    else:
        return jsonify({"error": "Transaction not found"}), 404


@finance_bp.route("/summary", methods=["GET"])
def weekly_summary():
    """
    GET /api/finance/summary?from=2026-03-30&to=2026-04-06
    Returns income/expense totals, category breakdown, and a budget tip.
    Defaults to the current week if no dates provided.
    """
    from_date = request.args.get("from")
    to_date = request.args.get("to")

    db = get_db()
    summary = get_summary(db, from_date, to_date)
    db.close()
    return jsonify(summary)
