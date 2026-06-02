# Cargo Dashboard

A full-stack application for managing cargo shipments. Track and manage your cargo from a simple web interface.

## What it does

- User authentication (login/signup)
- Add and view cargo shipments
- File uploads for cargo documentation
- Dashboard to track all shipments

## Setup

### Backend

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the server:
   ```
   npm start
   ```

The backend runs on `http://localhost:8000`.

### Frontend

1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm run dev
   ```

The frontend runs on `http://localhost:3000`.

## Project Structure

- `backend/` - Node.js server with authentication and cargo routes
- `frontend/` - Next.js app with dashboard and auth pages
- `testing/` - Test files
