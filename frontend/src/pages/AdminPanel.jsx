import { useEffect, useState } from 'react';
import api from '../api/axios.js';
import Loader from '../components/Loader.jsx';

import PartyLogo from '../components/PartyLogo.jsx';

const emptyForm = { name: '', party: '', age: '', partyLogo: '' };


// Shrinks the chosen image to a 160x160 PNG so it stays small (well under 200 KB).
const resizeLogo = (file) =>
  new Promise((resolve, reject) => {
    if (!/^image\/(png|jpeg|webp)$/.test(file.type)) {
      return reject(new Error('Logo must be a PNG, JPG or WEBP image.'));
    }
    if (file.size > 5 * 1024 * 1024) {
      return reject(new Error('Image is too large (max 5 MB).'));
    }
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const size = 160;
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const scale = Math.min(size / img.width, size / img.height);
      const w = img.width * scale;
      const h = img.height * scale;
      canvas.getContext('2d').drawImage(img, (size - w) / 2, (size - h) / 2, w, h);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Could not read this image.'));
    };
    img.src = url;
  });

export default function AdminPanel() {
  const [candidates, setCandidates] = useState([]);
  const [counts, setCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [deletingId, setDeletingId] = useState(null);
    const [fileKey, setFileKey] = useState(0); // resets the file input after submit

      // Editing an existing candidate
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [editFileKey, setEditFileKey] = useState(0);

  const load = async () => {
    setLoading(true);
    try {
        const [listRes, countRes, windowRes] = await Promise.all([
        api.get('/candidate'),
        api.get('/candidate/vote/count'),
    
      ]);
      setCandidates(listRes.data);
      
      const map = {};
      countRes.data.forEach((r) => {
        map[`${r.name}__${r.party}`] = r.count;
      });
      setCounts(map);
    } catch (err) {
      setError('Could not load candidates.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleLogoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError('');
    try {
      const logo = await resizeLogo(file);
      setForm((f) => ({ ...f, partyLogo: logo }));
    } catch (err) {
      setError(err.message);
      e.target.value = '';
    }
  };

  const removeLogo = () => {
    setForm((f) => ({ ...f, partyLogo: '' }));
    setFileKey((k) => k + 1);
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    setError('');
    setNotice('');
    setSubmitting(true);
    try {
      await api.post('/candidate', { ...form, age: Number(form.age) });
      setForm(emptyForm);
            setFileKey((k) => k + 1);
      setNotice('Candidate added.');
      load();
    } catch (err) {
      setError(err?.response?.data?.message || err?.response?.data?.error || 'Could not add candidate.');
    } finally {
      setSubmitting(false);
    }
  };

    const startEdit = (c) => {
    setError('');
    setNotice('');
    setEditingId(c._id);
    setEditForm({
      name: c.name,
      party: c.party,
      age: String(c.age ?? ''),
      partyLogo: c.partyLogo || '',
    });
    setEditFileKey((k) => k + 1);
  };

  const cancelEdit = () => setEditingId(null);

  const handleEditChange = (e) => setEditForm({ ...editForm, [e.target.name]: e.target.value });

  const handleEditLogoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError('');
    try {
      const logo = await resizeLogo(file);
      setEditForm((f) => ({ ...f, partyLogo: logo }));
    } catch (err) {
      setError(err.message);
      e.target.value = '';
    }
  };

  const removeEditLogo = () => {
    setEditForm((f) => ({ ...f, partyLogo: '' }));
    setEditFileKey((k) => k + 1);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    setNotice('');
    setSaving(true);
    try {
      await api.put(`/candidate/${editingId}`, {
        name: editForm.name,
        party: editForm.party,
        age: Number(editForm.age),
        partyLogo: editForm.partyLogo,
      });
      setEditingId(null);
      setNotice('Candidate updated.');
      load();
    } catch (err) {
      setError(err?.response?.data?.message || err?.response?.data?.error || 'Could not update candidate.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    setError('');
    setNotice('');
    setDeletingId(id);
    try {
      await api.delete(`/candidate/${id}`);
      setNotice('Candidate removed.');
      load();
    } catch (err) {
      setError(err?.response?.data?.message || err?.response?.data?.error || 'Could not remove candidate.');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) return <Loader label="Loading admin panel" />;

  return (
    <div className="max-w-2xl mx-auto px-6 py-14">
      <p className="text-xs tracking-widest text-brass mb-3">ADMIN</p>
      <h1 className="font-serif text-3xl mb-2">Manage candidates</h1>
      <p className="text-ink/50 text-sm mb-10">
        Add, remove, and keep track of every candidate on the ballot. Admins cannot vote.
      </p>
      
      <form onSubmit={handleAdd} className="border border-line px-6 py-6 mb-4 space-y-5">
        <h2 className="font-serif text-xl">Add a candidate</h2>
        <div className="grid sm:grid-cols-3 gap-5">
          <div>
            <label className="field-label" htmlFor="name">Name</label>
            <input id="name" name="name" required value={form.name} onChange={handleChange} className="field-input" />
          </div>
          <div>
            <label className="field-label" htmlFor="party">Party</label>
            <input id="party" name="party" required value={form.party} onChange={handleChange} className="field-input" />
          </div>
          <div>
            <label className="field-label" htmlFor="age">Age</label>
            <input id="age" name="age" type="number" required value={form.age} onChange={handleChange} className="field-input" />
          </div>
        </div>

                <div>
          <label className="field-label" htmlFor="partyLogo">Party logo (optional)</label>
          <div className="flex items-center gap-4">
            <PartyLogo src={form.partyLogo} party={form.party} size={56} />
            <input
              key={fileKey}
              id="partyLogo"
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={handleLogoChange}
              className="text-sm text-ink/60"
            />
            {form.partyLogo && (
              <button type="button" onClick={removeLogo} className="text-sm text-ink/50 hover:text-ballot">
                Remove logo
              </button>
            )}
          </div>
        </div>

        <button type="submit" disabled={submitting} className="btn-primary">
          {submitting ? 'Adding…' : 'Add candidate'}
        </button>
      </form>

      {(error || notice) && (
        <p className={`mb-6 text-sm px-4 py-2.5 border ${error ? 'text-ballot bg-ballot/5 border-ballot/20' : 'text-ink bg-ink/5 border-ink/15'}`}>
          {error || notice}
        </p>
      )}

      {candidates.length === 0 ? (
        <p className="text-ink/45 text-sm border border-line px-6 py-10 text-center">
          No candidates on the ballot yet — add the first one above.
        </p>
      ) : (
        <ul className="border border-line divide-y divide-line">
                    {candidates.map((c) =>
            editingId === c._id ? (
              <li key={c._id} className="px-6 py-5">
                <form onSubmit={handleSave} className="space-y-4">
                  <div className="grid sm:grid-cols-3 gap-4">
                    <div>
                      <label className="field-label" htmlFor="edit-name">Name</label>
                      <input id="edit-name" name="name" required value={editForm.name} onChange={handleEditChange} className="field-input" />
                    </div>
                    <div>
                      <label className="field-label" htmlFor="edit-party">Party</label>
                      <input id="edit-party" name="party" required value={editForm.party} onChange={handleEditChange} className="field-input" />
                    </div>
                    <div>
                      <label className="field-label" htmlFor="edit-age">Age</label>
                      <input id="edit-age" name="age" type="number" required value={editForm.age} onChange={handleEditChange} className="field-input" />
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <PartyLogo src={editForm.partyLogo} party={editForm.party} size={48} />
                    <input
                      key={editFileKey}
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      onChange={handleEditLogoChange}
                      className="text-sm text-ink/60"
                    />
                    {editForm.partyLogo && (
                      <button type="button" onClick={removeEditLogo} className="text-sm text-ink/50 hover:text-ballot">
                        Remove logo
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    <button type="submit" disabled={saving} className="btn-primary">
                      {saving ? 'Saving…' : 'Save changes'}
                    </button>
                    <button type="button" onClick={cancelEdit} className="text-sm text-ink/50 hover:text-ink">
                      Cancel
                    </button>
                  </div>
                </form>
              </li>
            ) : (
              <li key={c._id} className="flex items-center justify-between px-6 py-4">
                <PartyLogo src={c.partyLogo} party={c.party} />
                <div className="flex-1 ml-4">
                  <p className="text-ink font-medium">{c.name}</p>
                  <p className="text-ink/45 text-sm">
                    {c.party} &middot; {counts[`${c.name}__${c.party}`] ?? 0} vote
                    {counts[`${c.name}__${c.party}`] === 1 ? '' : 's'}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => startEdit(c)}
                    className="text-sm text-ink/50 hover:text-ink transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(c._id)}
                    disabled={deletingId === c._id}
                    className="text-sm text-ink/50 hover:text-ballot transition-colors"
                  >
                    {deletingId === c._id ? 'Removing…' : 'Remove'}
                  </button>
                </div>
              </li>
            )
          )}
        </ul>
      )}
    </div>
  );
}
