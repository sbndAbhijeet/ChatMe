import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import ChatBot from "./pages/ChatBot/ChatBot";
import Layout from "./components/Layout/Layout"
import Starter from "./pages/Starter";
import NewChatRedirect from "./components/NewChatRedirect";
import Blogs from "./pages/Blog/Blogs";
import CreateBlog from "./pages/Blog/CreateBlog";
import CreateNote from "./pages/Blog/CreateNote";
import EditNote from "./pages/Blog/EditNote";
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import ProtectedRoute from "./components/ProtectedRoute";
import Settings from "./pages/Settings";

const App = () => {

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Starter />}/>
        </Route>

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/chatbot" element={<NewChatRedirect/>}/>
            <Route path="/chatbot/:id" element={<ChatBot/>}/>
            <Route path="/blogs" element={<Blogs/>}/>
            <Route path="/blogs/:blogId/note/:noteId" element={<EditNote/>}/>
            <Route path="/create-blog" element={<CreateBlog />}/>
            <Route path="/create-note" element={<CreateNote />}/>
            <Route path="/settings" element={<Settings />}/>
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App;