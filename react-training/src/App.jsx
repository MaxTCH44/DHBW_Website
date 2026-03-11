import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Production from './pages/Production';
import Recycling from './pages/Recycling';
import Electrolyzers from './pages/Electrolyzers';
import Header from './components/Header'; 
import './App.css';

export default function App() {
  return (
    <BrowserRouter>
      <div className="app-container">
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<Production />} />
            <Route path="/production" element={<Production />} />
            <Route path="/recycling" element={<Recycling />} />
            <Route path="/electrolyzers" element={<Electrolyzers />} />
          </Routes>
        </main>
        
      </div>
    </BrowserRouter>
  );
}