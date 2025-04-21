import React from 'react';

export default function History() {
  const [months, setMonths] = React.useState('');
  const history = []; // placeholder—replace with real data later

  const handleSubmit = e => {
    e.preventDefault();
    // TODO: filter or load history based on `months`
    console.log(`Load history for past ${months} month(s)`);
  };

  return (
    <div
      style={{
        maxWidth: 600,
        margin: '2rem auto',
        padding: '1rem',
        borderRadius: 8,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        fontFamily: 'sans-serif',
      }}
    >
      <h1 style={{ textAlign: 'center', marginBottom: '1rem' }}>
        History Page
      </h1>

      <form onSubmit={handleSubmit} style={{ marginBottom: '1.5rem' }}>
        <label
          style={{
            display: 'block',
            marginBottom: '0.5rem',
            fontSize: '0.9rem',
          }}
        >
          Please input your history wanted in months:
        </label>
        <input
          type="text"
          placeholder="e.g. 6"
          value={months}
          onChange={e => setMonths(e.target.value)}
          style={{
            width: '100%',
            padding: '0.5rem',
            borderRadius: 4,
            border: '1px solid #ccc',
            fontSize: '1rem',
            marginBottom: '0.75rem',
          }}
        />
        <button
          type="submit"
          style={{
            width: '100%',
            padding: '0.75rem',
            border: 'none',
            borderRadius: 4,
            background: '#007bff',
            color: '#fff',
            fontSize: '1rem',
            cursor: 'pointer',
          }}
        >
          Submit
        </button>
      </form>

      {history.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#666' }}>
          No past records yet.
        </p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {history.map((rec, i) => (
            <li
              key={i}
              style={{
                padding: '0.75rem',
                borderBottom: '1px solid #eee',
                display: 'flex',
                justifyContent: 'space-between',
              }}
            >
              <span>{rec.symptoms}</span>
              <span>{rec.disease}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}







