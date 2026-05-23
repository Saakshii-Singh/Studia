import {BrowserRouter,Routes,Route} from 'react-router-dom';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Room from './pages/Room';

function App() {
  return(
    <BrowserRouter>
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/room/:id" element={<Room />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;