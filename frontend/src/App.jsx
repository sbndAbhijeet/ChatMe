import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import ChatBot from "./pages/ChatBot";
import Other from "./pages/Other";
import Layout from "./components/Layout"
import Starter from "./pages/Starter";

const App = () => {

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Starter />}/>
          <Route path="/chatbot" element={<ChatBot/>}/>
          <Route path="/other" element={<Other />}/>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App;