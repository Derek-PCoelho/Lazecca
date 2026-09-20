// Recriado literalmente de design_files/js/components.jsx — OrnamentDivider
export default function OrnamentDivider({ label }) {
  return (
    <div className="ornament">
      <span className="ornament-diamond"></span>
      {label && <span style={{ padding: '0 4px' }}>{label}</span>}
      <span className="ornament-diamond"></span>
    </div>
  );
}
