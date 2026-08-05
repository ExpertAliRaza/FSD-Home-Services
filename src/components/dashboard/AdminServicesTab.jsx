import React, { useState } from 'react';
import { Settings, Plus, Edit2, Trash2, CheckCircle2, XCircle } from 'lucide-react';
import { createServiceCategory, updateServiceCategory, deleteServiceCategory, uploadServiceImage } from '../../lib/api';

export function AdminServicesTab({ services, reloadData }) {
  const [editingService, setEditingService] = useState(null);
  const [loadingAction, setLoadingAction] = useState(false);
  const [error, setError] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const handleEdit = (service) => {
    setEditingService({ ...service });
    setImageFile(null);
    setImagePreview(service.image_url);
  };

  const handleCreate = () => {
    setEditingService({
      id: '',
      name: '',
      slug: '',
      image_url: '',
      description: '',
      keywords: '',
      is_active: true
    });
    setImageFile(null);
    setImagePreview(null);
  };

  const handleCancel = () => {
    setEditingService(null);
    setError(null);
    setImageFile(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoadingAction(true);
    setError(null);
    try {
      let finalImageUrl = editingService.image_url;
      if (imageFile) {
        finalImageUrl = await uploadServiceImage(imageFile);
      }
      
      const payload = { ...editingService, image_url: finalImageUrl };
      
      if (editingService.id && services.find(s => s.id === editingService.id)) {
        await updateServiceCategory(editingService.id, payload);
      } else {
        await createServiceCategory(payload);
      }
      await reloadData();
      setEditingService(null);
    } catch (err) {
      setError(err.message || 'Failed to save service.');
    } finally {
      setLoadingAction(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this service? This may break requests or workers tied to it.')) return;
    setLoadingAction(true);
    try {
      await deleteServiceCategory(id);
      await reloadData();
    } catch (err) {
      alert(err.message || 'Failed to delete service. It may be in use.');
    } finally {
      setLoadingAction(false);
    }
  };

  return (
    <section id="services" className="scroll-mt-20">
      <div className="rounded-lg border border-slate-200 bg-white">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 px-5 py-4">
          <h2 className="flex items-center gap-2 text-lg font-bold text-slate-950">
            <Settings size={20} className="text-brand-700" />
            Service Categories
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-600">{services.length} total</span>
          </h2>
          {!editingService && (
            <button
              onClick={handleCreate}
              className="inline-flex min-h-9 items-center gap-2 rounded-lg bg-brand-700 px-4 text-sm font-semibold text-white hover:bg-brand-600 transition-colors"
            >
              <Plus size={16} />
              Add Service
            </button>
          )}
        </div>

        {error && (
          <div className="mx-5 mt-4 rounded-md bg-red-50 p-4 border border-red-100 text-sm text-red-700">
            {error}
          </div>
        )}

        {editingService ? (
          <form onSubmit={handleSubmit} className="p-5">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Service Name</label>
                <input
                  type="text"
                  required
                  value={editingService.name}
                  onChange={(e) => setEditingService({ ...editingService, name: e.target.value })}
                  className="w-full rounded-md border border-slate-300 p-2 text-sm"
                  placeholder="e.g. Plumber"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Slug (URL)</label>
                <input
                  type="text"
                  value={editingService.slug}
                  onChange={(e) => setEditingService({ ...editingService, slug: e.target.value })}
                  className="w-full rounded-md border border-slate-300 p-2 text-sm"
                  placeholder="Leave empty to auto-generate"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-slate-700 mb-1">Service Image</label>
                <div className="mt-1 flex items-center gap-4">
                  {imagePreview && (
                    <img src={imagePreview} alt="Preview" className="h-16 w-16 rounded-md object-cover border border-slate-200 shadow-sm" />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        setImageFile(file);
                        setImagePreview(URL.createObjectURL(file));
                      }
                    }}
                    className="block w-full text-sm text-slate-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-md file:border-0
                      file:text-sm file:font-semibold
                      file:bg-brand-50 file:text-brand-700
                      hover:file:bg-brand-100 cursor-pointer"
                  />
                </div>
                {!imageFile && editingService.image_url && (
                   <p className="mt-1 text-xs text-slate-500">Current image URL: {editingService.image_url}</p>
                )}
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-slate-700 mb-1">Description (SEO Meta)</label>
                <textarea
                  rows="2"
                  value={editingService.description}
                  onChange={(e) => setEditingService({ ...editingService, description: e.target.value })}
                  className="w-full rounded-md border border-slate-300 p-2 text-sm"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-slate-700 mb-1">Keywords (SEO)</label>
                <input
                  type="text"
                  value={editingService.keywords}
                  onChange={(e) => setEditingService({ ...editingService, keywords: e.target.value })}
                  className="w-full rounded-md border border-slate-300 p-2 text-sm"
                  placeholder="Comma separated keywords"
                />
              </div>
              <div className="md:col-span-2 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={editingService.is_active}
                  onChange={(e) => setEditingService({ ...editingService, is_active: e.target.checked })}
                  className="rounded border-slate-300"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-slate-700">Service is Active (Visible on frontend)</label>
              </div>
            </div>

            <div className="mt-6 flex items-center gap-3 border-t border-slate-200 pt-5">
              <button
                type="submit"
                disabled={loadingAction}
                className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-brand-700 px-5 text-sm font-bold text-white hover:bg-brand-600 disabled:opacity-50"
              >
                {loadingAction ? 'Saving...' : 'Save Service'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                disabled={loadingAction}
                className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-slate-100 px-5 text-sm font-bold text-slate-700 hover:bg-slate-200 disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="p-4 font-semibold">Service Name</th>
                  <th className="p-4 font-semibold">Status</th>
                  <th className="p-4 font-semibold">Slug</th>
                  <th className="p-4 font-semibold">Keywords</th>
                  <th className="p-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {services.map((service) => (
                  <tr key={service.id} className="hover:bg-slate-50">
                    <td className="p-4 font-bold text-slate-900 flex items-center gap-3">
                      {service.image_url ? (
                        <img src={service.image_url} alt="" className="w-10 h-10 rounded object-cover border border-slate-200" />
                      ) : (
                        <div className="w-10 h-10 rounded bg-slate-100 border border-slate-200" />
                      )}
                      {service.name}
                    </td>
                    <td className="p-4">
                      {service.is_active ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded">
                          <CheckCircle2 size={12} /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded">
                          <XCircle size={12} /> Inactive
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-slate-600">{service.slug}</td>
                    <td className="p-4 text-slate-500 text-xs truncate max-w-[200px]" title={service.keywords}>
                      {service.keywords || 'None'}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(service)}
                          className="inline-flex items-center justify-center p-2 text-slate-500 hover:bg-slate-100 hover:text-brand-600 rounded-md transition-colors"
                          title="Edit Service"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(service.id)}
                          className="inline-flex items-center justify-center p-2 text-slate-500 hover:bg-red-50 hover:text-red-600 rounded-md transition-colors"
                          title="Delete Service"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {services.length === 0 && (
                  <tr>
                    <td colSpan="5" className="p-8 text-center text-slate-500">
                      No services found. Add one to get started.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
