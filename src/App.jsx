import { HashRouter, Routes, Route } from 'react-router-dom';

import electrolyzersData from "./data/types_of_electrolyzers.json";
import compressorsData from "./data/types_of_compressors.json";

import ProductionChain from './pages/ProductionChain';
import Recycling from './pages/Recycling';
import RecyclingProcess from './pages/RecyclingProcess';
import EquipmentOverview from './pages/EquipmentOverview';
import Calculator from './pages/Calculator';
import Home from './pages/Home';
import Contact from './pages/Contact';
import AboutUs from './pages/AboutUs';
import NotFound from './pages/NotFound';
import References from './pages/References';

import Header from './components/Header';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';

import './App.css';




export default function App() {
  return (
    <HashRouter>
      <ScrollToTop />
      <div className="app-container">
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/calculator" element={<Calculator />} />
            <Route path="/production" element={<ProductionChain />} />
            <Route path="/recycling" element={<Recycling />} />
            <Route path="/recycling-process" element={<RecyclingProcess />} />
            <Route path="/electrolyzers" element={<EquipmentOverview equipmentList={electrolyzersData}/>} />
            <Route path="/compressors" element={<EquipmentOverview equipmentList={compressorsData}/>} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/references" element={<References />} />
            {/* If page not found */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </HashRouter>
  );
}