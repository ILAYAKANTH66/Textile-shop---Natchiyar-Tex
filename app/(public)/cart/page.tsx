'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

type CartItem = {
  id: string;
  quantity: number;
  product: {
    id: string;
    title: string;
    price: number;
    imageUrl: string;
    images?: { imageUrl: string }[];
  };
};

export default function CartPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [items, setItems] = useState<CartItem[]>([]);

  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [addressLine, setAddressLine] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');

  const total = useMemo(() => {
    return items.reduce((sum, it) => sum + it.quantity * it.product.price, 0);
  }, [items]);

  const fetchCart = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/cart');
      if (res.status === 401) {
        router.push('/login?redirect=/cart');
        return;
      }
      const data = await res.json();
      setItems((data.cart?.items || []) as CartItem[]);
    } catch {
      setError('Failed to load cart');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateQty = async (itemId: string, quantity: number) => {
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/cart/item', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId, quantity }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Failed');
      await fetchCart();
    } catch (e: any) {
      setError(e?.message || 'Failed to update cart');
    } finally {
      setSaving(false);
    }
  };

  const checkout = async () => {
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/cart/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName,
          customerEmail,
          addressLine,
          city,
          state,
          pincode,
        }),
      });
      const data = await res.json();
      if (res.status === 401) {
        router.push('/login?redirect=/cart');
        return;
      }
      if (!res.ok) throw new Error(data?.error || 'Checkout failed');
      router.push('/orders');
    } catch (e: any) {
      setError(e?.message || 'Checkout failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ padding: '2rem' }}>Loading cart…</div>;

  return (
    <div className="animate-fade-in" style={{ maxWidth: 1100, margin: '0 auto' }}>
      <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', marginBottom: '1rem' }}>Cart</h1>
      {error && (
        <div style={{ background: 'var(--color-error)', color: 'white', padding: '0.75rem', borderRadius: 8, marginBottom: '1rem' }}>
          {error}
        </div>
      )}

      {items.length === 0 ? (
        <div style={{ padding: '2rem', color: 'var(--color-text-muted)' }}>Your cart is empty.</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '1.5rem' }}>
          <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 12 }}>
            {items.map((it) => {
              const img = it.product.images?.[0]?.imageUrl || it.product.imageUrl;
              return (
                <div key={it.id} style={{ display: 'grid', gridTemplateColumns: '90px 1fr 160px', gap: '1rem', padding: '1rem', borderBottom: '1px solid var(--color-border)' }}>
                  <div style={{ position: 'relative', width: 90, height: 110, borderRadius: 10, overflow: 'hidden' }}>
                    {img ? <img src={img} alt={it.product.title} onError={(e) => e.currentTarget.src='/fallback.jpg'} style={{ objectFit: 'cover', width: '100%', height: '100%' }} /> : null}
                  </div>
                  <div>
                    <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.05rem' }}>{it.product.title}</div>
                    <div style={{ color: 'var(--color-text-muted)', marginTop: 6 }}>₹{it.product.price.toFixed(2)}</div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10 }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, border: '1px solid var(--color-border)', borderRadius: 10, padding: '0.25rem 0.5rem' }}>
                      <button disabled={saving} onClick={() => updateQty(it.id, Math.max(0, it.quantity - 1))}>-</button>
                      <span style={{ minWidth: 24, textAlign: 'center' }}>{it.quantity}</span>
                      <button disabled={saving} onClick={() => updateQty(it.id, it.quantity + 1)}>+</button>
                    </div>
                    <div style={{ fontWeight: 600 }}>₹{(it.quantity * it.product.price).toFixed(2)}</div>
                    <button disabled={saving} style={{ textDecoration: 'underline', color: 'var(--color-error)' }} onClick={() => updateQty(it.id, 0)}>
                      Remove
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 12, padding: '1rem' }}>
            <h2 style={{ fontFamily: 'var(--font-sans)', fontSize: '1.1rem', marginBottom: '0.75rem' }}>Order request</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <input placeholder="Name" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
              <input placeholder="Email" type="email" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} />
              <textarea placeholder="Address" rows={3} value={addressLine} onChange={(e) => setAddressLine(e.target.value)} />
              <input placeholder="City" value={city} onChange={(e) => setCity(e.target.value)} />
              <input placeholder="State" value={state} onChange={(e) => setState(e.target.value)} />
              <input placeholder="Pincode" value={pincode} onChange={(e) => setPincode(e.target.value.replace(/\\D/g, '').slice(0, 6))} />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontWeight: 600 }}>
                <span>Total</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
              <button
                disabled={saving}
                onClick={checkout}
                style={{ marginTop: 8, background: 'var(--color-primary)', color: 'white', padding: '0.9rem', borderRadius: 10, fontWeight: 600 }}
              >
                {saving ? 'Submitting…' : 'Place order request'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

