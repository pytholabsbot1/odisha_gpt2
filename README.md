# OdishaGPT

**OdishaGPT** is a next-generation local news application dedicated to the state of Odisha, India. It combines a modern, minimalist news feed with an intelligent AI assistant capable of answering questions about local districts, events, and developments in real-time.

## 🚀 Purpose

The goal of OdishaGPT is to bridge the gap between static news consumption and interactive information retrieval. Instead of just scrolling through headlines, users can ask:
*   *"What is happening in Bhubaneswar today?"*
*   *"Summarize the latest industrial updates in Jharsuguda."*
*   *"Are there any new festivals in Puri?"*

The AI assistant acts as a localized reporter, synthesizing information from the available news database to provide concise, accurate summaries.

## 🛠️ How It's Built

This project is a Single Page Application (SPA) built with **React 19** and **TypeScript**, styled with **Tailwind CSS**, and powered by **Google's Gemini API**.

### Core Technologies

*   **Frontend Framework:** React 19
*   **Language:** TypeScript
*   **Styling:** Tailwind CSS (Custom config for typography and minimalist aesthetic)
*   **Routing:** React Router DOM (MemoryRouter)
*   **AI Engine:** Google Gemini API (`@google/genai` SDK)

### Architecture & AI Integration

The core intelligence of the app lies in `services/geminiService.ts`. It utilizes a **RAG-lite (Retrieval-Augmented Generation)** pattern using Gemini's **Function Calling** capabilities.

1.  **Lightweight Indexing:**
    The system maintains a lightweight index of news headlines (Title, District, ID). This context is provided to the System Instruction of the LLM.

2.  **Tool-Use / Function Calling:**
    When a user asks a question (e.g., *"Tell me about the metro project"*), the model (`gemini-3-flash-preview`):
    *   Analyzes the intent.
    *   Identifies relevant articles from the index.
    *   **Calls the Tool:** `fetch_article_details(articleIds: [...])`.

3.  **Data Retrieval & Synthesis:**
    *   The application intercepts this tool call.
    *   It fetches the full content of the requested articles from the mock database.
    *   It sends the full content back to the model as a `functionResponse`.
    *   The model then generates a natural language summary for the user.

4.  **Streaming:**
    The chat interface uses generators (`async function*`) to stream the AI's response token-by-token for a responsive UX.

### Features

*   **News Feed:**
    *   Masonry grid layout (newspaper style).
    *   Filter by District (Bhubaneswar, Cuttack, Puri, etc.).
    *   Filter by Category (Infrastructure, Culture, etc.).
    *   Client-side pagination.
*   **AI Chat Interface:**
    *   Full-screen chat experience.
    *   Multi-turn conversation history.
    *   "Projects" (Chat Sessions) stored in `localStorage`.
    *   Source citations (links to articles used in the answer).
*   **Design:**
    *   Typography-focused (`DM Sans` and `Playfair Display`).
    *   Micro-interactions and smooth animations.

## 📦 Setup & Configuration

1.  **Environment Variables:**
    The application requires a Google Gemini API Key.
    Ensure `process.env.API_KEY` is available in your environment.

2.  **Running the App:**
    This project is set up to run in a browser-based ES module environment (like StackBlitz or similar) without a complex build step, utilizing `esm.sh` for dependencies.

    *   `index.html` imports dependencies via `<script type="importmap">`.
    *   `index.tsx` is the entry point.

## 📂 Project Structure

```
├── components/          # React UI components
│   ├── ChatInterface.tsx    # Main chat logic & UI
│   ├── FloatingChatInput.tsx # Homepage entry point for AI
│   └── NewsCard.tsx         # Individual news item display
├── services/
│   └── geminiService.ts     # Gemini API integration & Tool definitions
├── constants.ts         # Mock data & app constants
├── types.ts             # TypeScript interfaces
├── App.tsx              # Main Router & Layout
└── index.html           # Entry HTML & Import Map
```

---
*Built as a demonstration of Localized AI News capabilities using Google Gemini.*