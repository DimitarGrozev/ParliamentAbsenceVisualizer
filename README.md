# Bulgarian Parliament Absence Visualizer

A React application to visualize absences from the Bulgarian Parliament with engaging visuals emphasizing missing members with their photos.

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

- **Build Tool**: Vite
- **Language**: TypeScript
- **UI Framework**: Material-UI (MUI) v7
- **State Management**: React Context + Hooks
- **HTTP Client**: Fetch API
- **Date Handling**: date-fns

## Project Structure

```
ParliamentAbsenceVisualizer/
├── src/
│   ├── components/          # React components
│   │   ├── AbsentMemberCard.tsx
│   │   ├── AbsentMembersList.tsx
│   │   ├── PartyAbsenceCard.tsx
│   │   ├── TopAbsentPartiesPanel.tsx
│   │   ├── DateRangeSelector.tsx
│   │   └── Layout/
│   │       ├── Header.tsx
│   │       └── MainLayout.tsx
│   ├── hooks/              # Custom React hooks
│   │   └── useAbsences.ts
│   ├── services/           # API integration
│   │   └── api.ts
│   ├── types/             # TypeScript type definitions
│   │   ├── assembly.ts
│   │   ├── party.ts
│   │   ├── member.ts
│   │   └── absence.ts
│   ├── utils/             # Utility functions
│   │   ├── datePresets.ts
│   │   └── aggregations.ts
│   ├── context/           # React Context
│   │   └── AppContext.tsx
│   ├── App.tsx           # Main app component
│   ├── main.tsx          # Entry point
│   └── theme.ts          # MUI theme configuration
└── public/
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/DimitarGrozev/ParliamentAbsenceVisualizer.git
   cd ParliamentAbsenceVisualizer
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The production-ready files will be in the `dist/` folder.

### Preview Production Build

```bash
npm run preview
```

## API Integration

The application integrates with the Bulgarian Parliament API:

### CORS Handling

The Bulgarian Parliament API doesn't include CORS headers, so browser-based apps can't call it directly. The application uses **Vite's proxy feature** during development to bypass CORS restrictions:

- API calls to `/api/*` are proxied to `https://www.parliament.bg/api/*`
- Image requests to `/images/*` are proxied to `https://www.parliament.bg/images/*`

**For production deployment**, you'll need to set up a similar proxy on your hosting server (e.g., using Nginx, Apache, or a Node.js server).

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
