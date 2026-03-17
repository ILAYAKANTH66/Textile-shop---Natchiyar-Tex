'use client';

import { useState, useEffect } from 'react';

export default function CategoriesManager() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    const res = await fetch('/api/categories');
    const data = await res.json();
    setCategories(data.categories || []);
    setLoading(false);
  };

  const handleOpenModal = (category = null) => {
    setEditingCategory(category || { name: '', description: '' });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    const url = editingCategory.id ? `/api/categories/${editingCategory.id}` : '/api/categories';
    const method = editingCategory.id ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingCategory),
      });

      if (res.ok) {
        await fetchCategories();
        closeModal();
      } else {
        const body = await res.json();
        alert(body.error || 'Error saving category');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure? This will not delete products, but they will become uncategorized.')) return;
    try {
      const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchCategories();
      } else {
        alert('Failed to delete category');
      }
    } catch (err) {
      alert('Error deleting category');
    }
  };

  return (
    <div className="animate-fade-in">
      <div style={styles.header}>
        <h1 style={styles.title}>Manage Categories</h1>
        <button onClick={() => handleOpenModal()} style={styles.addBtn}>+ Add New Category</button>
      </div>

      <div style={styles.card}>
        {loading ? (
          <div style={{padding: '2rem', textAlign: 'center'}}>Loading categories...</div>
        ) : (
          <table style={styles.table}>
             <thead>
               <tr>
                 <th style={styles.th}>Name</th>
                 <th style={styles.th}>Slug</th>
                 <th style={styles.th}>Products</th>
                 <th style={styles.th}>Actions</th>
               </tr>
             </thead>
             <tbody>
               {categories.map((c: any) => (
                 <tr key={c.id} style={styles.tr}>
                   <td style={styles.td}>
                     <div style={{fontWeight: 600}}>{c.name}</div>
                     <div style={{fontSize: '0.8rem', color: 'var(--color-text-muted)'}}>{c.description}</div>
                   </td>
                   <td style={styles.td}>{c.slug}</td>
                   <td style={styles.td}>{c._count?.products || 0}</td>
                   <td style={styles.td}>
                     <button onClick={() => handleOpenModal(c)} style={styles.actionBtn}>Edit</button>
                     <button onClick={() => handleDelete(c.id)} style={{...styles.actionBtn, color: 'var(--color-error)'}}>Delete</button>
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
            <h2 style={{marginBottom: '1.5rem'}}>{editingCategory.id ? 'Edit Category' : 'Add Category'}</h2>
            <form onSubmit={handleSave} style={styles.form}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Category Name</label>
                <input 
                  value={editingCategory.name} 
                  onChange={e => setEditingCategory({...editingCategory, name: e.target.value})} 
                  placeholder="e.g. Silk Sarees"
                  required 
                />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Description</label>
                <textarea 
                  value={editingCategory.description || ''} 
                  onChange={e => setEditingCategory({...editingCategory, description: e.target.value})} 
                  rows={3} 
                  placeholder="Tell us about this collection..."
                />
              </div>
              <div style={styles.modalActions}>
                <button type="button" onClick={closeModal} style={styles.cancelBtn}>Cancel</button>
                <button type="submit" style={styles.saveBtn} disabled={submitting}>
                  {submitting ? 'Saving...' : 'Save Category'}
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
    maxWidth: '500px',
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
