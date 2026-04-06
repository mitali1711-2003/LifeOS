#!/bin/bash
# LifeOS Startup Script
# This starts both the backend and frontend servers.

echo "🚀 Starting LifeOS..."

# Start the backend (Flask API)
echo "Starting backend on http://localhost:5002..."
cd backend
python3 app.py &
BACKEND_PID=$!
cd ..

# Wait for backend to start
sleep 2

# Start the frontend (React)
echo "Starting frontend on http://localhost:3000..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "✅ LifeOS is running!"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:5002"
echo ""
echo "Press Ctrl+C to stop both servers."

# Wait for Ctrl+C and clean up
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; echo 'Stopped.'" EXIT
wait
