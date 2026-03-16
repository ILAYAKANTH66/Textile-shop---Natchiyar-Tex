'use client';

import { useState, useEffect } from 'react';

export default function OrdersManager() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState<any>(null);

  useEffect(() => {
    fetchOrdersAndReport();
  }, []);

  const fetchOrdersAndReport = async () => {
    setLoading(true);
    
    // Fetch individual orders
    const resOrders = await fetch('/api/orders');
    const dataOrders = await resOrders.json();
    setOrders(dataOrders.orders || []);

    // Fetch report summary
    const resReport = await fetch('/api/reports/orders');
    const dataReport = await resReport.json();
    setReportData(dataReport.report);

    setLoading(false);
  };

  const handleStatusChange = async (id: string, status: string) => {
    if (!confirm(`Are you sure you want to mark this order as ${status}?`)) return;
    
    try {
      const res = await fetch(`/api/orders/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        fetchOrdersAndReport();
      } else {
        alert('Failed to update status');
      }
    } catch (err) {
      alert('Error updating order');
    }
  };

  const handleDownloadReport = () => {
    if (!reportData) return;
    
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Metric,Value\n";
    csvContent += `Total Orders,${reportData.totalOrders}\n`;
    csvContent += `Total Revenue,${reportData.totalRevenue}\n`;
    csvContent += `Pending Orders,${reportData.Pending || 0}\n`;
    csvContent += `Confirmed Orders,${reportData.Confirmed || 0}\n`;
    csvContent += `Rejected Orders,${reportData.Rejected || 0}\n`;
    
    csvContent += "\nOrder ID,Customer Name,Date,Amount,Status\n";
    orders.forEach(o => {
      csvContent += `"${o.id}","${o.customerName}","${new Date(o.createdAt).toLocaleDateString()}","${o.totalAmount}","${o.status}"\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "natchiyar_orders_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="animate-fade-in">
      <div style={styles.header}>
        <h1 style={styles.title}>Manage Orders</h1>
        <button onClick={handleDownloadReport} style={styles.reportBtn} disabled={loading}>
          Download CSV Report
        </button>
      </div>

      <div style={styles.card}>
        {loading ? (
          <div style={{padding: '2rem', textAlign: 'center'}}>Loading orders...</div>
        ) : (
          <table style={styles.table}>
             <thead>
               <tr>
                 <th style={styles.th}>Order Details</th>
                 <th style={styles.th}>Customer & Address</th>
                 <th style={styles.th}>Items Count</th>
                 <th style={styles.th}>Total</th>
                 <th style={styles.th}>Status</th>
                 <th style={styles.th}>Actions</th>
               </tr>
             </thead>
             <tbody>
               {orders.map((o: any) => (
                 <tr key={o.id} style={styles.tr}>
                   <td style={styles.td}>
                     <div style={{fontFamily:'monospace', fontSize:'0.85rem', color:'var(--color-text-muted)', marginBottom:'0.25rem'}}>
                       ID: {o.id.split('-')[0]}
                     </div>
                     <div>{new Date(o.createdAt).toLocaleDateString()}</div>
                   </td>
                   <td style={styles.td}>
                     <strong>{o.customerName}</strong><br/>
                     <span style={{fontSize:'0.85rem', color:'var(--color-text-muted)'}}>{o.deliveryAddress}</span>
                   </td>
                   <td style={styles.td}>{o.orderItems?.length || 0} items</td>
                   <td style={styles.td}>₹{o.totalAmount.toFixed(2)}</td>
                   <td style={styles.td}>
                     <span style={styles.statusBadge(o.status)}>
                       {o.status}
                     </span>
                   </td>
                   <td style={styles.td}>
                     {o.status === 'Pending' && (
                       <div style={{display:'flex', gap:'0.5rem', flexDirection:'column'}}>
                         <button onClick={() => handleStatusChange(o.id, 'Confirmed')} style={styles.confirmBtn}>Confirm</button>
                         <button onClick={() => handleStatusChange(o.id, 'Rejected')} style={styles.rejectBtn}>Reject</button>
                       </div>
                     )}
                     {o.status === 'Confirmed' && o.formattedWhatsAppMsg && (
                       <a href={o.formattedWhatsAppMsg} target="_blank" rel="noreferrer" style={styles.waBtn}>
                         Message Customer
                       </a>
                     )}
                   </td>
                 </tr>
               ))}
               {orders.length === 0 && (
                 <tr><td colSpan={6} style={{padding:'2rem', textAlign:'center'}}>No orders found.</td></tr>
               )}
             </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

const styles = {
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem',
  },
  title: {
    fontSize: '2rem',
    fontFamily: 'var(--font-serif)',
  },
  reportBtn: {
    backgroundColor: 'var(--color-secondary)',
    color: 'white',
    padding: '0.75rem 1.5rem',
    borderRadius: 'var(--radius-sm)',
    fontWeight: 600,
  },
  card: {
    backgroundColor: 'var(--color-surface)',
    borderRadius: 'var(--radius-md)',
    boxShadow: 'var(--shadow-sm)',
    border: '1px solid var(--color-border)',
    overflow: 'hidden',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse' as 'collapse',
  },
  th: {
    textAlign: 'left' as 'left',
    padding: '1rem 1.5rem',
    borderBottom: '2px solid var(--color-border)',
    color: 'var(--color-text-muted)',
    fontWeight: 500,
    fontSize: '0.9rem',
    backgroundColor: 'rgba(0,0,0,0.02)',
  },
  tr: {
    borderBottom: '1px solid var(--color-border)',
  },
  td: {
    padding: '1rem 1.5rem',
    fontSize: '0.95rem',
    verticalAlign: 'middle' as 'middle',
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
  confirmBtn: {
    backgroundColor: 'var(--color-success)',
    color: 'white',
    padding: '0.4rem',
    borderRadius: 'var(--radius-sm)',
    fontSize: '0.8rem',
    fontWeight: 500,
  },
  rejectBtn: {
    backgroundColor: 'var(--color-error)',
    color: 'white',
    padding: '0.4rem',
    borderRadius: 'var(--radius-sm)',
    fontSize: '0.8rem',
    fontWeight: 500,
  },
  waBtn: {
    display: 'inline-block',
    backgroundColor: '#25D366',
    color: 'white',
    padding: '0.4rem 0.6rem',
    borderRadius: 'var(--radius-sm)',
    fontSize: '0.8rem',
    fontWeight: 500,
    textDecoration: 'none',
    textAlign: 'center' as 'center',
  }
};
