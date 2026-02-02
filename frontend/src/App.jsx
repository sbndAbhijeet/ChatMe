import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import ChatBot from "./pages/ChatBot/ChatBot";
import Other from "./pages/Other";
import Layout from "./components/Layout/Layout"
import Starter from "./pages/Starter";
import NewChatRedirect from "./components/NewChatRedirect";
import NoteTaking from "./pages/Blog/NoteTaking";
import Blogs from "./pages/Blog/Blogs";
import CreateBlog from "./pages/Blog/CreateBlog";
import CreateNote from "./pages/Blog/CreateNote";
import EditNote from "./pages/Blog/EditNote";

const App = () => {

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Starter />}/>
          <Route path="/chatbot" element={<NewChatRedirect/>}/>
          <Route path="/chatbot/:id" element={<ChatBot/>}/>
          <Route path="/blogs" element={<Blogs/>}/>
          <Route path="/blogs/:blogId/note/:noteId" element={<EditNote/>}/>
          <Route path="/create-blog" element={<CreateBlog />}/>
          <Route path="/create-note" element={<CreateNote />}/>
          <Route path="/other" element={<Other />}/>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App;