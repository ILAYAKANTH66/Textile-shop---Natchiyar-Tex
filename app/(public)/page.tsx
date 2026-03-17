export const dynamic = "force-dynamic";
import prisma from '@/lib/prisma';
import Link from 'next/link';
import FallbackImage from '@/components/FallbackImage';

export default async function HomePage() {
  const products = await prisma.product.findMany({
    where: { isAvailable: true },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="animate-fade-in" style={{ backgroundColor: 'transparent' }}>
      {/* Editorial Hero */}
      <section style={styles.hero}>
        <div style={styles.heroOverlay}>
          <div className="container" style={styles.heroContent}>
            <h1 style={styles.heroTitle}>Timeless Heritage, Woven with Care</h1>
            <p style={styles.heroSubtitle}>
              Discover our premium collection of authentic cotton fabrics directly from traditional weavers.
            </p>
            <Link href="/shop" style={styles.heroCta}>Explore Collection</Link>
          </div>
        </div>
      </section>

      {/* Craftsmanship Story */}
      <section className="container" style={styles.storySection}>
        <div style={styles.storyGrid}>
          <div style={styles.storyText}>
            <span style={styles.accentLabel}>Our Legacy</span>
            <h2 style={styles.storyTitle}>A Tradition of Quality</h2>
            <p style={styles.storyBody}>
              For decades, Natchiyar Tex has been synonymous with the finest handloom and powerloom textiles in Theni. 
              Our weavers masterfully blend traditional techniques with modern precision to create fabrics that breathe 
              with the soul of Tamil Nadu. Each thread is a testament to our commitment to pure cotton and consistent bulk supply.
            </p>
            <Link href="/collections" style={styles.storyLink}>View Collections →</Link>
          </div>
          <div style={styles.storyImage}>
            <FallbackImage 
              src="https://images.unsplash.com/photo-1544441893-675973e31985?q=80&w=1000&auto=format&fit=crop" 
              alt="Textile Loom" 
              style={{ objectFit: 'cover', width: '100%', height: '100%', borderRadius: 'var(--radius-md)' }} 
            />
          </div>
        </div>
      </section>

      {/* Featured Horizontal Scroll */}
      <section style={styles.featuredSection}>
        <div className="container">
          <h2 style={styles.sectionTitle}>Featured Silks & Cottons</h2>
        </div>
        <div style={styles.horizontalScroll}>
          {products.slice(0, 6).map((product: any) => (
            <Link href={`/product/${product.id}`} key={product.id} style={styles.scrollCard}>
              <div style={styles.scrollImageWrapper}>
                <FallbackImage 
                  src={product.imageUrl} 
                  alt={product.title} 
                  style={{ objectFit: 'cover', width: '100%', height: '100%' }} 
                />
              </div>
              <div style={styles.scrollInfo}>
                <h4 style={styles.scrollTitle}>{product.title}</h4>
                <p style={styles.scrollPrice}>₹{product.price}</p>
              </div>
            </Link>
          ))}
          <div style={{ paddingRight: '3vw', minWidth: '100px' }}></div>
        </div>
      </section>

      {/* Contact Preview / CTA */}
      <section className="container" style={styles.contactPreview}>
        <div style={styles.contactCard}>
          <h3>Looking for Bulk Supply?</h3>
          <p>We specialize in large-scale manufacturing for wholesale partners. Connect with our weavers today.</p>
          <Link href="/contact" style={styles.contactBtn}>Get in Touch</Link>
        </div>
      </section>
    </div>
  );
}

const styles = {
  hero: {
    height: '65vh',
    backgroundImage: 'url("https://images.unsplash.com/photo-1620799140188-3b2a02fd9a77?q=80&w=2000&auto=format&fit=crop")',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    position: 'relative' as 'relative',
    margin: '0 -3vw 4rem -3vw',
  },
  heroOverlay: {
    position: 'absolute' as 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.35)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center' as 'center',
  },
  heroContent: {
    color: 'white',
    maxWidth: '800px',
  },
  heroTitle: {
    color: 'white',
    fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
    marginBottom: '1rem',
    fontFamily: 'var(--font-serif)',
  },
  heroSubtitle: {
    fontSize: '1.25rem',
    opacity: 0.95,
    marginBottom: '2.5rem',
  },
  heroCta: {
    display: 'inline-block',
    backgroundColor: 'white',
    color: '#4b3421',
    padding: '1.1rem 2.8rem',
    borderRadius: 'var(--radius-sm)',
    fontWeight: 600,
    textTransform: 'uppercase' as 'uppercase',
    letterSpacing: '1px',
    fontSize: '0.85rem',
  },
  storySection: {
    padding: '4rem 0',
    marginBottom: '4rem',
  },
  storyGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '4rem',
    alignItems: 'center',
  },
  storyText: {
    display: 'flex',
    flexDirection: 'column' as 'column',
    gap: '1.2rem',
  },
  accentLabel: {
    color: 'var(--color-primary)',
    fontWeight: 700,
    textTransform: 'uppercase' as 'uppercase',
    letterSpacing: '3px',
    fontSize: '0.8rem',
  },
  storyTitle: {
    fontSize: '2.8rem',
    lineHeight: 1.2,
    color: '#4b3421',
  },
  storyBody: {
    fontSize: '1.1rem',
    lineHeight: 1.8,
    color: 'var(--color-text-muted)',
  },
  storyLink: {
    color: '#4b3421',
    fontWeight: 600,
    textDecoration: 'none',
    borderBottom: '1px solid #4b3421',
    alignSelf: 'flex-start',
    paddingBottom: '2px',
    marginTop: '1rem',
  },
  storyImage: {
    position: 'relative' as 'relative',
    height: '500px',
    boxShadow: 'var(--shadow-lg)',
  },
  featuredSection: {
    padding: '6rem 0',
    backgroundColor: 'rgba(255,255,255,0.3)',
    margin: '0 -3vw',
  },
  sectionTitle: {
    textAlign: 'center' as 'center',
    fontSize: '2.2rem',
    marginBottom: '4rem',
  },
  horizontalScroll: {
    display: 'flex',
    gap: '2.5rem',
    overflowX: 'auto' as 'auto',
    padding: '0 3vw 2rem 3vw',
    scrollSnapType: 'x mandatory',
    msOverflowStyle: 'none' as 'none',
    scrollbarWidth: 'none' as 'none',
  },
  scrollCard: {
    minWidth: '320px',
    backgroundColor: 'white',
    borderRadius: 'var(--radius-md)',
    overflow: 'hidden',
    boxShadow: 'var(--shadow-md)',
    textDecoration: 'none',
    color: 'inherit',
    scrollSnapAlign: 'start',
  },
  scrollImageWrapper: {
    position: 'relative' as 'relative',
    height: '400px',
  },
  scrollInfo: {
    padding: '1.5rem',
    textAlign: 'center' as 'center',
  },
  scrollTitle: {
    fontSize: '1.1rem',
    marginBottom: '0.5rem',
  },
  scrollPrice: {
    color: 'var(--color-primary)',
    fontWeight: 700,
  },
  contactPreview: {
    padding: '8rem 0',
    textAlign: 'center' as 'center',
  },
  contactCard: {
    backgroundColor: '#4b3421',
    color: 'white',
    padding: '5rem 3rem',
    borderRadius: 'var(--radius-lg)',
    maxWidth: '900px',
    margin: '0 auto',
    boxShadow: 'var(--shadow-xl)',
    display: 'flex',
    flexDirection: 'column' as 'column',
    alignItems: 'center',
    gap: '1.5rem',
  },
  contactBtn: {
    backgroundColor: '#d4af37',
    color: 'white',
    padding: '1rem 3rem',
    borderRadius: 'var(--radius-sm)',
    fontWeight: 600,
    textTransform: 'uppercase' as 'uppercase',
    marginTop: '1rem',
  }
};
