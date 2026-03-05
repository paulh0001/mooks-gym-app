'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div
      style={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        background: '#0a0a0f',
        color: '#d0d0d0',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      <h1 style={{ color: '#ff3131', marginBottom: 8 }}>Something went wrong</h1>
      <p style={{ color: '#7a7a8e', marginBottom: 16, textAlign: 'center' }}>
        {error.message}
      </p>
      <button
        type="button"
        onClick={reset}
        style={{
          padding: '10px 20px',
          background: '#39ff14',
          color: '#0a0a0f',
          border: 'none',
          borderRadius: 4,
          fontWeight: 600,
          cursor: 'pointer',
        }}
      >
        Try again
      </button>
    </div>
  );
}
