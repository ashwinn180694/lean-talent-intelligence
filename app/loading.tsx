export default function Loading() {
  return (
    <div style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div>
        <div className="skeleton" style={{ width: '80px', height: '12px', marginBottom: '8px' }} />
        <div className="skeleton" style={{ width: '220px', height: '26px', marginBottom: '6px' }} />
        <div className="skeleton" style={{ width: '340px', height: '13px' }} />
      </div>
      {/* Stat row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
        {[...Array(4)].map((_, i) => (
          <div key={i} style={{ background: 'var(--card-bg)', border: '0.5px solid var(--border)', borderRadius: '10px', padding: '16px' }}>
            <div className="skeleton" style={{ width: '60px', height: '11px', marginBottom: '10px' }} />
            <div className="skeleton" style={{ width: '80px', height: '24px' }} />
          </div>
        ))}
      </div>
      {/* Card grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
        {[...Array(6)].map((_, i) => (
          <div key={i} style={{ background: 'var(--card-bg)', border: '0.5px solid var(--border)', borderRadius: '10px', padding: '18px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div className="skeleton" style={{ width: '120px', height: '14px' }} />
              <div className="skeleton" style={{ width: '40px', height: '20px', borderRadius: '99px' }} />
            </div>
            <div className="skeleton" style={{ width: '90px', height: '11px', marginBottom: '8px' }} />
            <div className="skeleton" style={{ width: '100%', height: '11px', marginBottom: '6px' }} />
            <div className="skeleton" style={{ width: '70%', height: '11px' }} />
          </div>
        ))}
      </div>
    </div>
  );
}
