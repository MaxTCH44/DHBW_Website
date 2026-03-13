function Selector({ itemsList, selectedItem, onItemChange }){
    const selectedIndex = itemsList.findIndex(item => item.id === selectedItem.id);
    return(
        <select value={selectedIndex} onChange={onItemChange}>
            {itemsList.map((item, index) => (
                <option key={index} value={index}>
                    {item.name}
                </option>
            ))}
        </select>
    );
}

function Checkbox({ isOwned, onOwnedChange, ownedLabel }){
    return(
        <div className="checkbox-field" style={{ margin: '1rem 0' }}>
            <label>
                <input 
                    type="checkbox" 
                    checked={isOwned} 
                    onChange={(e) => onOwnedChange(e.target.checked)} 
                />
                {" "}{ownedLabel}
            </label>
        </div>
    );
}

export default function EquipmentSelector({ label, itemsList, selectedItem, onItemChange, isOwned, onOwnedChange, ownedLabel }) {
    return (
        <div className="field">
            <label>{label}</label>
            <Selector itemsList={itemsList} selectedItem={selectedItem} onItemChange={onItemChange} />
            <Checkbox isOwned={isOwned} onOwnedChange={onOwnedChange} ownedLabel={ownedLabel} />
        </div>
    );
}