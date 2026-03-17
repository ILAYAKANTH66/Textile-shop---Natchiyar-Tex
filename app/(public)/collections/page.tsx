import { prisma } from '@/lib/prisma';
import Image from 'next/image';
import Link from 'next/link';

export default async function CollectionsPage() {
  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' },
    include: {
      products: {
        where: { isAvailable: true },
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  const activeCategories = categories.filter((c: any) => c.products.length > 0);

  return (
    <div className="animate-fade-in">
      <header style={styles.header}>
        <h1 style={styles.title}>Fabric Collections</h1>
        <p style={styles.subtitle}>Explore our textiles curated by material and weave.</p>
      </header>

      {activeCategories.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '5rem' }}>
          <p>No collections found yet.</p>
        </div>
      ) : (
        activeCategories.map((category: any) => (
          <section key={category.id} style={styles.categorySection}>
            <div style={styles.categoryHeader}>
              <h2 style={styles.categoryTitle}>{category.name}</h2>
              <div style={styles.categoryLine}></div>
            </div>
            <div style={styles.grid}>
              {category.products.map((product: any) => (
                <Link href={`/product/${product.id}`} key={product.id} style={styles.card}>
                  <div style={styles.imageWrapper}>
                    <Image 
                      src={product.imageUrl} 
                      alt={product.title} 
                      fill
                      style={{ objectFit: 'cover' }}
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                    />
                  </div>
                  <div style={styles.cardContent}>
                    <h3 style={styles.productTitle}>{product.title}</h3>
                    <p style={styles.productPrice}>₹{product.price.toFixed(2)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
}

const styles = {
  header: {
    marginBottom: '4rem',
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
  categorySection: {
    marginBottom: '5rem',
  },
  categoryHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.5rem',
    marginBottom: '2rem',
  },
  categoryTitle: {
    fontSize: '1.5rem',
    textTransform: 'uppercase' as 'uppercase',
    letterSpacing: '2px',
    color: 'var(--color-primary)',
    whiteSpace: 'nowrap' as 'nowrap',
  },
  categoryLine: {
    flex: 1,
    height: '1px',
    backgroundColor: 'var(--color-border)',
  },
  grid: {
    display: 'flex',
    overflowX: 'auto' as 'auto',
    gap: '2rem',
    paddingBottom: '2rem',
    scrollbarWidth: 'none' as 'none', // Firefox
    msOverflowStyle: 'none' as 'none', // IE/Edge
  },
  card: {
    flex: '0 0 auto',
    width: '280px',
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
    aspectRatio: '1/1',
    backgroundColor: 'var(--color-accent)',
  },
  cardContent: {
    padding: '1rem',
    textAlign: 'center' as 'center',
  },
  productTitle: {
    fontSize: '0.95rem',
    marginBottom: '0.25rem',
    fontFamily: 'var(--font-sans)',
  },
  productPrice: {
    color: 'var(--color-text-muted)',
    fontSize: '0.9rem',
    fontWeight: 500,
  }
};
