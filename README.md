# Meadow House Repairs

A small browser app for recording, tracking and completing repair jobs at Meadow House.

## Features

- Submit a repair with a description, reporter and priority.
- Reject blank description and reporter values with validation feedback.
- Save multiple jobs with independent status, notes and history.
- Move jobs to In Progress and mark them Completed with required notes.
- Keep all job data in browser local storage across refreshes.
- Display literal text safely without interpreting HTML.

## Run locally

Option 1: open `index.html` directly in your browser.

Option 2: serve the folder locally:

```bash
cd c:/Users/mixan/Desktop/hackathon
python -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

## Files

- `index.html` — page structure
- `styles.css` — layout and accessibility styling
- `app.js` — repair logic and local storage handling
