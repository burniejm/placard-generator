# Placard Generator - Technical Specification

## Overview

A web application that transforms Excel spreadsheets containing fire sprinkler system data into LightBurn-compatible CSV files for laser engraving placards.

**Problem Solved:**
- Eliminates manual column filtering and reordering
- Removes header row automatically (LightBurn expects data starting at row 1)
- Automates FTS contract logic (adds company branding when applicable)
- Allows selective row export with visual preview

---

## Technical Stack

| Component | Technology |
|-----------|------------|
| Frontend | React + TypeScript |
| Backend | Node.js + Express |
| Excel Parsing | SheetJS (xlsx) |
| Containerization | Docker + Docker Compose |
| Styling | Tailwind CSS |

**Deployment Target:** Asustor NAS via Docker

---

## Data Transformation Rules

### Input
- **Format:** Excel file (.xlsx, .xls)
- **Structure:** Row 1 = headers, Row 2+ = data
- **Source columns (0-indexed):**

| Index | Column Name |
|-------|-------------|
| 0 | Customer |
| 1 | Date Installed |
| 2 | Contract No. |
| 3 | Location |
| 4 | Basis of Design |
| 5 | # Sprinklers |
| 6 | Density (GPM/SQFT) |
| 7 | Occupancy Classification |
| 8 | Commodity Classification |
| 9 | Max Storage Height |
| 10 | Area of Discharge (SQFT) |
| 11 | Water Flow Rate (GPM) |
| 12 | Residual Pressure (PSI) |
| 13 | Hose Stream Allowance (GPM) |
| 14 | Safety Margin |
| 15 | Completed |

### Output
- **Format:** CSV (no headers, comma-separated, standard quoting)
- **Column order (maps source → output position):**

| Output Position | Source Index | Source Column Name |
|-----------------|--------------|-------------------|
| 1 | 3 | Location |
| 2 | 5 | # Sprinklers |
| 3 | 6 | Density (GPM/SQFT) |
| 4 | 10 | Area of Discharge (SQFT) |
| 5 | 11 | Water Flow Rate (GPM) |
| 6 | 12 | Residual Pressure (PSI) |
| 7 | 13 | Hose Stream Allowance (GPM) |
| 8 | 7 | Occupancy Classification |
| 9 | 8 | Commodity Classification |
| 10 | 9 | Max Storage Height |
| 11 | 1 | Date Installed |
| 12 | 2 | Contract No. (transformed) |

### Transformation Logic

#### Contract No. Field (Column 2 → Output Position 12)
```
IF cell contains "FTS" (case-insensitive):
    OUTPUT = "www.firetechsystems.com\n(318) 688-8800"
ELSE:
    OUTPUT = "" (empty string)
```
Note: `\n` is a literal newline character (ASCII 10), not escaped text.

#### Whitespace Trimming
- All cell values: trim leading/trailing whitespace
- Empty cells remain empty (no special handling)

#### Row Numbering
- User-facing row numbers match Excel (Row 1 = header, Row 2 = first data row)
- Internal processing adjusts for 0-indexed arrays

---

## User Interface

### Main Screen Layout

```
┌─────────────────────────────────────────────────────────────┐
│  PLACARD GENERATOR                                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  📁 Drop Excel file here or click to browse         │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  ROW SELECTION                                              │
│  ┌──────────────┐ ┌──────────────┐ ┌─────────────┐         │
│  │ Start Row: 2 │ │ End Row: 10  │ │ + Add Range │         │
│  └──────────────┘ └──────────────┘ └─────────────┘         │
│                                                             │
│  ┌──────────────────┐                                      │
│  │ Single Row: ___  │  [+ Add Row]                         │
│  └──────────────────┘                                      │
│                                                             │
│  Selected: [2-10] [15] [22-25] [×] [×] [×]                 │
│                                                             │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  PREVIEW (12 rows selected)                                 │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Row │ Location    │ # Spr │ Density │ ... │ FTS?    │   │
│  │ ────┼─────────────┼───────┼─────────┼─────┼──────── │   │
│  │ 2   │ System 1    │       │ 0.800   │ ... │ No      │   │
│  │ 3   │ System 2    │       │ 0.800   │ ... │ No      │   │
│  │ ... │ ...         │ ...   │ ...     │ ... │ ...     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              🔽 GENERATE CSV                          │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### UI Components

#### 1. File Upload
- Drag-and-drop zone
- Click to browse fallback
- Accepts: `.xlsx`, `.xls`
- Shows filename after upload
- "Clear" button to reset

#### 2. Row Selection
- **Range input:** Start row + End row + "Add Range" button
- **Single row input:** Row number + "Add Row" button
- **Selection chips:** Visual tags showing all selections, each with remove (×) button
- Selections can overlap (same row multiple times = multiple output rows)
- Validation: Row numbers must be ≥ 2 (row 1 is header)

#### 3. Preview Table
- Shows transformed data for selected rows
- Columns match output format
- Visual indicator for FTS rows (checkmark or highlight)
- Scrollable if many rows selected
- Updates live as selections change

#### 4. Generate Button
- Disabled until: file uploaded AND at least one row selected
- Downloads CSV file named: `placards_YYYY-MM-DD_HHMMSS.csv`

---

## Batch History

### Stored Data Per Export
```json
{
  "id": "uuid-v4",
  "timestamp": "2025-01-20T14:30:00Z",
  "originalFilename": "Placard Working List - engrave(2025).xlsx",
  "rowsSelected": ["2-10", "15", "22-25"],
  "totalRowsOutput": 14,
  "outputFilename": "placards_2025-01-20_143000.csv",
  "outputFileContent": "base64-encoded-csv-content"
}
```

### History UI
- Accessible via "History" tab or sidebar
- List view showing: timestamp, original file, row count
- Click to expand: see full details, re-download CSV
- Optional: "Clear History" button

### Storage
- Persist to local JSON file on server: `/data/history.json`
- Docker volume mount ensures persistence across container restarts

---

## API Endpoints

### `POST /api/upload`
Upload Excel file for processing.

**Request:** `multipart/form-data`
- `file`: Excel file (.xlsx, .xls)

**Response:**
```json
{
  "success": true,
  "fileId": "temp-uuid",
  "filename": "original-name.xlsx",
  "totalRows": 150,
  "headers": ["Customer", "Date Installed", ...],
  "preview": [
    {"row": 2, "data": ["TVH", "6/11/2004", "", "System 1", ...]},
    {"row": 3, "data": ["TVH", "6/11/2004", "", "System 2", ...]}
  ]
}
```

### `POST /api/preview`
Get transformed preview for selected rows.

**Request:**
```json
{
  "fileId": "temp-uuid",
  "selections": ["2-10", "15", "22-25"]
}
```

**Response:**
```json
{
  "success": true,
  "rows": [
    {
      "sourceRow": 2,
      "transformed": ["System 1", "", "0.800", "2000", ...],
      "hasFTS": false
    }
  ]
}
```

### `POST /api/generate`
Generate and download final CSV.

**Request:**
```json
{
  "fileId": "temp-uuid",
  "selections": ["2-10", "15", "22-25"]
}
```

**Response:**
- Content-Type: `text/csv`
- Content-Disposition: `attachment; filename="placards_2025-01-20_143000.csv"`
- Body: CSV content

**Side Effect:** Saves to batch history.

### `GET /api/history`
Get batch history list.

**Response:**
```json
{
  "success": true,
  "history": [
    {
      "id": "uuid",
      "timestamp": "2025-01-20T14:30:00Z",
      "originalFilename": "...",
      "rowsSelected": [...],
      "totalRowsOutput": 14
    }
  ]
}
```

### `GET /api/history/:id/download`
Re-download a previously generated CSV.

**Response:** CSV file download

---

## File Structure

```
placard-generator/
├── docker-compose.yml
├── Dockerfile
├── package.json
├── tsconfig.json
├── README.md
│
├── src/
│   ├── server/
│   │   ├── index.ts              # Express app entry
│   │   ├── routes/
│   │   │   ├── upload.ts         # File upload handling
│   │   │   ├── preview.ts        # Preview generation
│   │   │   ├── generate.ts       # CSV generation
│   │   │   └── history.ts        # Batch history
│   │   ├── services/
│   │   │   ├── excelParser.ts    # SheetJS wrapper
│   │   │   ├── transformer.ts    # Column mapping + FTS logic
│   │   │   ├── csvWriter.ts      # CSV output formatting
│   │   │   └── historyStore.ts   # JSON file persistence
│   │   └── types.ts              # Shared TypeScript types
│   │
│   └── client/
│       ├── index.html
│       ├── main.tsx              # React entry
│       ├── App.tsx               # Main component
│       ├── components/
│       │   ├── FileUpload.tsx
│       │   ├── RowSelector.tsx
│       │   ├── SelectionChips.tsx
│       │   ├── PreviewTable.tsx
│       │   ├── GenerateButton.tsx
│       │   └── HistoryPanel.tsx
│       ├── hooks/
│       │   ├── useFileUpload.ts
│       │   └── useSelections.ts
│       └── styles/
│           └── globals.css       # Tailwind imports
│
├── data/                         # Docker volume mount point
│   └── history.json
│
└── uploads/                      # Temp file storage (cleaned periodically)
```

---

## Docker Configuration

### Dockerfile
```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY dist/ ./dist/

EXPOSE 3000

CMD ["node", "dist/server/index.js"]
```

### docker-compose.yml
```yaml
version: '3.8'

services:
  placard-generator:
    build: .
    container_name: placard-generator
    restart: unless-stopped
    ports:
      - "3000:3000"
    volumes:
      - ./data:/app/data
    environment:
      - NODE_ENV=production
```

### Deployment Steps
1. Clone/copy project to NAS
2. Run `docker-compose up -d --build`
3. Access at `http://<nas-ip>:3000`

---

## Implementation Phases

### Phase 1: Core Backend
- [ ] Project setup (Node.js, TypeScript, Express)
- [ ] Excel parsing service (SheetJS)
- [ ] Transformation logic (column mapping, FTS detection)
- [ ] CSV generation
- [ ] API endpoints: upload, preview, generate

### Phase 2: Frontend MVP
- [ ] React + Vite setup
- [ ] File upload component
- [ ] Row selection UI (ranges + single rows)
- [ ] Preview table
- [ ] Generate/download button

### Phase 3: History & Polish
- [ ] Batch history storage
- [ ] History UI panel
- [ ] Re-download functionality
- [ ] Error handling & validation messages
- [ ] Loading states

### Phase 4: Docker & Deployment
- [ ] Dockerfile
- [ ] docker-compose.yml
- [ ] Build scripts
- [ ] Deployment documentation

---

## Future Enhancements (Out of Scope for V1)

- Saved column mapping presets
- Quick filters (search by customer, date range)
- Multiple file upload
- Direct LightBurn integration (if API available)
- Dark mode

---

## Acceptance Criteria

1. **Upload:** User can upload `.xlsx` file and see row count
2. **Selection:** User can add multiple row ranges and single rows
3. **Preview:** Selected rows display in transformed format before export
4. **FTS Logic:** Rows with "FTS" in Contract No. show company info in preview and output
5. **Generate:** CSV downloads with correct column order, no headers, proper formatting
6. **History:** Past exports are logged and re-downloadable
7. **Docker:** App runs successfully on Asustor NAS via Docker

---

*Specification Version: 1.0*
*Created: 2025-01-20*
