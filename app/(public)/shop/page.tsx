import { prisma } from '@/lib/prisma';
import Image from 'next/image';
import Link from 'next/link';

export default async function ShopPage() {
  const products = await prisma.product.findMany({
    where: { isAvailable: true },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="animate-fade-in">
      <header style={styles.header}>
        <h1 style={styles.title}>All Textiles & Fabrics</h1>
        <p style={styles.subtitle}>Browse our complete collection of premium wholesale cottons and textiles.</p>
      </header>

      <div style={styles.grid}>
        {products.map((product: any) => (
          <Link href={`/product/${product.id}`} key={product.id} style={styles.card}>
            <div style={styles.imageWrapper}>
              <Image 
                src={product.imageUrl} 
                alt={product.title} 
                fill
                style={{ objectFit: 'cover' }}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
            <div style={styles.cardContent}>
              <p style={styles.category}>{product.category}</p>
              <h3 style={styles.productTitle}>{product.title}</h3>
              <p style={styles.productPrice}>₹{product.price.toFixed(2)}</p>
              <button style={styles.viewBtn}>View Details</button>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

const styles = {
  header: {
    marginBottom: '3rem',
    textAlign: 'center' as 'center',
  },
  title: {
    fontSize: '2.5rem',
    marginBottom: '0.5rem',
  },
  subtitle: {
    color: 'var(--color-text-muted)',
    fontSize: '1.1rem',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '2.5rem',
  },
  card: {
    backgroundColor: 'var(--color-surface)',
    borderRadius: 'var(--radius-md)',
    overflow: 'hidden',
    boxShadow: 'var(--shadow-sm)',
    transition: 'transform var(--transition-fast), box-shadow var(--transition-fast)',
    display: 'block',
    border: '1px solid var(--color-border)',
    textDecoration: 'none',
    color: 'inherit',
  },
  imageWrapper: {
    position: 'relative' as 'relative',
    width: '100%',
    aspectRatio: '3/4',
    backgroundColor: 'var(--color-accent)',
  },
  cardContent: {
    padding: '1.5rem',
    textAlign: 'center' as 'center',
  },
  category: {
    fontSize: '0.75rem',
    textTransform: 'uppercase' as 'uppercase',
    letterSpacing: '0.1em',
    color: 'var(--color-primary)',
    marginBottom: '0.5rem',
    fontWeight: 600,
  },
  productTitle: {
    fontSize: '1.1rem',
    marginBottom: '0.5rem',
    fontFamily: 'var(--font-sans)',
    fontWeight: 500,
  },
  productPrice: {
    color: 'var(--color-text)',
    fontWeight: 600,
    fontSize: '1.1rem',
    marginBottom: '1rem',
  },
  viewBtn: {
    width: '100%',
    padding: '0.6rem',
    backgroundColor: 'transparent',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-sm)',
    fontSize: '0.85rem',
    fontWeight: 600,
    textTransform: 'uppercase' as 'uppercase',
    letterSpacing: '1px',
    cursor: 'pointer',
    transition: 'all var(--transition-fast)',
  }
};
