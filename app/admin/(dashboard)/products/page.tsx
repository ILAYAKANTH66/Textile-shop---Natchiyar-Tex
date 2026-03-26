'use client';

import { useState, useEffect } from 'react';

export default function ProductsManager() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    const [pRes, cRes] = await Promise.all([
      fetch('/api/products'),
      fetch('/api/categories')
    ]);
    const pData = await pRes.json();
    const cData = await cRes.json();
    setProducts(pData.products || []);
    setCategories(cData.categories || []);
    setLoading(false);
  };

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const handleOpenModal = (product = null) => {
    setEditingProduct(product || { title: '', description: '', price: '', imageUrl: '', categoryId: '', isAvailable: true, images: [] });
    setSelectedFiles([]);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
    setSelectedFiles([]);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    let uploadedUrls: string[] = [];

    // If there are selected files, upload them first
    if (selectedFiles.length > 0) {
      if (selectedFiles.length < 3) {
        alert('Please select at least 3 images.');
        setSubmitting(false);
        return;
      }
      
      const formData = new FormData();
      selectedFiles.forEach(file => formData.append('file', file));

      try {
        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        
        if (!uploadRes.ok) {
          throw new Error('Image upload failed');
        }
        
        const uploadData = await uploadRes.json();
        uploadedUrls = uploadData.urls;
      } catch (err) {
        alert('Error uploading images');
        setSubmitting(false);
        return;
      }
    } else {
      // If editing and no new files selected, use existing images
      if (editingProduct.images && editingProduct.images.length >= 3) {
        uploadedUrls = typeof editingProduct.images[0] === 'string' 
          ? editingProduct.images 
          : editingProduct.images.map((img: any) => img.imageUrl);
      } else if (editingProduct.legacyImages && editingProduct.legacyImages.length >= 3) {
        uploadedUrls = editingProduct.legacyImages.map((img: any) => img.imageUrl);
      } else {
        alert('Please provide at least 3 images for the product.');
        setSubmitting(false);
        return;
      }
    }
    
    const url = editingProduct.id ? `/api/products/${editingProduct.id}` : '/api/products';
    const method = editingProduct.id ? 'PUT' : 'POST';

    // Set first image as primary imageUrl, and full array as images
    const payload = {
      ...editingProduct,
      imageUrl: uploadedUrls[0],
      images: uploadedUrls
    };

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        await fetchProducts();
        closeModal();
      } else {
        const body = await res.json();
        alert(body.error || 'Error saving product');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchProducts();
      } else {
        const body = await res.json();
        alert(body.error || 'Failed to delete');
      }
    } catch (err) {
      alert('Error deleting product');
    }
  };

  return (
    <div className="animate-fade-in">
      <div style={styles.header}>
        <h1 style={styles.title}>Manage Products</h1>
        <button onClick={() => handleOpenModal()} style={styles.addBtn}>+ Add New Product</button>
      </div>

      <div style={styles.card}>
        {loading ? (
          <div style={{padding: '2rem', textAlign: 'center'}}>Loading products...</div>
        ) : (
          <table style={styles.table}>
             <thead>
               <tr>
                 <th style={styles.th}>Image</th>
                 <th style={styles.th}>Title</th>
                 <th style={styles.th}>Category</th>
                 <th style={styles.th}>Price</th>
                 <th style={styles.th}>Status</th>
                 <th style={styles.th}>Actions</th>
               </tr>
             </thead>
             <tbody>
               {products.map((p: any) => (
                 <tr key={p.id} style={styles.tr}>
                   <td style={styles.td}>
                     <img src={p.imageUrl} alt={p.title} style={{width:'50px', height:'50px', objectFit:'cover', borderRadius:'4px'}} />
                   </td>
                   <td style={styles.td}>{p.title}</td>
                   <td style={styles.td}>{p.category?.name || 'Uncategorized'}</td>
                   <td style={styles.td}>₹{p.price.toFixed(2)}</td>
                   <td style={styles.td}>
                     {p.isAvailable ? <span style={{color:'var(--color-success)'}}>Available</span> : <span style={{color:'var(--color-error)'}}>Hidden/Out of Stock</span>}
                   </td>
                   <td style={styles.td}>
                     <button onClick={() => handleOpenModal(p)} style={styles.actionBtn}>Edit</button>
                     <button onClick={() => handleDelete(p.id)} style={{...styles.actionBtn, color: 'var(--color-error)'}}>Delete</button>
                   </td>
                 </tr>
               ))}
             </tbody>
          </table>
        )}
      </div>

      {isModalOpen && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h2 style={{marginBottom: '1.5rem'}}>{editingProduct.id ? 'Edit Product' : 'Add Product'}</h2>
            <form onSubmit={handleSave} style={styles.form}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Title</label>
                <input 
                  value={editingProduct.title} 
                  onChange={e => setEditingProduct({...editingProduct, title: e.target.value})} 
                  required 
                />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Description</label>
                <textarea 
                  value={editingProduct.description} 
                  onChange={e => setEditingProduct({...editingProduct, description: e.target.value})} 
                  rows={3} 
                  required 
                />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Price (₹)</label>
                <input 
                  type="number" 
                  step="0.01" 
                  value={editingProduct.price} 
                  onChange={e => setEditingProduct({...editingProduct, price: e.target.value})} 
                  required 
                />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Product Images (Select minimum 3)</label>
                <input 
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={e => {
                    if (e.target.files) {
                      setSelectedFiles(Array.from(e.target.files));
                    }
                  }}
                  required={!editingProduct.id}
                />
                {editingProduct.id && (
                   <div style={{fontSize: '0.8rem', color: 'var(--color-text-muted)'}}>
                     Current images: {editingProduct.images?.length || 1}
                     <br/>
                     Uploading new files will replace existing images.
                   </div>
                )}
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Category</label>
                <select 
                  value={editingProduct.categoryId || ''} 
                  onChange={e => setEditingProduct({...editingProduct, categoryId: e.target.value})} 
                  required 
                  style={{padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--color-border)', backgroundColor: 'white'}}
                >
                  <option value="">Select Category</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div style={styles.inputGroupRow}>
                <input 
                  type="checkbox" 
                  id="availCheck" 
                  checked={editingProduct.isAvailable} 
                  onChange={e => setEditingProduct({...editingProduct, isAvailable: e.target.checked})} 
                />
                <label htmlFor="availCheck" style={styles.label}>Is Available for Purchase</label>
              </div>
              <div style={styles.modalActions}>
                <button type="button" onClick={closeModal} style={styles.cancelBtn}>Cancel</button>
                <button type="submit" style={styles.saveBtn} disabled={submitting}>
                  {submitting ? 'Saving...' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
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
  addBtn: {
    backgroundColor: 'var(--color-primary)',
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
  actionBtn: {
    padding: '0.5rem',
    marginRight: '0.5rem',
    color: 'var(--color-primary)',
    textDecoration: 'underline',
    fontSize: '0.9rem',
  },
  modalOverlay: {
    position: 'fixed' as 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2000,
    padding: '1rem',
  },
  modalContent: {
    backgroundColor: 'var(--color-surface)',
    padding: '2.5rem',
    borderRadius: 'var(--radius-md)',
    width: '100%',
    maxWidth: '600px',
    boxShadow: 'var(--shadow-lg)',
  },
  form: {
    display: 'flex',
    flexDirection: 'column' as 'column',
    gap: '1.25rem',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column' as 'column',
    gap: '0.5rem',
  },
  inputGroupRow: {
    display: 'flex',
    gap: '0.5rem',
    alignItems: 'center',
  },
  label: {
    fontSize: '0.9rem',
    fontWeight: 500,
  },
  modalActions: {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'flex-end',
    marginTop: '1rem',
  },
  cancelBtn: {
    padding: '0.75rem 1.5rem',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-sm)',
  },
  saveBtn: {
    padding: '0.75rem 1.5rem',
    backgroundColor: 'var(--color-primary)',
    color: 'white',
    borderRadius: 'var(--radius-sm)',
    fontWeight: 600,
  }
};
