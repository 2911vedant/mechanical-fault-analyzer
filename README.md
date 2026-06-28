
# 🔧 Mechanical Fault Analyzer

An AI-powered web application that analyzes mechanical component images to detect faults and answers engineering questions from maintenance manuals using RAG (Retrieval Augmented Generation).

## 🎯 What it does

- **Upload any mechanical component image** (gear, bearing, shaft, pump) → AI identifies fault type, severity, location, and provides recommendations
- **Ask questions** about mechanical failures → AI answers using content from real engineering maintenance manuals
- **Structured diagnosis** with confidence scores, fault classification, and actionable recommendations

## 🧠 How it works

```
User uploads image
      ↓
Groq Vision API (Llama 4 Scout) analyzes the component
      ↓
Returns structured fault report (type, severity, location, recommendation)

User asks a question
      ↓
RAG pipeline searches 4,172 chunks from maintenance PDF
      ↓
Groq LLM answers using relevant manual content
```

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React.js |
| Backend | Python + Flask |
| Vision AI | Groq API (Llama 4 Scout Vision) |
| RAG Chatbot | LangChain + Groq (Llama 3.3 70B) |
| PDF Processing | PyPDF + RecursiveCharacterTextSplitter |
| Styling | Inline CSS with warm beige design system |

## 🚀 Features

- 🖼️ Drag and drop image upload
- 🔍 AI fault detection with structured output (fault type, confidence, severity, location)
- 💬 Conversational chatbot backed by real engineering manuals
- 📋 Suggested questions for quick exploration
- ⚡ Color-coded severity indicators (critical / moderate / minor)
- 📄 Recommendation cards with actionable next steps

## 📁 Project Structure

```
mechanical-fault-analyzer/
├── backend/
│   ├── app.py              # Flask server with /analyze-image and /chat routes
│   ├── vision.py           # Groq Vision API integration for fault detection
│   ├── rag.py              # RAG pipeline - PDF loading, chunking, Q&A
│   ├── runner.py           # Safe code execution utility
│   └── manuals/            # Engineering PDF manuals (indexed by RAG)
└── frontend/
    └── src/
        └── App.js          # React UI - image upload + chat interface
```

## ⚙️ Setup & Installation

### Prerequisites
- Python 3.9+
- Node.js 16+
- Groq API key (free at console.groq.com)

### Backend Setup

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install flask flask-cors groq langchain langchain-community pypdf python-dotenv
```

Create `.env` file:
```
GROQ_API_KEY=your_groq_api_key_here
```

Add engineering PDF manuals to `backend/manuals/` folder.

Start backend:
```bash
python3 app.py
```

### Frontend Setup

```bash
cd frontend
npm install
npm start
```

Open `http://localhost:3000`

## 🧪 Sample Results

**Input:** Image of a worn gear component

**Output:**
```
FAULT TYPE: wear
CONFIDENCE: high
LOCATION: on the teeth and bore of the gear
SEVERITY: moderate
EXPLANATION: The gear exhibits visible signs of wear on its teeth and bore,
indicating degradation of surface integrity.
RECOMMENDATION: Inspect and potentially replace the gear to prevent further
damage and potential catastrophic failure.
```

## 🎓 Why this project matters

- Combines **Computer Vision + NLP + RAG** in a single application
- Real-world applicability in **industrial maintenance and predictive maintenance**
- Demonstrates understanding of **multi-modal AI systems**
- RAG approach ensures answers are grounded in domain-specific knowledge

## 👨‍💻 Author

**Vedant Chavan**  
B.Tech Information Technology  
Pillai College of Engineering, New Panvel
