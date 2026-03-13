import { HashRouter, Routes, Route } from 'react-router-dom';
import ProductionChain from './pages/ProductionChain';
import Recycling from './pages/Recycling';
import EquipmentOverview from './pages/EquipmentOverview';
import Calculator from './pages/Calculator';
import Header from './components/Header';
import Footer from './components/Footer';
import './App.css';

import electrolyzersData from "./data/types_of_electrolyzers.json";
import compressorsData from "./data/types_of_compressors.json";



export default function App() {
  return (
    <HashRouter>
      <div className="app-container">
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<Calculator />} />
            <Route path="/calculator" element={<Calculator />} />
            <Route path="/production" element={<ProductionChain />} />
            <Route path="/recycling" element={<Recycling />} />
            <Route path="/electrolyzers" element={<EquipmentOverview equipmentList={electrolyzersData}/>} />
            <Route path="/compressors" element={<EquipmentOverview equipmentList={compressorsData}/>} />
          </Routes>
        </main>
        <Footer />
      </div>
    </HashRouter>
  );
}