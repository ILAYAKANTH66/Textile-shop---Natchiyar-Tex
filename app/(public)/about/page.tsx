import React from 'react';

export const metadata = {
  title: 'About | Natchiyar Tex',
  description: 'A modern ecommerce platform specializing in sarees and traditional textiles',
};

export default function AboutPage() {
  return (
    <div style={styles.container} className="animate-fade-in">
      <h1 style={styles.title}>About Nachiyar Tex</h1>
      <div style={styles.divider}></div>
      <div style={styles.content}>
        <p style={styles.paragraph}>
          Welcome to <strong style={styles.strong}>Nachiyar Tex</strong>. We are a modern ecommerce platform specializing in premium sarees and traditional textiles. 
        </p>
        <p style={styles.paragraph}>
          Our platform focuses on blending timeless tradition with modern technology. We pride ourselves on providing our customers with an unparalleled, smooth shopping experience, backed by a cutting-edge tech stack to ensure reliability and speed.
        </p>
        <p style={styles.paragraph}>
          Discover our rich collection of the highest quality products—carefully curated to celebrate the elegance and heritage of Indian textiles.
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '4rem 2rem',
    minHeight: '60vh',
  },
  title: {
    fontSize: '2.5rem',
    fontFamily: 'var(--font-serif)',
    color: '#4b3421',
    marginBottom: '1rem',
  },
  divider: {
    width: '60px',
    height: '4px',
    backgroundColor: '#8b6a3f',
    marginBottom: '2rem',
  },
  content: {
    color: 'var(--color-text)',
    lineHeight: '1.8',
    fontSize: '1.1rem',
  },
  paragraph: {
    marginBottom: '1.5rem',
  },
  strong: {
    color: '#8b6a3f',
    fontWeight: 600,
  }
};
