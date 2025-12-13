# Bulgarian Parliament Absence Visualizer

A full-stack application to visualize absences from the Bulgarian Parliament with engaging visuals emphasizing missing members with their photos.

## Features

- **Default Dashboard View**: Displays today's absences with the top 3 parties by absence count
- **Date Range Selection**: Users can select custom date ranges or use presets:
  - Today
  - This Week
  - This Month
  - Current Assembly
- **Top Absent Parties**: Shows the top 3 parties with most absence records, ranked with medal indicators 🥇🥈🥉
- **Member Photo Display**: Each absent member is shown with their official parliament photo
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Empty State Handling**: Clear messaging when no absences are found for the selected period
- **Loading States**: Skeleton loading indicators while fetching data

## Technology Stack

### Frontend
- **Build Tool**: Vite
- **Language**: TypeScript
- **UI Framework**: Material-UI (MUI) v7
- **State Management**: React Context + Hooks
- **HTTP Client**: Fetch API
- **Date Handling**: date-fns

### Backend
- **.NET Version**: .NET 9.0
- **Framework**: ASP.NET Core Web API
- **Language**: C#
- **API Documentation**: Swagger/OpenAPI

## Architecture

This application uses a **.NET backend** that serves the React frontend and acts as a proxy to the Bulgarian Parliament API. This architecture:

- **Solves CORS issues**: The .NET backend makes server-to-server calls to parliament.bg
- **Simplifies deployment**: Single application to deploy
- **Improves security**: API keys and external URLs are hidden from the client
- **Better performance**: Server-side caching can be added easily

```
┌─────────────┐      ┌──────────────┐      ┌─────────────────┐
│   Browser   │─────▶│ .NET Backend │─────▶│ Parliament API  │
│  (React)    │◀─────│   (Proxy)    │◀─────│  (parliament.bg)│
└─────────────┘      └──────────────┘      └─────────────────┘
```

## Project Structure

```
ParliamentAbsenceVisualizer/
├── frontend/                    # React application
│   ├── src/
│   │   ├── components/          # React components
│   │   ├── hooks/               # Custom React hooks
│   │   ├── services/            # API integration
│   │   ├── types/              # TypeScript type definitions
│   │   ├── utils/              # Utility functions
│   │   ├── context/            # React Context
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── theme.ts
│   ├── public/
│   ├── package.json
│   └── vite.config.ts
│
├── backend/                     # .NET Web API
│   ├── Controllers/             # API endpoints
│   │   ├── ParliamentController.cs
│   │   └── ImagesController.cs
│   ├── Models/                  # Data models
│   │   ├── Assembly.cs
│   │   ├── Party.cs
│   │   ├── Member.cs
│   │   ├── MembersResponse.cs
│   │   ├── Absence.cs
│   │   └── AbsenceRequest.cs
│   ├── Services/                # Business logic
│   │   └── ParliamentApiService.cs
│   ├── Program.cs               # Application entry point
│   └── ParliamentAbsenceVisualizer.Api.csproj
│
└── .github/workflows/           # CI/CD pipelines
```

## Getting Started

### Prerequisites

- **Node.js** (v20 or higher)
- **.NET SDK** 9.0 or higher
- npm or yarn

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/DimitarGrozev/ParliamentAbsenceVisualizer.git
   cd ParliamentAbsenceVisualizer
   ```

2. **Install frontend dependencies**:
   ```bash
   cd frontend
   npm install
   cd ..
   ```

3. **Restore backend dependencies**:
   ```bash
   cd backend
   dotnet restore
   cd ..
   ```

### Development

You need to run both the backend and frontend in development mode:

1. **Start the .NET backend** (Terminal 1):
   ```bash
   cd backend
   dotnet run
   ```
   The API will be available at `http://localhost:5000` (or `https://localhost:5001` for HTTPS)

2. **Start the React frontend** (Terminal 2):
   ```bash
   cd frontend
   npm run dev
   ```
   The app will be available at `http://localhost:5173`

The Vite dev server will proxy API requests to the .NET backend automatically.

### Build for Production

**Simple one-command build** - The frontend is automatically built when you build the backend:

```bash
cd backend
dotnet publish -c Release -o ./publish
```

This single command:
1. Automatically runs `npm run build` in the frontend folder
2. Builds the React app into `backend/wwwroot`
3. Builds and publishes the .NET backend
4. Outputs everything to `backend/publish/`

**Alternative manual build** (if you prefer to build separately):
```bash
# Step 1: Build frontend
cd frontend
npm run build

# Step 2: Publish backend
cd ../backend
dotnet publish -c Release -o ./publish
```

The entire application will be in the `backend/publish/` folder and can be deployed as a single unit.

### API Documentation

When running in development mode, Swagger UI is available at:
- `http://localhost:5000/swagger`

This provides interactive API documentation for all backend endpoints.

## API Integration

The application integrates with the Bulgarian Parliament API through the .NET backend:

### How CORS is Handled

The .NET backend acts as a proxy:
- **Browser** ➜ **Frontend** (localhost:5173) ➜ calls `/api/*`
- **Vite** proxies to **Backend** (localhost:5000)
- **Backend** makes server-side HTTP calls to **parliament.bg**
- No CORS issues because the backend makes the external requests

### Endpoints Used

1. **Current Assembly**:
   - `GET https://www.parliament.bg/api/v1/fn-assembly/bg`
   - Returns information about the current national assembly

2. **Parties**:
   - `GET https://www.parliament.bg/api/v1/coll-list/bg/2`
   - Returns all current parties in parliament

3. **Members**:
   - `GET https://www.parliament.bg/api/v1/coll-list-ns/bg`
   - Returns all current parliament members

4. **Absences**:
   - `POST https://www.parliament.bg/api/v1/mp-absense/bg`
   - Fetches absences for a given date range

5. **Member Photos**:
   - `GET https://www.parliament.bg/images/Assembly/{member_id}.png`
   - Member photo URLs

## Data Caching Strategy

- **Assembly, Parties, and Members**: Fetched once on app load and cached in React Context (members don't change frequently)
- **Absences**: Fetched on date range change, not cached (data changes frequently)

## Key Features Explained

### Absence Aggregation

- Absences are counted as **total absence records**, not unique members
- Example: If one member is absent for 3 days, that counts as 3 absences
- Top parties are ranked by total absence count

### Date Presets

- **Today**: Shows absences for the current day
- **This Week**: Monday to Sunday of the current week
- **This Month**: 1st to last day of the current month
- **Current Assembly**: From assembly start date to today

### Member Cards

Each absent member card displays:
- Member photo (with fallback to initials avatar if photo unavailable)
- Full name (First + Middle + Last)
- Party affiliation
- Absence date
- Location of absence (Assembly or Commission name)

## Future Extensions

The application is structured to easily support future enhancements:

- Member detail view (click on member card for more info)
- Party detail view (click on party card for detailed statistics)
- Historical trends and charts
- Export functionality (CSV, PDF)
- Filtering by party, commission, or absence type
- Search for specific members
- Notifications for high absence rates
- Comparison views between different assemblies

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

ISC

## Acknowledgments

- Bulgarian Parliament for providing the public API
- Material-UI team for the excellent component library
- date-fns team for date handling utilities
