 # 💬 Interactive Chat Assistant with Streaming Responses

## Overview
This project implements an interactive chat UI connected to a Flask backend that streams responses from a language model (Qwen3-4B-Instruct-2507) **token-by-token**. Instead of waiting for the model to finish generating, users see responses in real time.  
Additionally, since LLMs typically **don’t retain previous messages** by default, the project attempts to maintain message history for context-aware conversations (in-context learning).

This project is an enhanced version of my earlier work [**UI-Chatbot using Llama LLM Model**](https://github.com/OluwajobaOluwabori/UI-Chatbot-using-Llama-LLM-Model). In this earlier project, I built a simple chat GUI: an input box, a Send button, and a text area for history.  
Here, I’ve advanced it by adding **streaming responses** (token-by-token) and **context awareness** (the model receives previous conversation messages).

## Objectives
1. **Streaming Responses** — Show real-time message generation using the `/stream` endpoint instead of waiting for full output.  
2. **Context Awareness** — Keep a running conversation history so the model can provide coherent, connected responses.

## Features
-  Real-time streaming assistant replies  
-  Maintains visible chat history  
-  'Clear' chat button to reset conversation  
-  Responsive, minimal chat interface

## Tech Stack
- **Frontend:** React (Vite)
- **Backend:** Flask API (with ngrok for tunnelling)
- **Communication:** Server-Sent Events (SSE) for real-time streaming
- 
## Run Instructions
1. **Start the Flask backend:**
   - Run the `kaggle-llm-class.ipynb` notebook on **Kaggle** or locally using Python.  
   - The backend exposes `/stream` and `/clear` endpoints via **ngrok**.

2. **Start the React frontend:**
   ```bash
   npm run dev
   
3. **Open the app in your browser at**
   http://localhost:5173

   ## Screenshots of app in action
   **Context Awareness**
   <img width="1920" height="881" alt="Screenshot (18)" src="https://github.com/user-attachments/assets/8fee0460-901b-4829-94fb-1dbebf7ba643" />

   <img width="1920" height="852" alt="Screenshot (20)" src="https://github.com/user-attachments/assets/7a463d92-4d7b-4845-9442-8b63a2a754d7" />

   **Streaming in Action**(Prevents multiple sends while streaming)
   <img width="1920" height="933" alt="Screenshot (22)" src="https://github.com/user-attachments/assets/cda1dcfa-f9dd-4402-83e6-22f25c19cdba" />



