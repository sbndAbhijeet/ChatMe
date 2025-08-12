# Lumin - AI Chat Application

[](https://github.com/sbndAbhijeet/ChatMe)
[](https://opensource.org/licenses/MIT)

Lumin is an intelligent chat application designed to be a powerful, multi-faceted AI assistant. Inspired by conversational AIs like Google's Gemini, Lumin aims to provide a seamless chat experience with a dynamic user interface. The long-term vision is to integrate complex features like n8n-style dynamic workflows, multi-tool AI capabilities, and much more.

`This project is currently under active development.`

---

## Project Development Update: AI Chatbot with FastAPI + MongoDB + React


### Phase 1: Foundation Establishment
- Implemented core LLM integration with direct input/output streaming
- Developed initial UI/UX framework for the chatbot interface
  - Created interactive chat simulation
  - Implemented temporary chat management features (edit/delete titles)
  - Added loading animations and effects
  - ![Chatbot UI Preview](/frontend/src/assets/image.png)
  - ![Basic LLM Flow](/frontend/src/assets/image-1.png)

### Phase 2: Backend Integration & Architecture
- **Backend System**:
  - Implemented FastAPI with clean architecture
  - Integrated MongoDB using modern async libraries:
    - Motor for async database access
    - Beanie for ODM (Object Document Mapping)
    - AIOStream for efficient data streaming
  - Designed robust Data Access Layer following database best practices

- **Frontend Improvements**:
  - Re-engineered React components for backend compatibility
  - Implemented REST API communication using Axios
  - Resolved complex debugging challenges in frontend-backend integration
  - Maintained existing UI/UX quality while adding real functionality

- **Current Capabilities**:
  - Fully functional chatbot with persistent storage
  - Clean architecture implementation
  - Responsive and interactive user interface
  <video src="Phase_2.mp4" controls title="Demo" width="500"></video>

## Next Phase Roadmap: Tool Integration

### Phase 3 Objectives:
1. **Basic Tool Integration**:
   - Implement plugin system for extendable functionality
   - Add core tools (calculator, web search, etc.)
   - Develop tool selection UI components

2. **Enhanced Architecture**:
   - Abstract tool interface layer
   - Implement tool routing system
   - Add tool-specific context management

3. **UI Improvements**:
   - Tool visualization components
   - Interactive tool selection interface
   - Enhanced error handling for tool operations

---

### Key Achievements:
✔️ Successful implementation of clean architecture  
✔️ Effective async backend with MongoDB integration  
✔️ Maintained UI quality through architectural changes  
✔️ Established foundation for future extensibility  

### Challenges Faced:
❌ Complex debugging challenges in frontend-backend integration  
❌ Intermittent errors in tool operations due to asynchronous behavior


## ✨ Features (Current & Planned)

  * **Conversational AI:** Core chat functionality powered by state-of-the-art LLMs like Gemini and OpenAI models.
  * **Dynamic Layout:** A responsive and modern user interface built with React.js.
  * **Agentic Workflows:** (Planned) Integration of LangGraph to create complex, stateful multi-agent and multi-tool workflows.
  * **Tool Integration:** (Planned) Ability to connect with various tools and APIs to perform actions.
  * **Chat History:** (Planned) Store and retrieve conversations using MongoDB.
  * **Customizable Workflows:** (Planned) A user-friendly interface to create and manage dynamic workflows, similar to n8n.

## 🛠️ Technology Stack

  * **Frontend:** [React.js](https://reactjs.org/)
  * **Backend:** [FastAPI](https://fastapi.tiangolo.com/)
  * **Database:** [MongoDB](https://www.mongodb.com/)
  * **AI/LLM Orchestration:** [LangChain](https://www.langchain.com/), [LangGraph](https://langchain-ai.github.io/langgraph/)
  * **AI Models:** [Google Gemini](https://ai.google.dev/), [OpenAI API](https://openai.com/api/)

## 🚀 Getting Started

Instructions on how to set up and run the project locally will be available here once the initial version is stable.

### Prerequisites

  * Node.js & npm
  * Python 3.9+ & pip
  * MongoDB instance (local or cloud)
  * API keys for Gemini / OpenAI

### Installation

```bash
# Clone the repository
git clone https://github.com/sbndAbhijeet/ChatMe.git
cd ChatMe

# --- Frontend Setup ---
# (Instructions to be added)
# Example:
# cd frontend
# npm install
# npm run dev

# --- Backend Setup ---
# Make sure you have Python 3.9+ and uv installed
## Installation

# 1. Install `uv` (if not installed):
# pip install uv

# (Instructions to be added)
# Example:
# cd backend
# uv pip install -r requirements.txt
# uv run fastapi dev src/chat/server.py

# --- Environment Variables ---
# Create a .env file and add your credentials
# Example:
# GEMINI_API_KEY="your_gemini_key"
# MONGODB_URI="your_mongodb_connection_string"
# DEBUG="true"
```

## 🗺️ Project Roadmap

  * [ ] Develop core real-time chat interface.
  * [ ] Integrate base Gemini/OpenAI models for Q\&A.
  * [ ] Set up user authentication and database for chat history.
  * [ ] Implement basic LangChain agents.
  * [ ] Design and build stateful workflows with LangGraph.
  * [ ] Develop a UI for creating and managing custom workflows.
  * [ ] Expand tool library for agents.

## 🤝 Contributing

Contributions are welcome\! This project is in its early stages, and any help with development, bug-fixing, or feature suggestions would be greatly appreciated. Please feel free to open an issue or submit a pull request.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## 📄 License

This project is distributed under the MIT License.