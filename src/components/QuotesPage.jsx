import { useState, useEffect, useCallback } from 'react';
import { getQuotes, createQuote, updateQuote, deleteQuote } from '../lib/api';
import { MAD, fdate, tod, Modal, Loading, ErrorMsg } from './shared';

const BLANK = { type: 'supply', supplier: '', amount: '', date: tod(), project: '', notes: '', recorded_by_siham: false, date_recorded: '', admin_note: '' };

export default function QuotesPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [typeF, setTypeF] = useState('');

  const load = useCallback(async () => {
    try { setData(await getQuotes()); } catch (e) { setError(e.message); }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const setF = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const filtered = data.filter(q => !typeF || q.type === typeF);
  const totalQ = data.reduce((s, q) => s + (+q.amount || 0), 0);
  const notRec = data.filter(q => !q.recorded_by_siham).length;

  const save = async () => {
    if (!form?.supplier) return alert('Fournisseur obligatoire');
    setSaving(true);
    try {
      const payload = { ...form, amount: +form.amount || 0, date_recorded: form.date_recorded || null };
      if (modal === 'add') {
        const created = await createQuote(payload);
        setData(p => [created, ...p]);
      } else {
        const updated = await updateQuote(form.id, payload);
        setData(p => p.map(q => q.id === form.id ? updated : q));
      }
      setModal(null);
    } catch (e) { alert('Erreur: ' + e.message); }
    setSaving(false);
  };

  const del = async (id) => {
    if (!window.confirm('Supprimer ce devis ?')) return;
    try { await deleteQuote(id); setData(p => p.filter(q => q.id !== id)); }
    catch (e) { alert('Erreur: ' + e.message); }
  };

  const toggleSiham = async (q) => {
    const patch = { recorded_by_siham: !q.recorded_by_siham, date_recorded: !q.recorded_by_siham ? tod() : null };
    try {
      await updateQuote(q.id, patch);
      setData(p => p.map(x => x.id === q.id ? { ...x, ...patch } : x));
    } catch (e) { alert('Erreur: ' + e.message); }
  };

  if (loading) return <Loading />;

  return (
    <div>
      {error && <ErrorMsg msg={error} />}

      <div className="kpi-row">
        <div className="kpi-card"><div className="kpi-lbl">Total devis</div><div className="kpi-val">{data.length}</div></div>
        <div className="kpi-card b"><div className="kpi-lbl">Valeur totale</div><div className="kpi-val" style={{ fontSize: '.95rem' }}>{MAD(totalQ)}</div></div>
        {notRec > 0 && (
          <div className="kpi-card o" style={{ gridColumn: '1/-1' }}>
            <div className="kpi-lbl">Non enregistrés Siham</div>
            <div className="kpi-val">{notRec}</div>
          </div>
        )}
      </div>

      {notRec > 0 && <div className="alert alert-warn">⚠️ {notRec} devis non enregistré(s) par Siham</div>}

      <div className="filter-row">
        {[['', 'Tout'], ['supply', 'Fournitures'], ['service', 'Prestation']].map(([v, l]) =>
          <div key={v} className={`filter-chip ${typeF === v ? 'active' : ''}`} onClick={() => setTypeF(v)}>{l}</div>
        )}
      </div>

      <div className="sec-hd">
        <div><div className="sec-title">Devis</div><div className="sec-sub">{filtered.length} / {data.length}</div></div>
      </div>

      {filtered.length === 0 && <div className="empty"><div className="empty-icon">📄</div><div className="empty-txt">Aucun devis</div></div>}

      {filtered.map(q => (
        <div className="list-card" key={q.id}>
          <div className="lc-header" style={{ cursor: 'default' }}>
            <div className="lc-icon">{q.type === 'service' ? '🔧' : '📦'}</div>
            <div className="lc-main">
              <div className="lc-title">{q.supplier}</div>
              <div className="lc-meta">
                <span className={`badge ${q.type === 'service' ? 'bg-blue' : 'bg-orange'}`}>{q.type === 'service' ? 'Prestation' : 'Fournitures'}</span>
                {q.project && <span className="badge bg-gray">{q.project}</span>}
                <span>{fdate(q.date)}</span>
              </div>
              {q.notes && <div style={{ fontSize: '.73rem', color: 'var(--ink4)', marginTop: 4 }}>{q.notes}</div>}
            </div>
            <div className="lc-amount">{MAD(q.amount)}</div>
          </div>
          <div className="lc-actions">
            <button className={`siham-btn ${q.recorded_by_siham ? 'siham-yes' : 'siham-no'}`} onClick={() => toggleSiham(q)}>
              {q.recorded_by_siham ? '🟢 Siham ✓' : '⚪ Siham'}
            </button>
            <div style={{ flex: 1 }} />
            <button className="btn btn-icon btn-sm" onClick={() => { setForm({ ...q, amount: String(q.amount) }); setModal('edit'); }}>✏️</button>
            <button className="btn btn-icon btn-sm" onClick={() => del(q.id)}>🗑</button>
          </div>
        </div>
      ))}

      <button className="fab" onClick={() => { setForm({ ...BLANK }); setModal('add'); }}>+</button>

      {(modal === 'add' || modal === 'edit') && form && (
        <Modal title={modal === 'add' ? 'Nouveau devis' : 'Modifier'} onClose={() => setModal(null)} onSave={save} saving={saving}>
          <div className="form-group">
            <label>Type</label>
            <select value={form.type} onChange={e => setF('type', e.target.value)}>
              <option value="supply">Fournitures</option>
              <option value="service">Prestation</option>
            </select>
          </div>
          <div className="form-group">
            <label>Fournisseur *</label>
            <input type="text" value={form.supplier} onChange={e => setF('supplier', e.target.value)} placeholder="Nom fournisseur" />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Montant (MAD)</label>
              <input type="number" value={form.amount} onChange={e => setF('amount', e.target.value)} placeholder="0" />
            </div>
            <div className="form-group">
              <label>Date</label>
              <input type="date" value={form.date} onChange={e => setF('date', e.target.value)} />
            </div>
          </div>
          <div className="form-group">
            <label>Projet</label>
            <input type="text" value={form.project} onChange={e => setF('project', e.target.value)} />
          </div>
          <div className="form-group">
            <label>Notes</label>
            <textarea value={form.notes} onChange={e => setF('notes', e.target.value)} style={{ minHeight: 60 }} />
          </div>
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12 }}>
            <div className="chk-row">
              <input type="checkbox" id="rs2" checked={!!form.recorded_by_siham} onChange={e => setF('recorded_by_siham', e.target.checked)} />
              <label htmlFor="rs2">Enregistré par Siham</label>
            </div>
            {form.recorded_by_siham && (
              <div className="form-row">
                <div className="form-group">
                  <label>Date enreg.</label>
                  <input type="date" value={form.date_recorded || ''} onChange={e => setF('date_recorded', e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Note</label>
                  <input type="text" value={form.admin_note || ''} onChange={e => setF('admin_note', e.target.value)} />
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
