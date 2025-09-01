# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

Six Degrees of Wikipedia finds the shortest path between any two Wikipedia pages through their hyperlinks. The project consists of:

- **Backend**: Python Flask API server (`sdow/`) with SQLite database containing Wikipedia links
- **Frontend**: React/TypeScript website (`website/`) built with Vite 
- **Database**: Scripts to download, process, and build Wikipedia dump databases (`scripts/`)
- **Infrastructure**: Configuration for production deployment with Nginx, Gunicorn, Supervisord

## Development Environment Setup

### Initial Setup (One-time)
```bash
# From repo root - create Python virtual environment and install dependencies
virtualenv env
source env/bin/activate
pip install -r requirements.txt

# Create mock database for development
python scripts/create_mock_databases.py

# Setup frontend dependencies
cd website/
npm install
```

### Development Server (Every Session)
**Backend (Terminal 1):**
```bash
# From repo root
source env/bin/activate
cd sdow/
export FLASK_APP=server.py FLASK_DEBUG=1
flask run
# Runs on http://localhost:5000
```

**Frontend (Terminal 2):**
```bash
# From website/ directory  
npm start
# Runs on http://localhost:3000
```

## Core Development Commands

### Backend (Python Flask API)
```bash
# Run server in debug mode
cd sdow/ && export FLASK_APP=server.py FLASK_DEBUG=1 && flask run

# Check Python code formatting 
pylint sdow/

# Format Python code (uses PEP 8 with 2-space indents, 100-char lines)
autopep8 --in-place --recursive sdow/

# Query mock database directly
litecli sdow/sdow.sqlite
```

### Frontend (React/TypeScript)
```bash
# From website/ directory
npm start              # Development server (port 3000)
npm run build          # Production build
npm run preview        # Preview production build
npm run lint           # Run Prettier + ESLint  
npm run format         # Auto-format code
npm run analyze        # Analyze bundle size
npm run update-deps    # Update dependencies (excludes react-router-dom)

# Type checking
npx tsc --noEmit
```

### Database Operations
```bash
# Create mock development databases
python scripts/create_mock_databases.py

# Build full production database from Wikipedia dumps (takes hours/days)
cd scripts/ && ./buildDatabase.sh

# Build for specific Wikipedia dump date
cd scripts/ && ./buildDatabase.sh 20231201

# Upload database to Google Cloud Storage
cd scripts/ && ./uploadToGcs.sh

# Backup searches database
cd scripts/ && ./backupSearchesDatabase.sh
```

## Architecture Overview

### Bi-Directional Breadth-First Search Algorithm
The core search algorithm (`sdow/breadth_first_search.py`) uses bi-directional BFS:

1. **Dual Search**: Searches simultaneously from source and target pages
2. **Adaptive Direction**: Chooses search direction based on link count (fewer outgoing/incoming links)  
3. **Optimal Strategy**: Forward search follows outgoing links, backward search follows incoming links
4. **Path Construction**: When searches meet, reconstructs complete path through parent tracking

### Database Schema
- **pages**: `id`, `title`, `is_redirect` - All Wikipedia pages
- **links**: `id`, `outgoing_links_count`, `incoming_links_count`, `outgoing_links`, `incoming_links` - Page link relationships stored as pipe-separated strings
- **redirects**: `source_id`, `target_id` - Page redirects  
- **searches**: Search result logging with timing data

### API Endpoints
- `POST /paths` - Main search endpoint: `{"source": "Page A", "target": "Page B"}`
- `GET /ok` - Health check

### Data Flow
1. Frontend sends search request to `/paths` with source/target page titles
2. Backend resolves titles to page IDs, handling redirects
3. Bi-directional BFS algorithm finds shortest paths
4. Wikipedia API fetched for page metadata (titles, URLs, summaries)
5. Results returned as JSON with paths (page ID arrays) and page data
6. Frontend renders results as both list and D3.js graph visualization

## Key Files and Patterns

### Backend Structure
- `server.py` - Flask app with CORS, compression, error handling
- `database.py` - SQLite query abstraction and caching
- `breadth_first_search.py` - Core pathfinding algorithm
- `helpers.py` - Wikipedia API integration, error classes

### Frontend Structure (see website/WARP.md)
The frontend is a separate React/TypeScript application with its own WARP.md file containing detailed frontend-specific guidance.

### Database Build Pipeline
Wikipedia dump processing involves multiple stages:
1. **Download**: Gets latest Wikipedia dumps (pages, links, redirects) via wget/torrent
2. **Trim**: Filters to main namespace (0) articles only  
3. **Transform**: Converts titles to IDs, resolves redirects
4. **Sort/Dedupe**: Optimizes link data for search performance
5. **Import**: Creates SQLite database with proper indexes

### Production Architecture
- **Web Server**: Nginx reverse proxy
- **App Server**: Gunicorn WSGI server running Flask app
- **Process Management**: Supervisord for service monitoring
- **Database**: SQLite files (~50GB+ for full Wikipedia)
- **Deployment**: Google Cloud Platform with Firebase hosting for frontend

## Development Patterns

### Python Code Style
- 2-space indentation (configured in .pylintrc, setup.cfg)
- 100-120 character line limits
- PEP 8 compliance with custom indent rules

### Error Handling
- Custom `InvalidRequest` exception class for user-facing errors
- Comprehensive logging with Google Cloud Logging integration
- Graceful degradation when Wikipedia API unavailable

### Performance Considerations
- **Link Storage**: Pipe-separated strings in TEXT fields for space efficiency
- **Search Optimization**: Chooses BFS direction based on link density
- **Database Indexes**: Optimized for title lookups and link count queries
- **Caching**: Database connection pooling and query result caching

## Mock vs Production Data

**Development**: Uses `create_mock_databases.py` - creates ~35 mock Wikipedia pages with simple link relationships for testing the search algorithm.

**Production**: Uses `buildDatabase.sh` - downloads and processes full Wikipedia dumps (~6M+ pages, ~150M+ links). Takes significant time and disk space (50GB+).
