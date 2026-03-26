'use client';

import { useRouter } from 'next/navigation';

export default function BackButton({ title = "← Back" }: { title?: string }) {
  const router = useRouter();
  
  return (
    <button 
      onClick={(e) => {
        e.preventDefault();
        router.back();
      }} 
      style={styles.backButton}
    >
      {title}
    </button>
  );
}

const styles = {
  backButton: {
    background: 'none',
    border: 'none',
    color: 'var(--color-text-muted)',
    fontSize: '0.95rem',
    cursor: 'pointer',
    padding: '0',
    fontFamily: 'inherit',
    display: 'inline-flex',
    alignItems: 'center',
    marginBottom: '2rem',
  }
};
