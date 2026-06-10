# AI File Summarizer

A local-first document summarizer powered by **Ollama** (`qwen3:8b`), built with React + Vite frontend and Python Flask backend.

---

## Prerequisites

| Tool | Version | Install |
|------|---------|---------|
| Python | 3.10+ | https://python.org |
| Node.js | 18+ | https://nodejs.org |
| Ollama | latest | https://ollama.com |

---

## Quick Start

### 1. Start Ollama + pull the model

```bash
ollama serve          # starts the Ollama daemon (skip if already running)
ollama pull qwen3:8b  # ~5 GB download on first run
```

Verify: `curl http://localhost:11434/api/tags` — should return JSON.

---

### 2. Backend

```bash
cd ai-file-summarizer/backend

# Create virtual environment (recommended)
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start Flask server
python app.py
```

Backend runs on `http://localhost:5000`.

Health check: `curl http://localhost:5000/api/health`

---

### 3. Frontend

```bash
cd ai-file-summarizer/frontend

npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## API Reference

### `GET /api/health`

```json
{ "status": "running", "ollama": "connected" }
```

### `POST /api/summarize` — File upload

```
Content-Type: multipart/form-data

file         (File)   — .txt, .pdf, .docx, max 20 MB
summary_type (string) — "short" | "medium" | "detailed"
```

### `POST /api/summarize` — Raw text

```json
{
  "text": "Your text here...",
  "summary_type": "short"
}
```

**Response:**
```json
{
  "success": true,
  "summary": "...",
  "summary_type": "short",
  "char_count": 1234,
  "word_count": 220
}
```

---

## Summary Types

| Type | Output |
|------|--------|
| **Short** | 3–5 bullet points |
| **Medium** | Single detailed paragraph (150–250 words) |
| **Detailed** | Key Points · Important Insights · Conclusion · Action Items |

---

## Supported File Types

| Format | Library |
|--------|---------|
| `.txt` | built-in |
| `.pdf` | `pdfplumber` |
| `.docx` | `python-docx` |

Max file size: **20 MB**

---

## Project Structure

```
ai-file-summarizer/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── FileUpload.jsx
│   │   │   ├── TextInput.jsx
│   │   │   ├── SummaryTypeSelector.jsx
│   │   │   ├── SummaryOutput.jsx
│   │   │   ├── TextPreview.jsx
│   │   │   └── LoadingSpinner.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── backend/
│   ├── routes/
│   │   ├── health.py
│   │   └── summarize.py
│   ├── services/
│   │   └── ollama_service.py
│   ├── utils/
│   │   └── file_parser.py
│   ├── app.py
│   └── requirements.txt
│
└── README.md
```

---

## Troubleshooting

**"Cannot reach Ollama at localhost:11434"**
→ Run `ollama serve` in a terminal and keep it open.

**"Model not found"**
→ Run `ollama pull qwen3:8b` and wait for the download to finish.

**"No extractable text found in PDF"**
→ The PDF is likely a scanned image. OCR is not supported; use a text-based PDF.

**Slow responses**
→ First request loads the model into memory (~30s). Subsequent requests are faster.

---

## Production Notes

- For production, run the Flask backend with `gunicorn`: `gunicorn -w 2 app:create_app()`
- Build the frontend: `npm run build` — serve the `dist/` folder via Nginx or similar
- The Ollama timeout is set to 120s in `services/ollama_service.py` — increase for very large documents
