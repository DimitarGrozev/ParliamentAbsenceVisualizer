# Quick Start Guide

## Running the Application

### Option 1: Development Mode (Recommended for Development)

Run the backend and frontend separately for the best development experience with hot reload.

**Terminal 1 - Backend:**
```bash
cd backend
dotnet run
```
Backend will run at: http://localhost:5000

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
Frontend will run at: http://localhost:5173

Open http://localhost:5173 in your browser. API calls will be proxied to the backend automatically.

### Option 2: Production Mode

**Simple one-command build** - The frontend is automatically built when you build the backend:

```bash
cd backend
dotnet build --configuration Release
dotnet run --configuration Release
```

This automatically:
1. Runs `npm run build` in the frontend folder (if needed)
2. Builds the React app into `backend/wwwroot`
3. Builds the .NET backend

Open http://localhost:5000 in your browser. The backend serves both the API and the React app.

**Alternative manual build** (if you prefer to build separately):
```bash
# Step 1: Build frontend
cd frontend
npm run build

# Step 2: Run backend
cd ../backend
dotnet run --configuration Release
```

## Project Structure

```
ParliamentAbsenceVisualizer/
├── frontend/          # React app (TypeScript + Vite + MUI)
│   ├── src/          # React source code
│   └── vite.config.ts # Configured to build to ../backend/wwwroot
│
└── backend/          # .NET Web API
    ├── Controllers/  # API endpoints
    ├── Models/       # Data models (matching TypeScript types)
    ├── Services/     # Parliament API client
    ├── wwwroot/      # React build output (served as static files)
    └── Program.cs    # App configuration
```

**Note:** `npm run build` outputs directly to `backend/wwwroot`, the standard ASP.NET Core static files folder.

## API Endpoints

The backend exposes these endpoints (matching the original api.ts):

- `GET /api/v1/fn-assembly/bg` - Get current assembly
- `GET /api/v1/coll-list/bg/2` - Get all parties
- `GET /api/v1/coll-list-ns/bg` - Get all members
- `POST /api/v1/mp-absense/bg` - Get absences for date range
- `GET /images/Assembly/{id}.png` - Get member photo

All endpoints proxy to https://www.parliament.bg/api/v1/...

## Swagger API Documentation

When running in development mode, visit:
- http://localhost:5000/swagger

## How It Works

### Development Flow
```
Browser (localhost:5173)
    ↓
Vite Dev Server
    ↓ (proxies /api and /images)
.NET Backend (localhost:5000)
    ↓ (HTTP calls)
Parliament.bg API
```

### Production Flow
```
Browser
    ↓
.NET Backend (serves React from wwwroot + API)
    ↓ (HTTP calls)
Parliament.bg API
```

## Key Benefits

✅ **No CORS issues** - Backend makes server-to-server calls
✅ **Single deployment** - One .NET app to deploy
✅ **Type safety** - C# models match TypeScript types exactly
✅ **API documentation** - Swagger/OpenAPI auto-generated
✅ **Better security** - External URLs hidden from client
✅ **Easier caching** - Can add server-side caching if needed

## Troubleshooting

### Backend won't start
- Ensure .NET 9 SDK is installed: `dotnet --version`
- Check port 5000 isn't already in use

### Frontend build fails
- Delete `node_modules` and run `npm install` again
- Ensure Node.js v20+ is installed: `node --version`

### API calls fail in development
- Ensure backend is running on port 5000
- Check Vite proxy configuration in `frontend/vite.config.ts`

### Images don't load
- Check the ImagesController is running
- Verify parliament.bg is accessible
