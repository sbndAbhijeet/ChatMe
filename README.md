# Lumin - AI Chat Application

[](https://github.com/sbndAbhijeet/ChatMe)  
[](https://opensource.org/licenses/MIT)

Lumin is an intelligent chat application designed to be a powerful, multi-faceted AI assistant. Inspired by conversational AIs like Google's Gemini, Lumin aims to provide a seamless chat experience with a dynamic user interface. The long-term vision is to integrate n8n-style dynamic workflows, agentic multi-tool systems, and persistent knowledge management.

`This project is currently under active development.`

---

## Project Development Update: AI Chatbot with FastAPI + MongoDB + React

---

## Phase 1: Foundation Establishment

- Implemented core LLM integration with direct input/output streaming
- Developed initial UI/UX framework for the chatbot interface
  - Interactive chat simulation
  - Temporary chat management (edit/delete titles)
  - Loading animations and effects
  - ![Chatbot UI Preview](/frontend/src/assets/chat_interface.png)
  - ![Basic LLM Flow](/frontend/src/assets/app_front_page.png)

---

## Phase 2: Backend Integration & Architecture

### Backend System
- Implemented FastAPI with clean architecture
- Integrated MongoDB using modern async libraries:
  - Motor for async database access
  - Beanie for ODM (Object Document Mapping)
  - AIOStream for efficient data streaming
- Designed robust Data Access Layer following database best practices

### Frontend Improvements
- Re-engineered React components for backend compatibility
- Implemented REST API communication using Axios
- Resolved complex debugging challenges in frontend–backend integration
- Maintained existing UI/UX quality while adding real functionality

### Capabilities Achieved
- Fully functional chatbot with persistent storage
- Clean architecture implementation
- Responsive and interactive UI

Old Video (Need update)
<video src="Phase_2.mp4" controls title="Demo" width="500"></video>

---

## Phase 3: Tool Integration & Knowledge Persistence (Current Phase)
![phase3_img](/frontend/src/assets/blog_interface.png)

### ✅ Implemented

### 1. Web Search Tool Integration
- ![Basic LLM Flow](/frontend/src/assets/weather_tool.png)
- Added Web Search as the first external tool
- Implemented tool invocation from backend using LangGraph
- Designed tool abstraction layer for future extensibility

### 2. Manual Routing in LangGraph
- Implemented custom routing logic instead of automatic tool selection
- Built conditional graph edges for tool vs LLM flow
- Faced architectural challenges while managing async execution paths
- Learned deep internals of LangGraph state transitions and node control

This phase required explicit routing decisions to determine:
- When to call LLM directly
- When to invoke Web Search
- How to merge tool results back into conversation state

---

### 3. Blog–Note System (LLM Knowledge Persistence)
- ![Basic LLM Flow](/frontend/src/assets/blog_interface.png)
A major functional addition:

- Implemented **Blog–Note architecture**
- Each bot reply now includes a **save icon**
- Users can store important LLM-generated responses into Notes
- Notes are grouped under Blogs for structured future reference

🎯 Core idea:
> Turn AI-generated knowledge into a personal, searchable knowledge base.

This allows:
- Saving high-quality answers
- Building long-term reference material
- Reusing AI insights later instead of losing them in chat history

---

## Current Capabilities

- Persistent chat storage
- Web search tool
- Manual LangGraph routing
- Blog–Note knowledge system
- Clean backend architecture
- Modern responsive UI
- Per-message save-to-notes functionality

---

## Key Achievements

✔️ Clean architecture with FastAPI + MongoDB  
✔️ Async backend with Motor  
✔️ Web Search tool integration  
✔️ Manual LangGraph routing implementation  
✔️ Blog–Note knowledge persistence system  
✔️ UI integration for saving bot replies  
✔️ Maintained UI quality during heavy backend changes  

---

## Challenges Faced

❌ Complex frontend–backend async debugging  
❌ Manual routing complexity in LangGraph  
❌ Managing tool + LLM state transitions  
❌ Intermittent async execution issues during tool calls  
❌ Designing scalable Blog–Note data models  

---

## ✨ Features (Current & Planned)

### Current

- **Conversational AI**
- **Web Search Tool**
- **Persistent Chat History**
- **Blog–Note Knowledge Storage**
- **Per-message save icon**
- **Manual LangGraph routing**
- **Modern React UI**

### Planned

- **Agentic Workflows:** LangGraph-based multi-agent systems
- **Tool Library Expansion:** Calculator, file tools, RAG, etc.
- **Authentication System**
- **Custom Workflow Builder (n8n-style)**
- **Advanced Notes Search**
- **Vector Memory**
- **User-defined tools**

---

## 🛠️ Technology Stack

- **Frontend:** React.js
- **Backend:** FastAPI
- **Database:** MongoDB
- **AI Orchestration:** LangChain, LangGraph
- **AI Models:** Google Gemini, OpenAI

---

## 🚀 Getting Started

Instructions on how to set up and run the project locally will be available once the initial version stabilizes.

### Prerequisites

- Node.js & npm
- Python 3.9+ & pip
- MongoDB (local or cloud)
- Gemini / OpenAI API keys

---

### Installation

```bash
# Clone the repository
git clone https://github.com/sbndAbhijeet/ChatMe.git
cd ChatMe

# --- Frontend Setup ---
 cd frontend
 npm install
 npm run dev

# --- Backend Setup ---
 cd backend
 uv pip install -r requirements.txt
 uvicorn src.core.server:app --reload

# --- Environment Variables ---
# Create a .env file
GEMINI_API_KEY="your_gemini_key"
MONGODB_URI="your_mongodb_connection_string"
DEBUG="true"
