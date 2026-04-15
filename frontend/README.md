# 🌸 SmartFlow — Frontend

React + Vite + Tailwind CSS frontend for the SmartFlow.

## Pages

| Route        | Description                          |
|--------------|--------------------------------------|
| `/login`     | Sign in with email + password        |
| `/register`  | Create a new account                 |
| `/dashboard` | Cycle summary, charts, phase insight |
| `/log`       | Log today's symptoms                 |
| `/history`   | View and delete past logs            |

## Local Setup

```bash
cd frontend

# Install dependencies
npm install

# Set up environment
copy .env.example .env      # Windows
cp .env.example .env        # Mac/Linux

# Edit .env — make sure VITE_API_URL points to your running backend
# Default: http://localhost:8000/api

# Start dev server
npm run dev
```

App runs at: http://localhost:3000

## Build for Production

```bash
npm run build
# Output is in /dist — deploy this to Render static site
```

## Stack

- React 18
- React Router v6
- Tailwind CSS
- Recharts (charts)
- Axios (API calls)
- react-hot-toast (notifications)
- Lucide React (icons)
- date-fns (date formatting)
