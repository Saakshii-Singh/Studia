import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./Pages/Home";       // Maps to our stunning landing page
import Login from "./Pages/Login";
import Register from "./Pages/Register";
import Dashboard from "./Pages/Dashboard"; // Maps to our group finder sanctum
import Room from "./Pages/Room";

function App() {
  return (
    <BrowserRouter>
      {/* Container wraps full viewport without padding/centering conflicts */}
      <div className="min-h-screen w-full bg-background text-foreground overflow-x-hidden">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/room/:id" element={<Room />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;