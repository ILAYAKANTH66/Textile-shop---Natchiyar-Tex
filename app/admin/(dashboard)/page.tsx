export const dynamic = "force-dynamic";
import prisma from '@/lib/prisma';
import Link from 'next/link';

export const revalidate = 0; // Always fresh for admin

export default async function AdminDashboard() {
  const orders = await prisma.order.findMany();
  
  const totalOrders = orders.length;
  const totalRevenue = orders
    .filter((o: any) => o.status === 'Confirmed')
    .reduce((sum: number, o: any) => sum + o.totalAmount, 0);
  
  const pendingOrders = orders.filter((o: any) => o.status === 'Pending').length;
  const confirmedOrders = orders.filter((o: any) => o.status === 'Confirmed').length;

  const recentOrders = await prisma.order.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: { user: true }
  });

  return (
    <div className="animate-fade-in">
      <h1 style={styles.title}>Dashboard Overview</h1>
      
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <h3 style={styles.statTitle}>Total Revenue</h3>
          <p style={styles.statValue}>₹{totalRevenue.toFixed(2)}</p>
        </div>
        <div style={styles.statCard}>
          <h3 style={styles.statTitle}>Total Orders</h3>
          <p style={styles.statValue}>{totalOrders}</p>
        </div>
        <div style={styles.statCard}>
          <h3 style={styles.statTitle}>Pending</h3>
          <p style={{...styles.statValue, color: 'var(--color-primary)'}}>{pendingOrders}</p>
        </div>
        <div style={styles.statCard}>
          <h3 style={styles.statTitle}>Confirmed</h3>
          <p style={{...styles.statValue, color: 'var(--color-success)'}}>{confirmedOrders}</p>
        </div>
      </div>

      <div style={styles.section}>
         <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem'}}>
            <h2 style={styles.sectionTitle}>Recent Orders</h2>
            <Link href="/admin/orders" style={styles.link}>View All</Link>
         </div>
         
         <div style={styles.tableWrapper}>
           <table style={styles.table}>
             <thead>
               <tr>
                 <th style={styles.th}>Order ID</th>
                 <th style={styles.th}>Customer</th>
                 <th style={styles.th}>Date</th>
                 <th style={styles.th}>Amount</th>
                 <th style={styles.th}>Status</th>
               </tr>
             </thead>
             <tbody>
               {recentOrders.length === 0 ? (
                 <tr><td colSpan={5} style={{textAlign:'center', padding:'2rem'}}>No orders found.</td></tr>
               ) : recentOrders.map((order: any) => (
                 <tr key={order.id} style={styles.tr}>
                   <td style={{...styles.td, fontFamily: 'monospace'}}>{order.id.slice(0,8)}...</td>
                   <td style={styles.td}>{order.customerName}</td>
                   <td style={styles.td}>{new Date(order.createdAt).toLocaleDateString()}</td>
                   <td style={styles.td}>₹{order.totalAmount.toFixed(2)}</td>
                   <td style={styles.td}>
                     <span style={styles.statusBadge(order.status)}>
                       {order.status}
                     </span>
                   </td>
                 </tr>
               ))}
             </tbody>
           </table>
         </div>
      </div>
    </div>
  );
}

const styles = {
  title: {
    fontSize: '2rem',
    marginBottom: '2rem',
    fontFamily: 'var(--font-serif)',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1.5rem',
    marginBottom: '3rem',
  },
  statCard: {
    backgroundColor: 'var(--color-surface)',
    padding: '1.5rem',
    borderRadius: 'var(--radius-md)',
    boxShadow: 'var(--shadow-sm)',
    border: '1px solid var(--color-border)',
  },
  statTitle: {
    fontSize: '0.9rem',
    color: 'var(--color-text-muted)',
    textTransform: 'uppercase' as 'uppercase',
    letterSpacing: '1px',
    marginBottom: '0.5rem',
    fontFamily: 'var(--font-sans)',
  },
  statValue: {
    fontSize: '2rem',
    fontWeight: 600,
    fontFamily: 'var(--font-sans)',
  },
  section: {
    backgroundColor: 'var(--color-surface)',
    padding: '2rem',
    borderRadius: 'var(--radius-md)',
    boxShadow: 'var(--shadow-sm)',
    border: '1px solid var(--color-border)',
  },
  sectionTitle: {
    fontSize: '1.25rem',
    fontFamily: 'var(--font-sans)',
    fontWeight: 500,
  },
  link: {
    color: 'var(--color-primary)',
    fontSize: '0.9rem',
    fontWeight: 500,
  },
  tableWrapper: {
    overflowX: 'auto' as 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse' as 'collapse',
  },
  th: {
    textAlign: 'left' as 'left',
    padding: '1rem',
    borderBottom: '2px solid var(--color-border)',
    color: 'var(--color-text-muted)',
    fontWeight: 500,
    fontSize: '0.9rem',
  },
  tr: {
    borderBottom: '1px solid var(--color-border)',
  },
  td: {
    padding: '1rem',
    fontSize: '0.95rem',
  },
  statusBadge: (status: string) => ({
    padding: '0.25rem 0.75rem',
    borderRadius: '1rem',
    fontSize: '0.8rem',
    fontWeight: 500,
    backgroundColor: status === 'Confirmed' ? 'rgba(134, 167, 137, 0.15)' : 
                   status === 'Pending' ? 'rgba(192, 169, 142, 0.15)' : 
                   'rgba(211, 125, 125, 0.15)',
    color: status === 'Confirmed' ? 'var(--color-success)' : 
           status === 'Pending' ? 'var(--color-primary)' : 
           'var(--color-error)',
  }),
};
