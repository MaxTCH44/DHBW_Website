import { useState } from 'react';
import './App.css';
import electrolyzers from './data/electrolyzers.json';
import compressors from './data/compressors.json';
import {SliderEntry, ValueEntry} from './components/value-input.jsx';
import ResultDisplay from './components/results.jsx';
import EquipmentSelector from './components/equipment-selector.jsx';



const ELEC_PRICE_UNITS = [
    { name: "€/MWh", factor: 1 }, 
    { name: "€/kWh", factor: 1000 }
];

const POWER_UNITS = [
    { name: "MW", factor: 1 }, 
    { name: "kW", factor: 1000 }
];

const VOLUME_PRICE_UNITS = [
    { name: "€/m³", factor: 1 }, 
    { name: "€/L", factor: 1000 }
];

const TIME_PER_YEAR_UNITS = [
    { name: "days/year", factor: 1 }, 
    { name: "h/year", factor: 24 }
];

const VOLUME_UNITS = [
    { name: "kg", factor: 1 },
    { name: "m³", factor: 11.1 } 
];



function App() {
  const [selectedElectrolyzer, setSelectedElectrolyzer] = useState(electrolyzers[0]);
  const [isElectrolyzerOwned, setIsElectrolyzerOwned] = useState(false);
  const [electrolyserDetail, setElectrolyserDetail] = useState(false);
  
  const [systemSize, setSystemSize] = useState({ value: 1, unit: POWER_UNITS[0] });
  const [operatingTime, setOperatingTime] = useState({ value: 4000, unit: TIME_PER_YEAR_UNITS[1] });

  const [electricityPrice, setElectricityPrice] = useState({ value: 50, unit: ELEC_PRICE_UNITS[0] }); 
  const [waterPrice, setWaterPrice] = useState({ value: 2, unit: VOLUME_PRICE_UNITS[0] });

  const [storageCapacity, setStorageCapacity] = useState({ value: 100, unit: VOLUME_UNITS[0] });
  const [storagePrice, setStoragePrice] = useState(20000);

  const [selectedCompressor, setSelectedCompressor] = useState(compressors[0]);
  const [isCompressorOwned, setIsCompressorOwned] = useState(false);
  const [compressorDetail, setCompressorDetail] = useState(false);


  const handleElectrolyzerChange = (e) => {
      const index = e.target.value;
      setSelectedElectrolyzer(electrolyzers[index]);
  };

  const handleCompressorChange = (e) => {
      const index = e.target.value;
      setSelectedCompressor(compressors[index]);
  };

  const baseElecPrice = electricityPrice.value / electricityPrice.unit.factor;
  const lcoh = (((baseElecPrice) / selectedElectrolyzer.efficiency) * 10).toFixed(2); 
  const capex = (isElectrolyzerOwned ? 0 : selectedElectrolyzer.price) + (isCompressorOwned ? 0 : selectedCompressor.price) + storagePrice;

  return (
    <div className="App">
        <h1>Hydrogen Cost Calculator</h1>
        <div className='entries'>
        <section className="card electrolyser">
            <h2>Electrolyzer Setup</h2>

            <ValueEntry
                label="System size"
                units={POWER_UNITS}
                currentUnit={systemSize.unit}
                value={systemSize.value}
                onValueChange={val => setSystemSize({ ...systemSize, value: val })}
                onUnitChange={u => setSystemSize({ ...systemSize, unit: u })}
            />
            
            <ValueEntry
                label="Operating time"
                units={TIME_PER_YEAR_UNITS}
                currentUnit={operatingTime.unit}
                value={operatingTime.value}
                onValueChange={val => setOperatingTime({ ...operatingTime, value: val })}
                onUnitChange={u => setOperatingTime({ ...operatingTime, unit: u })}
            />

            <div className='sub-card compressor'>
                <EquipmentSelector 
                    label="Electrolyzer Type :"   
                    itemsList={electrolyzers}
                    selectedItem={selectedElectrolyzer}
                    onItemChange={handleElectrolyzerChange}
                    isOwned={isElectrolyzerOwned}
                    onOwnedChange={setIsElectrolyzerOwned}
                    ownedLabel="We already own this electrolyzer"
                />

                {!isElectrolyzerOwned && (
                    <ValueEntry
                        label="Electrolyzer purchase price"
                        units="€"
                        currentUnit="€"
                        value={selectedElectrolyzer.price}
                        onValueChange={val => setSelectedElectrolyzer({ ...selectedElectrolyzer, price: val })}
                        onUnitChange={() => {}}
                    />
                )}

                {electrolyserDetail && (
                    <SliderEntry 
                        label="Efficiency"
                        units="%"
                        value={selectedElectrolyzer.efficiency}
                        onValueChange={eff => setSelectedElectrolyzer({ ...selectedElectrolyzer, efficiency: eff })}
                        min={0}
                        max={100}
                    />
                )}

                <small onClick={() => setElectrolyserDetail(!electrolyserDetail)} style={{marginBottom: '1rem', display: 'block', color: '#666', cursor: 'pointer'}}>
                    <u>{electrolyserDetail ? "Hide details" : "Show details"}</u>
                </small>
            </div>
        </section>

        <section className="card ressources">
            <h2>Resources Costs</h2>

            <ValueEntry
                label="Electricity price"
                units={ELEC_PRICE_UNITS}
                currentUnit={electricityPrice.unit}
                value={electricityPrice.value}
                onValueChange={val => setElectricityPrice({ ...electricityPrice, value: val })}
                onUnitChange={u => setElectricityPrice({ ...electricityPrice, unit: u })} 
            />

            <ValueEntry
                label="Water price"
                units={VOLUME_PRICE_UNITS}
                currentUnit={waterPrice.unit}
                value={waterPrice.value}
                onValueChange={val => setWaterPrice({ ...waterPrice, value: val })}
                onUnitChange={u => setWaterPrice({ ...waterPrice, unit: u })} 
            />
        </section>

        <section className="card compressor">
            <h2>Storage & Compression</h2>
            
            <ValueEntry
                label="Storage capacity"
                units={VOLUME_UNITS}
                currentUnit={storageCapacity.unit}
                value={storageCapacity.value}
                onValueChange={val => setStorageCapacity({ ...storageCapacity, value: val })}
                onUnitChange={u => setStorageCapacity({ ...storageCapacity, unit: u })} 
            />

            <ValueEntry
                label="Storage tanks price"
                units="€"
                currentUnit="€"
                value={storagePrice}
                onValueChange={val => setStoragePrice(val)}
                onUnitChange={() => {}}
            />

            <div className='sub-card compressor'>
                <EquipmentSelector 
                    label="Compressor Type :"
                    itemsList={compressors}
                    selectedItem={selectedCompressor}
                    onItemChange={handleCompressorChange}
                    isOwned={isCompressorOwned}
                    onOwnedChange={setIsCompressorOwned}
                    ownedLabel="We already own a compressor"
                />

                {!isCompressorOwned && (
                    <ValueEntry
                        label="Compressor price"
                        units="€"
                        currentUnit="€"
                        value={selectedCompressor.price}
                        onValueChange={val => setSelectedCompressor({ ...selectedCompressor, price: val })}
                        onUnitChange={() => {}}
                    />
                )}

                {compressorDetail && (
                    <SliderEntry 
                        label="Efficiency"
                        units="%"
                        value={selectedCompressor.efficiency}
                        onValueChange={eff => setSelectedCompressor({ ...selectedCompressor, efficiency: eff })}
                        min={0}
                        max={100}
                    />
                )}

                <small onClick={() => setCompressorDetail(!compressorDetail)} style={{marginBottom: '1rem', display: 'block', color: '#666', cursor: 'pointer'}}>
                    <u>{compressorDetail ? "Hide details" : "Show details"}</u>
                </small>
            </div>
        </section>
        </div>
        <section className="card results">
            <h2>Estimated Results</h2>
            <ResultDisplay cost={lcoh} />
            <div className="result-capex">
                <strong>Total Investment :</strong> {capex.toLocaleString()} €
            </div>
        </section>
    </div>
  );
}

export default App;