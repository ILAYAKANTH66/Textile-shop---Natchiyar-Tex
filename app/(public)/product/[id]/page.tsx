'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function ProductDetailPage(props: { params: Promise<{ id: string }> }) {
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(100);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { id } = await props.params;
        const res = await fetch(`/api/products/${id}`);
        if (res.ok) {
          const data = await res.json();
          setProduct(data.product);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [props.params]);

  if (loading) {
    return <div style={{ padding: '5rem', textAlign: 'center' }}>Loading product details...</div>;
  }

  if (!product) {
    return <div style={{ padding: '5rem', textAlign: 'center' }}>Product not found.</div>;
  }

  const gallery =
    product.images && product.images.length > 0
      ? product.images.sort((a: any, b: any) => a.order - b.order).map((i: any) => i.imageUrl).filter(Boolean)
      : product.imageUrl
        ? [product.imageUrl]
        : [];

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? gallery.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev === gallery.length - 1 ? 0 : prev + 1));
  };

  const currentImage = gallery[currentImageIndex] || '';

  const handleAddToCart = async () => {
    if (quantity < 100) {
      alert("Minimum order quantity is 100 units.");
      return;
    }
    
    try {
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id, quantity }),
      });
      if (res.ok) {
        alert("Added to cart successfully.");
      } else {
        const data = await res.json();
        alert(data.error || "Please login to add to cart.");
      }
    } catch {
      alert("Error adding to cart.");
    }
  };

  return (
    <div className="container animate-fade-in" style={styles.container}>
      <Link href="/collections" style={styles.backLink}>← Back to Collections</Link>
      
      <div style={styles.grid}>
        <div style={styles.imageCol}>
          {gallery.length > 0 ? (
            <>
              <div style={styles.mainImage}>
                <Image
                  src={currentImage}
                  alt={product.title}
                  fill
                  sizes="(max-width: 900px) 100vw, 50vw"
                  style={{ objectFit: 'cover' }}
                  priority
                />
                {gallery.length > 1 && (
                  <>
                    <button onClick={handlePrevImage} style={styles.carouselBtnL}>‹</button>
                    <button onClick={handleNextImage} style={styles.carouselBtnR}>›</button>
                  </>
                )}
              </div>
              {gallery.length > 1 && (
                <div style={styles.thumbRow}>
                  {gallery.map((url: any, idx: number) => (
                    <div 
                      key={url + idx} 
                      onClick={() => setCurrentImageIndex(idx)}
                      style={{
                        ...styles.thumb,
                        borderColor: currentImageIndex === idx ? 'var(--color-primary)' : 'var(--color-border)',
                        borderWidth: currentImageIndex === idx ? '2px' : '1px'
                      }}
                    >
                      <Image src={url} alt={`Thumbnail ${idx}`} fill sizes="80px" style={{ objectFit: 'cover' }} />
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

          {product.isAvailable && (
            <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <label htmlFor="qty" style={{ fontWeight: 600 }}>Quantity:</label>
              <input 
                id="qty"
                type="number" 
                min="100" 
                value={quantity} 
                onChange={(e) => setQuantity(Number(e.target.value))}
                style={styles.qtyInput}
              />
            </div>
          )}
          
          <div style={styles.actions}>
            <button 
              onClick={handleAddToCart}
              disabled={!product.isAvailable || quantity < 100}
              style={{
                ...styles.cartBtn,
                opacity: (!product.isAvailable || quantity < 100) ? 0.5 : 1,
                cursor: (!product.isAvailable || quantity < 100) ? 'not-allowed' : 'pointer',
              }}
            >
              Add to Cart
            </button>
            <Link 
              href={product.isAvailable && quantity >= 100 ? `/checkout?product=${product.id}&quantity=${quantity}` : '#'} 
              style={{
                ...styles.orderBtn,
                opacity: (!product.isAvailable || quantity < 100) ? 0.5 : 1,
                pointerEvents: (!product.isAvailable || quantity < 100) ? 'none' : 'auto',
              }}
              onClick={(e) => {
                if (quantity < 100) { e.preventDefault(); alert('Minimum order quantity is 100 units.'); }
              }}
            >
              Checkout Now
            </Link>
          </div>
          
          <div style={styles.deliveryInfo}>
             <p>⚖️ Minimum order quantity: 100 units</p>
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
    backgroundColor: '#8b6a3f',
    color: 'white',
    padding: '1rem',
    textAlign: 'center' as 'center',
    borderRadius: 'var(--radius-sm)',
    fontWeight: 600,
    fontSize: '1.1rem',
    transition: 'background-color var(--transition-fast)',
  },
  cartBtn: {
    flex: 1,
    backgroundColor: 'var(--color-surface)',
    border: '1px solid #8b6a3f',
    color: '#8b6a3f',
    padding: '1rem',
    textAlign: 'center' as 'center',
    borderRadius: 'var(--radius-sm)',
    fontWeight: 600,
    fontSize: '1.1rem',
  },
  qtyInput: {
    padding: '0.5rem',
    width: '100px',
    borderRadius: '4px',
    border: '1px solid var(--color-border)'
  },
  carouselBtnL: {
    position: 'absolute' as 'absolute',
    left: '10px',
    top: '50%',
    transform: 'translateY(-50%)',
    backgroundColor: 'rgba(255,255,255,0.8)',
    border: 'none',
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    fontSize: '1.5rem',
    cursor: 'pointer',
    zIndex: 10
  },
  carouselBtnR: {
    position: 'absolute' as 'absolute',
    right: '10px',
    top: '50%',
    transform: 'translateY(-50%)',
    backgroundColor: 'rgba(255,255,255,0.8)',
    border: 'none',
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    fontSize: '1.5rem',
    cursor: 'pointer',
    zIndex: 10
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
