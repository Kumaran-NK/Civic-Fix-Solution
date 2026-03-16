import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/Dashboardlayout';
import Topbar from '../../components/Topbar';
import { getAllDepartments, createDepartment, updateDepartment, deleteDepartment } from '../../api/departmentsApi';
import { Building2, Users, AlertCircle, Trash2, Edit, X, Loader, CheckCircle } from 'lucide-react';

export default function AdminDepartments() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [modal, setModal]             = useState(null); // 'create' | dept object
  const [form, setForm]               = useState({ departmentName: '', description: '' });
  const [submitting, setSubmitting]   = useState(false);
  const [done, setDone]               = useState(false);

  useEffect(() => {
    getAllDepartments().then(setDepartments).catch(console.error).finally(() => setLoading(false));
  }, []);

  const openCreate = () => { setForm({ departmentName: '', description: '' }); setModal('create'); };
  const openEdit   = (dept) => { setForm({ departmentName: dept.departmentName, description: dept.description || '' }); setModal(dept); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (modal === 'create') {
        const created = await createDepartment(form);
        setDepartments([...departments, created]);
      } else {
        const updated = await updateDepartment(modal.departmentId, form);
        setDepartments(departments.map(d => d.departmentId === updated.departmentId ? updated : d));
      }
      setDone(true);
      setTimeout(() => { setModal(null); setDone(false); }, 1000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save department.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteDepartment(id);
      setDepartments(departments.filter(d => d.departmentId !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete department.');
    }
  };

  return (
    <DashboardLayout>
      <Topbar title="Departments" subtitle={`${departments.length} departments`} action={{ label: 'Add Department', onClick: openCreate }} />
      <div className="p-8">
        {loading ? (
          <div className="flex justify-center py-16"><Loader className="w-6 h-6 animate-spin text-civic-500" /></div>
        ) : (
          <div className="grid grid-cols-2 gap-5">
            {departments.map(dept => (
              <div key={dept.departmentId} className="card p-6 hover:shadow-md transition-all duration-200">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-11 h-11 bg-civic-50 border border-civic-100 rounded-xl flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-civic-600" />
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => openEdit(dept)} className="w-8 h-8 rounded-lg bg-gray-50 hover:bg-gray-100 flex items-center justify-center">
                      <Edit className="w-3.5 h-3.5 text-gray-500" />
                    </button>
                    <button onClick={() => handleDelete(dept.departmentId)} className="w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 flex items-center justify-center">
                      <Trash2 className="w-3.5 h-3.5 text-red-500" />
                    </button>
                  </div>
                </div>
                <h3 className="font-syne font-bold text-gray-900 mb-1">{dept.departmentName}</h3>
                <p className="text-sm text-gray-500 mb-4 leading-relaxed">{dept.description}</p>
                <div className="flex items-center gap-4 text-xs">
                  <div className="flex items-center gap-1.5 text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg">
                    <Users className="w-3.5 h-3.5" />
                    <span className="font-semibold">{dept.officerCount ?? 0} Officers</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span className="font-semibold">{dept.openIssues ?? 0} Open Issues</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-6">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-fade-up">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="font-syne font-bold text-gray-900">{modal === 'create' ? 'Add Department' : 'Edit Department'}</h3>
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
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Department Name</label>
                  <input type="text" value={form.departmentName} onChange={e => setForm({ ...form, departmentName: e.target.value })}
                    placeholder="e.g. Public Works Department" className="input-field" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                  <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                    placeholder="Describe the department's responsibilities..." rows={3} className="input-field resize-none" />
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