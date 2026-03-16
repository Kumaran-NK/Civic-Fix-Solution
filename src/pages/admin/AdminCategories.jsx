import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/Dashboardlayout';
import Topbar from '../../components/Topbar';
import { getAllCategories, createCategory, updateCategory, deleteCategory } from '../../api/categoriesApi';
import { getAllDepartments } from '../../api/departmentsApi';
import { Tag, Trash2, Edit, X, Loader, CheckCircle } from 'lucide-react';

export default function AdminCategories() {
  const [categories, setCategories]   = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [modal, setModal]             = useState(null); // 'create' | category object
  const [form, setForm]               = useState({ name: '', baseScore: 70, departmentId: '' });
  const [submitting, setSubmitting]   = useState(false);
  const [done, setDone]               = useState(false);

  useEffect(() => {
    Promise.all([getAllCategories(), getAllDepartments()])
      .then(([cats, depts]) => { setCategories(cats); setDepartments(depts); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const openCreate = () => { setForm({ name: '', baseScore: 70, departmentId: '' }); setModal('create'); };
  const openEdit   = (cat) => {
    setForm({ name: cat.name, baseScore: cat.baseScore, departmentId: cat.department?.departmentId || '' });
    setModal(cat);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = { name: form.name, baseScore: form.baseScore, departmentId: parseInt(form.departmentId) };
      if (modal === 'create') {
        const created = await createCategory(payload);
        setCategories([...categories, created]);
      } else {
        const updated = await updateCategory(modal.categoryId, payload);
        setCategories(categories.map(c => c.categoryId === updated.categoryId ? updated : c));
      }
      setDone(true);
      setTimeout(() => { setModal(null); setDone(false); }, 1000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save category.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteCategory(id);
      setCategories(categories.filter(c => c.categoryId !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete category.');
    }
  };

  return (
    <DashboardLayout>
      <Topbar
        title="Issue Categories"
        subtitle={`${categories.length} categories`}
        action={{ label: 'Add Category', onClick: openCreate }}
      />
      <div className="p-8">
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader className="w-6 h-6 animate-spin text-civic-500" />
          </div>
        ) : (
          <div className="card overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Category', 'Department', 'Base Score', 'Actions'].map(h => (
                    <th key={h} className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-6 py-4">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {categories.map(cat => (
                  <tr key={cat.categoryId} className="hover:bg-gray-50/50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-civic-50 border border-civic-100 rounded-xl flex items-center justify-center">
                          <Tag className="w-4 h-4 text-civic-600" />
                        </div>
                        <span className="font-semibold text-gray-900 text-sm">{cat.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{cat.department?.departmentName || '—'}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 max-w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-civic-500 rounded-full" style={{ width: `${cat.baseScore}%` }} />
                        </div>
                        <span className="text-sm font-semibold text-gray-900">{cat.baseScore}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEdit(cat)} className="w-8 h-8 rounded-lg bg-gray-50 hover:bg-gray-100 flex items-center justify-center">
                          <Edit className="w-3.5 h-3.5 text-gray-500" />
                        </button>
                        <button onClick={() => handleDelete(cat.categoryId)} className="w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 flex items-center justify-center">
                          <Trash2 className="w-3.5 h-3.5 text-red-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-6">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-fade-up">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="font-syne font-bold text-gray-900">{modal === 'create' ? 'Add Category' : 'Edit Category'}</h3>
              <button onClick={() => setModal(null)} className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center">
                <X className="w-4 h-4" />
              </button>
            </div>
            {done ? (
              <div className="p-8 text-center">
                <CheckCircle className="w-10 h-10 text-green-500 mx-auto mb-3" />
                <p className="font-semibold text-gray-900">Saved!</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Category Name</label>
                  <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. Road Damage" className="input-field" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Base Score: {form.baseScore}</label>
                  <input type="range" min={10} max={100} value={form.baseScore}
                    onChange={e => setForm({ ...form, baseScore: parseInt(e.target.value) })}
                    className="w-full accent-civic-500" />
                  <div className="flex justify-between text-xs text-gray-400 mt-1"><span>10</span><span>100</span></div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Department</label>
                  <select value={form.departmentId} onChange={e => setForm({ ...form, departmentId: e.target.value })} className="input-field" required>
                    <option value="">Select department...</option>
                    {departments.map(d => <option key={d.departmentId} value={d.departmentId}>{d.departmentName}</option>)}
                  </select>
                </div>
                <div className="flex gap-3 pt-1">
                  <button type="button" onClick={() => setModal(null)} className="btn-secondary flex-1">Cancel</button>
                  <button type="submit" disabled={submitting} className="btn-primary flex-1 flex items-center justify-center gap-2">
                    {submitting ? <Loader className="w-4 h-4 animate-spin" /> : (modal === 'create' ? 'Create' : 'Update')}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}