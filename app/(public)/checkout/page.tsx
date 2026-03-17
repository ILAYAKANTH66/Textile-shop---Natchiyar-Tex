'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';

function CheckoutForm() {
  const searchParams = useSearchParams();
  const productId = searchParams.get('product');
  const initialQtyParams = searchParams.get('quantity');
  const router = useRouter();

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [customerName, setCustomerName] = useState('');
  const [customerMobile, setCustomerMobile] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [addressLine, setAddressLine] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');
  const [quantity, setQuantity] = useState(initialQtyParams ? Math.max(100, Number(initialQtyParams)) : 100);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!productId) {
      router.push('/');
      return;
    }

    // 1) Verify the user is logged in before loading checkout
    fetch('/api/auth/me')
      .then(res => {
        if (!res.ok) {
          // Not logged in – send to login with a redirect back here
          router.replace(`/login?redirect=/checkout?product=${productId}`);
          return null;
        }
        return res.json();
      })
      .then(auth => {
        if (!auth) return;
        if (auth.role !== 'customer') {
          setError('You must be logged in as a customer to place an order.');
          setLoading(false);
          return;
        }

        // 2) Now fetch the product
        return fetch(`/api/products/${productId}`)
          .then(res => res.json())
          .then(data => {
            if (data.product) {
              setProduct(data.product);
            } else {
              setError(data.error || 'Product not found');
            }
            setLoading(false);
          });
      })
      .catch(() => {
        setError('Failed to load product');
        setLoading(false);
      });
  }, [productId, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName,
          customerMobile,
          customerEmail,
          addressLine,
          city,
          state,
          pincode,
          items: [{
            productId: product.id,
            quantity,
            priceAtTime: product.price
          }]
        })
      });

      if (res.ok) {
        router.push('/orders');
      } else {
        const data = await res.json();
        if (res.status === 401) {
          router.push(`/login?redirect=/checkout?product=${productId}`);
        } else {
          setError(data.error || 'Failed to submit order');
        }
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="container" style={{ padding: '5rem 0', textAlign: 'center' }}>Loading...</div>;
  if (!product) return <div className="container" style={{ padding: '5rem 0', textAlign: 'center' }}>{error || 'Product not found'}</div>;

  const total = product.price * quantity;

  return (
    <div className="container animate-fade-in" style={styles.container}>
      <h1 style={styles.title}>Complete Your Order</h1>
      
      <div style={styles.grid}>
        <div style={styles.formSection}>
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>Delivery Details</h2>
            {error && <div style={styles.error}>{error}</div>}
            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Full Name</label>
                <input 
                  type="text" 
                  value={customerName}
                  onChange={e => setCustomerName(e.target.value)}
                  placeholder="E.g. Meenakshi Sundaram"
                  required
                />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Mobile Number (optional)</label>
                <input
                  type="tel"
                  value={customerMobile}
                  onChange={e => setCustomerMobile(e.target.value.replace(/\D/g, '').slice(0, 15))}
                  placeholder="+91 98765 43210"
                />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Email</label>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={e => setCustomerEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Address</label>
                <textarea 
                  value={addressLine}
                  onChange={e => setAddressLine(e.target.value)}
                  placeholder="House No, Street, Landmark"
                  rows={3}
                  required
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>City</label>
                  <input value={city} onChange={e => setCity(e.target.value)} required />
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>State</label>
                  <input value={state} onChange={e => setState(e.target.value)} required />
                </div>
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Pincode</label>
                <input
                  value={pincode}
                  onChange={e => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  required
                />
              </div>
              
              <button type="submit" style={styles.submitBtn} disabled={submitting}>
                {submitting ? 'Submitting...' : 'Confirm Order Request'}
              </button>
            </form>
          </div>
        </div>
        
        <div style={styles.summarySection}>
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>Order Summary</h2>
            <div style={styles.productSummary}>
               <div style={styles.productImage}>
                 <Image src={product.imageUrl} alt={product.title} fill style={{objectFit: 'cover'}} />
               </div>
               <div style={styles.productDetails}>
                 <h4 style={styles.productTitle}>{product.title}</h4>
                 <p style={styles.productPrice}>₹{product.price.toFixed(2)}</p>
               </div>
            </div>
            
            <div style={styles.divider}></div>
            
            <div style={styles.summaryRow}>
              <span>Quantity</span>
              <div style={styles.quantityControl}>
                <button type="button" onClick={() => setQuantity(Math.max(100, quantity - 1))} style={styles.qtyBtn}>-</button>
                <span>{quantity}</span>
                <button type="button" onClick={() => setQuantity(quantity + 1)} style={styles.qtyBtn}>+</button>
              </div>
            </div>
            
            <div style={styles.divider}></div>
            
            <div style={styles.summaryTotalRow}>
              <span>Total Amount</span>
              <span style={styles.totalPrice}>₹{total.toFixed(2)}</span>
            </div>
            <p style={styles.disclaimer}>* Payment will be arranged offline upon order confirmation via WhatsApp.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="container" style={{ padding: '5rem 0', textAlign: 'center' }}>Loading checkout...</div>}>
      <CheckoutForm />
    </Suspense>
  );
}

const styles = {
  container: {
    paddingTop: '2rem',
    paddingBottom: '5rem',
  },
  title: {
    fontSize: '2rem',
    marginBottom: '2rem',
    textAlign: 'center' as 'center',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 350px',
    gap: '2rem',
    alignItems: 'start' as 'start',
  },
  formSection: {
    flex: 1,
  },
  summarySection: {
    width: '100%',
  },
  card: {
    backgroundColor: 'var(--color-surface)',
    padding: '2rem',
    borderRadius: 'var(--radius-md)',
    boxShadow: 'var(--shadow-md)',
    border: '1px solid var(--color-border)',
  },
  cardTitle: {
    fontFamily: 'var(--font-sans)',
    fontSize: '1.25rem',
    marginBottom: '1.5rem',
    paddingBottom: '0.75rem',
    borderBottom: '1px solid var(--color-border)',
  },
  form: {
    display: 'flex',
    flexDirection: 'column' as 'column',
    gap: '1.5rem',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column' as 'column',
    gap: '0.5rem',
  },
  label: {
    fontSize: '0.9rem',
    fontWeight: 500,
  },
  submitBtn: {
    backgroundColor: 'var(--color-primary)',
    color: 'white',
    padding: '1rem',
    borderRadius: 'var(--radius-sm)',
    fontWeight: 600,
    fontSize: '1.05rem',
    marginTop: '1rem',
    transition: 'background-color var(--transition-fast)',
  },
  productSummary: {
    display: 'flex',
    gap: '1rem',
    alignItems: 'center',
  },
  productImage: {
    position: 'relative' as 'relative',
    width: '80px',
    height: '100px',
    borderRadius: 'var(--radius-sm)',
    overflow: 'hidden',
  },
  productDetails: {
    flex: 1,
  },
  productTitle: {
    fontSize: '0.95rem',
    marginBottom: '0.25rem',
    fontFamily: 'var(--font-sans)',
  },
  productPrice: {
    color: 'var(--color-text-muted)',
    fontSize: '0.9rem',
  },
  divider: {
    height: '1px',
    backgroundColor: 'var(--color-border)',
    margin: '1.5rem 0',
  },
  summaryRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quantityControl: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-sm)',
    padding: '0.25rem 0.5rem',
  },
  qtyBtn: {
    fontSize: '1.25rem',
    width: '30px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryTotalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '1.2rem',
    fontWeight: 600,
    marginBottom: '1rem',
  },
  totalPrice: {
    color: 'var(--color-primary)',
  },
  disclaimer: {
    fontSize: '0.8rem',
    color: 'var(--color-text-muted)',
    lineHeight: 1.5,
  },
  error: {
    backgroundColor: 'var(--color-error)',
    color: 'white',
    padding: '0.75rem',
    borderRadius: 'var(--radius-sm)',
    marginBottom: '1rem',
    fontSize: '0.9rem',
  }
};
