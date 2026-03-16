import { prisma } from '@/lib/prisma';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export default async function ProductDetailPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;

  const product = await prisma.product.findUnique({
    where: { id },
    include: { images: true },
  });

  if (!product) {
    notFound();
  }

  const gallery =
    product.images && product.images.length > 0
      ? product.images.map((i) => i.imageUrl).filter(Boolean)
      : product.imageUrl
        ? [product.imageUrl]
        : [];

  return (
    <div className="container animate-fade-in" style={styles.container}>
      <Link href="/" style={styles.backLink}>← Back to Collection</Link>
      
      <div style={styles.grid}>
        <div style={styles.imageCol}>
          {gallery.length > 0 ? (
            <>
              <div style={styles.mainImage}>
                <Image
                  src={gallery[0]}
                  alt={product.title}
                  fill
                  sizes="(max-width: 900px) 100vw, 50vw"
                  style={{ objectFit: 'cover' }}
                  priority
                />
              </div>
              {gallery.length > 1 && (
                <div style={styles.thumbRow}>
                  {gallery.slice(1, 7).map((url) => (
                    <div key={url} style={styles.thumb}>
                      <Image src={url} alt={product.title} fill sizes="80px" style={{ objectFit: 'cover' }} />
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div style={styles.placeholder}>
              <span style={styles.placeholderText}>Fabric image coming soon</span>
            </div>
          )}
        </div>
        
        <div style={styles.contentCol}>
          <h1 style={styles.title}>{product.title}</h1>
          <p style={styles.price}>₹{product.price.toFixed(2)}</p>
          
          <div style={styles.divider}></div>
          
          <h3 style={styles.descriptionTitle}>Fabric details</h3>
          <p style={styles.descriptionText}>{product.description}</p>
          
          <div style={styles.stockStatus}>
            {product.isAvailable ? (
              <span style={{ color: 'var(--color-success)' }}>● In Stock - Ready to order</span>
            ) : (
              <span style={{ color: 'var(--color-error)' }}>● Out of Stock</span>
            )}
          </div>
          
          <div style={styles.actions}>
            <Link 
              href={product.isAvailable ? `/checkout?product=${product.id}` : '#'} 
              style={{
                ...styles.orderBtn,
                opacity: product.isAvailable ? 1 : 0.5,
                pointerEvents: product.isAvailable ? 'auto' : 'none',
              }}
            >
              Request this fabric
            </Link>
          </div>
          
          <div style={styles.deliveryInfo}>
             <p>✨ Premium cotton material for wholesale supply</p>
             <p>🚚 We will contact you after reviewing your order request</p>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    paddingTop: '2rem',
    paddingBottom: '5rem',
  },
  backLink: {
    display: 'inline-block',
    marginBottom: '2rem',
    color: 'var(--color-text-muted)',
    fontSize: '0.95rem',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
    gap: '4rem',
    alignItems: 'start' as 'start',
  },
  imageCol: {
    width: '100%',
  },
  mainImage: {
    position: 'relative' as 'relative',
    width: '100%',
    aspectRatio: '3/4',
    backgroundColor: 'var(--color-accent)',
    borderRadius: 'var(--radius-md)',
    overflow: 'hidden',
  },
  thumbRow: {
    marginTop: '1rem',
    display: 'flex',
    gap: '0.75rem',
    flexWrap: 'wrap' as 'wrap',
  },
  thumb: {
    position: 'relative' as 'relative',
    width: '70px',
    height: '90px',
    borderRadius: 'var(--radius-sm)',
    overflow: 'hidden',
    border: '1px solid var(--color-border)',
  },
  placeholder: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    aspectRatio: '3/4',
    borderRadius: 'var(--radius-md)',
    border: '1px dashed var(--color-border)',
    backgroundColor: 'var(--color-accent)',
  },
  placeholderText: {
    fontSize: '0.9rem',
    color: 'var(--color-text-muted)',
    fontFamily: 'var(--font-sans)',
  },
  contentCol: {
    display: 'flex',
    flexDirection: 'column' as 'column',
    paddingTop: '1rem',
  },
  title: {
    fontSize: '2.5rem',
    marginBottom: '1rem',
    lineHeight: 1.2,
  },
  price: {
    fontSize: '1.75rem',
    color: 'var(--color-primary)',
    fontWeight: 600,
  },
  divider: {
    height: '1px',
    backgroundColor: 'var(--color-border)',
    margin: '2rem 0',
  },
  descriptionTitle: {
    fontSize: '1.25rem',
    marginBottom: '1rem',
    fontFamily: 'var(--font-sans)',
  },
  descriptionText: {
    color: 'var(--color-text-muted)',
    lineHeight: 1.8,
    marginBottom: '2rem',
  },
  stockStatus: {
    marginBottom: '2rem',
    fontWeight: 500,
    fontSize: '0.95rem',
  },
  actions: {
    display: 'flex',
    gap: '1rem',
    marginBottom: '3rem',
  },
  orderBtn: {
    flex: 1,
    backgroundColor: 'var(--color-primary)',
    color: 'white',
    padding: '1rem 2rem',
    textAlign: 'center' as 'center',
    borderRadius: 'var(--radius-sm)',
    fontWeight: 600,
    fontSize: '1.1rem',
    transition: 'background-color var(--transition-fast)',
  },
  deliveryInfo: {
    backgroundColor: 'var(--color-bg)',
    padding: '1.5rem',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--color-border)',
    display: 'flex',
    flexDirection: 'column' as 'column',
    gap: '0.75rem',
    color: 'var(--color-text-muted)',
    fontSize: '0.9rem',
  }
};
