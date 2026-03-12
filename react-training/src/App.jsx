import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ProductionChain from './pages/ProductionChain';
import Recycling from './pages/Recycling';
import Electrolyzers from './pages/Electrolyzers';
import Calculator from './pages/Calculator';
import Header from './components/Header';
import Footer from './components/Footer';
import './App.css';

export default function App() {
  return (
    <BrowserRouter>
      <div className="app-container">
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<Calculator />} />
            <Route path="/calculator" element={<Calculator />} />
            <Route path="/production" element={<ProductionChain />} />
            <Route path="/recycling" element={<Recycling />} />
            <Route path="/electrolyzers" element={<Electrolyzers />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}