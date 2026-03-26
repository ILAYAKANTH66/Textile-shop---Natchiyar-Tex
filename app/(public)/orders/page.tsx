export const dynamic = "force-dynamic";
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { redirect } from 'next/navigation';
import FallbackImage from '@/components/FallbackImage';
import BackButton from '@/components/BackButton';
import { getProductImages } from '@/lib/imageUtils';

async function getCustomerOrders() {
  const cookieStore = await cookies();
  const token = cookieStore.get('customer_token')?.value;
  if (!token) return null;
  
  const payload = await verifyToken(token);
  if (!payload || payload.role !== 'customer') return null;

  return prisma.order.findMany({
    where: { userId: payload.sub as string },
    orderBy: { createdAt: 'desc' },
    include: {
      orderItems: {
        include: { product: true }
      }
    }
  });
}

export default async function OrdersPage() {
  const orders = await getCustomerOrders();

  if (!orders) {
    redirect('/login');
  }

  return (
    <div className="container animate-fade-in" style={styles.container}>
      <BackButton title="← Back" />
      <h1 style={styles.title}>My Orders</h1>
      
      {orders.length === 0 ? (
        <div style={styles.emptyState}>
          <p>You haven't placed any orders yet.</p>
          <a href="/" style={styles.shopLink}>Start Shopping</a>
        </div>
      ) : (
        <div style={styles.ordersList}>
          {orders.map((order: any) => (
            <div key={order.id} style={styles.orderCard}>
              <div style={styles.orderHeader}>
                <div>
                  <span style={styles.orderIdLabel}>Order ID</span>
                  <p style={styles.orderId}>{order.id}</p>
                </div>
                <div>
                  <span style={styles.orderIdLabel}>Date</span>
                  <p>{new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <span style={styles.orderIdLabel}>Total</span>
                  <p style={styles.totalAmount}>₹{order.totalAmount.toFixed(2)}</p>
                </div>
                <div style={styles.statusBadge(order.status)}>
                  {order.status}
                </div>
              </div>
              
              <div style={styles.orderItems}>
                {order.orderItems.map((item: any) => (
                  <div key={item.id} style={styles.itemRow}>
                    <div style={styles.itemImage}>
                       <FallbackImage src={getProductImages(item.product)[0]} alt={item.product.title} style={{objectFit: 'cover', width: '100%', height: '100%'}} />
                    </div>
                    <div style={styles.itemDetails}>
                      <h4 style={styles.itemTitle}>{item.product.title}</h4>
                      <p style={styles.itemPrice}>₹{item.priceAtTime.toFixed(2)} x {item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div style={styles.deliveryInfo}>
                 <strong>Delivery To:</strong> {order.customerName}<br/>
                 {order.addressLine}<br/>
                 {order.city}, {order.state} - {order.pincode}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    paddingTop: '2rem',
    paddingBottom: '5rem',
    maxWidth: '900px',
  },
  title: {
    fontSize: '2rem',
    marginBottom: '2rem',
    borderBottom: '1px solid var(--color-border)',
    paddingBottom: '1rem',
  },
  emptyState: {
    textAlign: 'center' as 'center',
    padding: '4rem 0',
    color: 'var(--color-text-muted)',
    fontSize: '1.1rem',
  },
  shopLink: {
    display: 'inline-block',
    marginTop: '1.5rem',
    backgroundColor: 'var(--color-primary)',
    color: 'white',
    padding: '0.75rem 2rem',
    borderRadius: 'var(--radius-sm)',
    fontWeight: 600,
  },
  ordersList: {
    display: 'flex',
    flexDirection: 'column' as 'column',
    gap: '2rem',
  },
  orderCard: {
    backgroundColor: 'var(--color-surface)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-md)',
    overflow: 'hidden',
    boxShadow: 'var(--shadow-sm)',
  },
  orderHeader: {
    backgroundColor: 'var(--color-accent)',
    padding: '1.5rem',
    display: 'flex',
    flexWrap: 'wrap' as 'wrap',
    gap: '2rem',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid var(--color-border)',
  },
  orderIdLabel: {
    fontSize: '0.8rem',
    color: 'var(--color-text-muted)',
    textTransform: 'uppercase' as 'uppercase',
    letterSpacing: '1px',
    marginBottom: '0.25rem',
    display: 'block',
  },
  orderId: {
    fontFamily: 'monospace',
    fontWeight: 500,
  },
  totalAmount: {
    fontWeight: 600,
    color: 'var(--color-primary)',
  },
  statusBadge: (status: string) => ({
    padding: '0.5rem 1rem',
    borderRadius: '2rem',
    fontWeight: 600,
    fontSize: '0.85rem',
    textTransform: 'uppercase' as 'uppercase',
    backgroundColor: status === 'Confirmed' ? 'rgba(134, 167, 137, 0.2)' : 
                   status === 'Pending' ? 'rgba(192, 169, 142, 0.2)' : 
                   'rgba(211, 125, 125, 0.2)',
    color: status === 'Confirmed' ? 'var(--color-success)' : 
           status === 'Pending' ? 'var(--color-primary)' : 
           'var(--color-error)',
  }),
  orderItems: {
    padding: '1.5rem',
  },
  itemRow: {
    display: 'flex',
    gap: '1.5rem',
    alignItems: 'center',
    marginBottom: '1.5rem',
  },
  itemImage: {
    position: 'relative' as 'relative',
    width: '60px',
    height: '80px',
    borderRadius: 'var(--radius-sm)',
    overflow: 'hidden',
  },
  itemDetails: {
    flex: 1,
  },
  itemTitle: {
    fontFamily: 'var(--font-sans)',
    fontSize: '1rem',
    marginBottom: '0.25rem',
  },
  itemPrice: {
    color: 'var(--color-text-muted)',
    fontSize: '0.9rem',
  },
  deliveryInfo: {
    padding: '1.5rem',
    backgroundColor: 'rgba(0,0,0,0.02)',
    borderTop: '1px solid var(--color-border)',
    fontSize: '0.9rem',
    color: 'var(--color-text-muted)',
    lineHeight: 1.6,
  }
};
