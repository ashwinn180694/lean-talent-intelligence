export default function Loading() {
  return (
    <div style={{ padding: '28px 32px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <div className="skeleton" style={{ width: '60px', height: '10px', marginBottom: '10px', borderRadius: '4px' }} />
        <div className="skeleton" style={{ width: '200px', height: '24px', marginBottom: '6px', borderRadius: '6px' }} />
        <div className="skeleton" style={{ width: '280px', height: '12px', borderRadius: '4px' }} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '12px' }}>
        {[...Array(8)].map((_, i) => (
          <div key={i} style={{ background: '#212329', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '11px', overflow: 'hidden' }}>
            <div className="skeleton" style={{ height: '3px', borderRadius: 0 }} />
            <div style={{ padding: '14px 15px 16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div className="skeleton" style={{ width: '120px', height: '14px', borderRadius: '4px' }} />
                <div className="skeleton" style={{ width: '14px', height: '14px', borderRadius: '50%' }} />
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                <div className="skeleton" style={{ width: '36px', height: '20px', borderRadius: '99px' }} />
                <div className="skeleton" style={{ width: '52px', height: '20px', borderRadius: '99px' }} />
              </div>
              <div className="skeleton" style={{ width: '80px', height: '11px', borderRadius: '4px' }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
