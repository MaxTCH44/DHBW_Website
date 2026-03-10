function UnitButton({ units, currentUnit, onUnitChange }) {
    const isArray = Array.isArray(units);

    if (!isArray || units.length <= 1) {
        return <button disabled>{isArray ? units[0].name : units}</button>;
    }

    function handleClick() {
        const currentIndex = units.findIndex(u => u.name === currentUnit.name);
        const nextIndex = (currentIndex + 1) % units.length;
        if (onUnitChange) {
            onUnitChange(units[nextIndex]);
        }
    }

    return (
        <button onClick={handleClick}>
            {currentUnit.name}
        </button>
    );
}

function InputBar({ value, onChange, min, max }) {
  
  const handleChange = (e) => {
    if (e.target.value === '') {
      onChange('');
      return;}
    onChange(Number(e.target.value));
  };

  const handleBlur = () => {
    if (value === '') return;
    let finalValue = value;
    if (typeof min === "number") {finalValue = Math.max(finalValue, min);}
    if (typeof max === "number") {finalValue = Math.min(finalValue, max);}
    if (finalValue !== value) {onChange(finalValue);}
  };

  return ( 
    <input
        type="number"
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        min={min} 
        max={max}
    />
  );
}

export function ValueEntry({ label, value, units, currentUnit, onValueChange, onUnitChange }) {
  return (
    <div className="field">
        <label>{label}</label>
        <div className='input-bar'>
            <InputBar value={value} onChange={onValueChange} min={0} max={null}/>
            <UnitButton 
                units={units} 
                currentUnit={currentUnit} 
                onUnitChange={onUnitChange} 
            />
        </div>
    </div>
  );
}

function Slider({ value, onChange, min, max }) {
  return ( 
    <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(e.target.value === '' ? '' : Number(e.target.value))}
    />
  );
}

export function SliderEntry({ label, value, units, onValueChange, min, max }) {
    return (
        <div className="field">
            <label>{label} ({units})</label>
            <div className='slider'>
                <Slider value={value} onChange={onValueChange} min={min} max={max}/>
                <InputBar value={value} onChange={onValueChange} min={min} max={max}/>
            </div>
        </div>
    );
}