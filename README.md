<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# EvalIt — AI-Powered Answer Sheet Evaluator

EvalIt uses Google Gemini AI to automatically evaluate handwritten student answer sheets against a provided answer key.

---

## Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- A free Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey)

---

## Setup & Running Locally

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd evalit
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up your API key
```bash
# Copy the example env file
cp .env.example .env
```
Then open `.env` and replace `your_gemini_api_key_here` with your actual Gemini API key.

### 4. Start the development server
```bash
npm run dev
```

The app will be running at **http://localhost:3000** (or whichever port is shown in the terminal).

---

## Getting a Gemini API Key

1. Go to [https://aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Click **"Create API Key"**
4. Copy the key and paste it into your `.env` file

> **Note:** Never share your `.env` file or commit it to GitHub. It contains your private API key.

---

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview the production build |
| `npm run lint` | Run TypeScript type checking |
