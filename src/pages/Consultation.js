import React from 'react';

const styles = {
  container: {
    maxWidth: 480,
    margin: '2rem auto',
    padding: '1rem',
    borderRadius: 8,
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    fontFamily: 'sans-serif',
  },
  title: { textAlign: 'center', marginBottom: '1rem' },
  form: { display: 'flex', flexDirection: 'column', gap: '0.75rem' },
  field: {
    padding: '0.5rem',
    borderRadius: 4,
    border: '1px solid #ccc',
    fontSize: '1rem',
    resize: 'vertical',
  },
  button: {
    padding: '0.75rem',
    border: 'none',
    borderRadius: 4,
    background: '#007bff',
    color: '#fff',
    fontSize: '1rem',
    cursor: 'pointer',
  },
};

export default function Consultation() {
  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Consultation</h1>
      <form style={styles.form}>
        <textarea
          placeholder="Your symptoms... (Input as a Comma Seperated List)"
          rows={4}
          style={styles.field}
        />
        <input
          type="text"
          placeholder="Diagnosed disease"
          style={styles.field}
        />
        <button type="submit" style={styles.button}>
          Add Record
        </button>
      </form>
    </div>
  );
}

