export default function ResultDisplay({ cost }) {
  return (
    <div className="result">
      <strong>Estimated cost:</strong> {cost} €/kg
    </div>
  );
}