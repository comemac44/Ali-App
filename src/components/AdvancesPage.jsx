import { useState, useEffect, useCallback } from 'react';
import { getAdvances, createAdvance, updateAdvance, deleteAdvance, createExpense, deleteExpense } from '../lib/api';
import { MAD, fdate, tod, expTotal, StatusBadge, Modal, Loading, ErrorMsg } from './shared';

const BLANK = {
  advance_type: 'cash', source: 'HABITIQ', amount: '', date: tod(),
  project: '', reason: '', destination: '', status: 'not justified',
  recorded_by_siham: false, date_recorded: '', admin_note: '',
};

function AdvForm({ v, set }) {
  return (<>
    <div className="form-row">
      <div className="form-group">
        <label>Type</label>
        <select value={v.advance_type} onChange={e => set('advance_type', e.target.value)}>
          <option value="cash">Espèces</option>
          <option value="bank transfer">Virement</option>
          <option value="other">Autre</option>
        </select>
      </div>
      <div className="form-group">
        <label>Source</label>
        <select value={v.source} onChange={e => set('source', e.target.value)}>
          <option value="HABITIQ">HABITIQ</option>
          <option value="HAJ">HAJ</option>
        </select>
      </div>
    </div>
    <div className="form-row">
      <div className="form-group">
        <label>Montant (MAD) *</label>
        <input type="number" value={v.amount} onChange={e => set('amount', e.target.value)} placeholder="0" />
      </div>
      <div className="form-group">
        <label>Date</label>
        <input type="date" value={v.date} onChange={e => set('date', e.target.value)} />
      </div>
    </div>
    <div className="form-group">
      <label>Motif *</label>
      <input type="text" value={v.reason} onChange={e => set('reason', e.target.value)} placeholder="Raison de l'avance" />
    </div>
    <div className="form-group">
      <label>Destination</label>
      <input type="text" value={v.destination} onChange={e => set('destination', e.target.value)} placeholder="Usage / destination" />
    </div>
    <div className="form-group">
      <label>Projet</label>
      <input type="text" value={v.project} onChange={e => set('project', e.target.value)} placeholder="Optionnel" />
    </div>
    <div className="form-group">
      <label>Statut</label>
      <select value={v.status} onChange={e => set('status', e.target.value)}>
        <option value="not justified">Non justifié</option>
        <option value="partially justified">Partiellement justifié</option>
        <option value="justified">Justifié</option>
      </select>
    </div>
    <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12 }}>
      <div className="chk-row">
        <input type="checkbox" id="rs1" checked={!!v.recorded_by_siham} onChange={e => set('recorded_by_siham', e.target.checked)} />
        <label htmlFor="rs1">Enregistré par Siham</label>
      </div>
      {v.recorded_by_siham && (
        <div className="form-row">
          <div className="form-group">
            <label>Date enreg.</label>
            <input type="date" value={v.date_recorded || ''} onChange={e => set('date_recorded', e.target.value)} />
          </div>
          <div className="form-group">
            <label>Note admin</label>
            <input type="text" value={v.admin_note || ''} onChange={e => set('admin_note', e.target.value)} />
          </div>
        </div>
      )}
    </div>
  </>);
}

function AddExpense({ advanceId, onAdded }) {
  const [desc, setDesc] = useState('');
  const [amt, setAmt] = useState('');
  const [date, setDate] = useState(tod());
  const [saving, setSaving] = useState(false);

  const go = async () => {
    if (!desc || !amt) return;
    setSaving(true);
    try {
      const exp = await createExpense({ advance_id: advanceId, description: desc, amount: +amt, date });
      onAdded(exp);
      setDesc(''); setAmt('');
    } catch (e) { alert('Erreur: ' + e.message); }
    setSaving(false);
  };

  return (
    <div className="add-exp-box">
      <div className="add-exp-title">+ Ajouter une dépense</div>
      <div style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
        <input type="text" value={desc} onChange={e => setDesc(e.target.value)} placeholder="Description" style={{ flex: 2 }} />
        <input type="number" value={amt} onChange={e => setAmt(e.target.value)} placeholder="MAD" style={{ flex: 1 }} />
      </div>
      <div style={{ display: 'flex', gap: 6 }}>
        <input type="date" value={date} onChange={e => setDate(e.target.value)} style={{ flex: 1 }} />
        <button className="btn btn-primary btn-sm" style={{ flex: 0, padding: '8px 14px', width: 'auto' }} onClick={go} disabled={saving}>
          {saving ? '...' : 'Ajouter'}
        </button>
      </div>
    </div>
  );
}

export default function AdvancesPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [statusF, setStatusF] = useState('');
  const [sourceF, setSourceF] = useState('');

  const load = useCallback(async () => {
    try { setData(await getAdvances()); } catch (e) { setError(e.message); }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const setF = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const filtered = data.filter(a =>
    (!statusF || a.status === statusF) && (!sourceF || a.source === sourceF)
  );

  const totalAdv = data.reduce((s, a) => s + (+a.amount || 0), 0);
  const totalJust = data.filter(a => a.status === 'justified').reduce((s, a) => s + (+a.amount || 0), 0);
  const notJust = data.filter(a => a.status === 'not justified').length;

  const save = async () => {
    if (!form?.amount || !form?.reason) return alert('Montant et motif obligatoires');
    setSaving(true);
    try {
      const payload = { ...form, amount: +form.amount, date_recorded: form.date_recorded || null };
      if (modal === 'add') {
        const created = await createAdvance(payload);
        setData(p => [{ ...created, expenses: [] }, ...p]);
      } else {
        const updated = await updateAdvance(form.id, payload);
        setData(p => p.map(a => a.id === form.id ? { ...a, ...updated } : a));
      }
      setModal(null);
    } catch (e) { alert('Erreur: ' + e.message); }
    setSaving(false);
  };

  const del = async (id) => {
    if (!window.confirm('Supprimer cette avance ?')) return;
    try { await deleteAdvance(id); setData(p => p.filter(a => a.id !== id)); }
    catch (e) { alert('Erreur: ' + e.message); }
  };

  const toggleSiham = async (adv) => {
    const patch = { recorded_by_siham: !adv.recorded_by_siham, date_recorded: !adv.recorded_by_siham ? tod() : null };
    try {
      await updateAdvance(adv.id, patch);
      setData(p => p.map(a => a.id === adv.id ? { ...a, ...patch } : a));
    } catch (e) { alert('Erreur: ' + e.message); }
  };

  const onExpAdded = (advId, exp) => setData(p => p.map(a => a.id === advId ? { ...a, expenses: [...(a.expenses || []), exp] } : a));
  const onExpDel = async (advId, expId) => {
    try {
      await deleteExpense(expId);
      setData(p => p.map(a => a.id === advId ? { ...a, expenses: a.expenses.filter(e => e.id !== expId) } : a));
    } catch (e) { alert('Erreur: ' + e.message); }
  };

  const detailAdv = selected ? data.find(a => a.id === selected) : null;

  if (loading) return <Loading />;

  return (
    <div>
      {error && <ErrorMsg msg={error} />}

      <div className="sum-bar">
        <div className="sum-item"><div className="sum-lbl">Total avances</div><div className="sum-val">{MAD(totalAdv)}</div></div>
        <div style={{ width: 1, background: 'rgba(255,255,255,.15)', alignSelf: 'stretch' }} />
        <div className="sum-item"><div className="sum-lbl">Justifié</div><div className="sum-val" style={{ color: '#7EE8A2' }}>{MAD(totalJust)}</div></div>
        <div style={{ width: 1, background: 'rgba(255,255,255,.15)', alignSelf: 'stretch' }} />
        <div className="sum-item"><div className="sum-lbl">Reste</div><div className="sum-val" style={{ color: '#FFA07A' }}>{MAD(totalAdv - totalJust)}</div></div>
      </div>

      {notJust > 0 && <div className="alert alert-warn">⚠️ {notJust} avance(s) sans justification</div>}

      <div className="filter-row">
        {[['', 'Tout'], ['not justified', 'Non justifié'], ['partially justified', 'Partiel'], ['justified', 'Justifié']].map(([v, l]) =>
          <div key={v} className={`filter-chip ${statusF === v ? 'active' : ''}`} onClick={() => setStatusF(v)}>{l}</div>
        )}
      </div>
      <div className="filter-row">
        {[['', 'Tout'], ['HABITIQ', 'HABITIQ'], ['HAJ', 'HAJ']].map(([v, l]) =>
          <div key={v} className={`filter-chip ${sourceF === v ? 'active' : ''}`} onClick={() => setSourceF(v)}>{l}</div>
        )}
      </div>

      <div className="sec-hd">
        <div>
          <div className="sec-title">Avances</div>
          <div className="sec-sub">{filtered.length} / {data.length}</div>
        </div>
      </div>

      {filtered.length === 0 && <div className="empty"><div className="empty-icon">💰</div><div className="empty-txt">Aucune avance</div></div>}

      {filtered.map(a => {
        const spent = expTotal(a);
        const rem = (+a.amount || 0) - spent;
        const pct = a.amount ? Math.min(100, (spent / a.amount) * 100) : 0;
        return (
          <div className="list-card" key={a.id}>
            <div className="lc-header" style={{ cursor: 'pointer' }} onClick={() => { setSelected(a.id); setModal('detail'); }}>
              <div className="lc-icon">{a.source === 'HAJ' ? '🏗' : '🏠'}</div>
              <div className="lc-main">
                <div className="lc-title">{a.reason || 'Sans motif'}</div>
                <div className="lc-meta">
                  <span className={`badge ${a.source === 'HAJ' ? 'bg-blue' : 'bg-gray'}`}>{a.source}</span>
                  <StatusBadge status={a.status} />
                  <span>{fdate(a.date)}</span>
                </div>
                <div className="prog" style={{ marginTop: 8 }}>
                  <div className="prog-fill" style={{ width: `${pct}%`, background: pct >= 100 ? 'var(--green)' : pct > 60 ? 'var(--orange)' : 'var(--accent)' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                  <span style={{ fontSize: '.68rem', color: 'var(--ink4)' }}>Dépensé: {MAD(spent)}</span>
                  <span style={{ fontSize: '.68rem', fontWeight: 700, color: rem < 0 ? 'var(--red)' : rem === 0 ? 'var(--green)' : 'var(--ink3)' }}>Reste: {MAD(rem)}</span>
                </div>
              </div>
              <div className="lc-amount">{MAD(a.amount)}</div>
            </div>
            <div className="lc-actions">
              <button className={`siham-btn ${a.recorded_by_siham ? 'siham-yes' : 'siham-no'}`} onClick={() => toggleSiham(a)}>
                {a.recorded_by_siham ? '🟢 Siham ✓' : '⚪ Siham'}
              </button>
              <div style={{ flex: 1 }} />
              <button className="btn btn-icon btn-sm" onClick={() => { setForm({ ...a, amount: String(a.amount) }); setModal('edit'); }}>✏️</button>
              <button className="btn btn-icon btn-sm" onClick={() => del(a.id)}>🗑</button>
            </div>
          </div>
        );
      })}

      <button className="fab" onClick={() => { setForm({ ...BLANK }); setModal('add'); }}>+</button>

      {/* ADD / EDIT MODAL */}
      {(modal === 'add' || modal === 'edit') && form && (
        <Modal title={modal === 'add' ? 'Nouvelle avance' : "Modifier l'avance"} onClose={() => setModal(null)} onSave={save} saving={saving}>
          <AdvForm v={form} set={setF} />
        </Modal>
      )}

      {/* DETAIL MODAL */}
      {modal === 'detail' && detailAdv && (
        <Modal title={detailAdv.reason || 'Détail avance'} onClose={() => { setModal(null); setSelected(null); }}>
          <div className="detail-grid">
            {[
              ['Source', <span className={`badge ${detailAdv.source === 'HAJ' ? 'bg-blue' : 'bg-gray'}`}>{detailAdv.source}</span>],
              ['Type', <span className="badge bg-gray">{detailAdv.advance_type}</span>],
              ['Montant', <b style={{ fontFamily: 'Syne,sans-serif' }}>{MAD(detailAdv.amount)}</b>],
              ['Date', fdate(detailAdv.date)],
              ['Projet', detailAdv.project || '—'],
              ['Statut', <StatusBadge status={detailAdv.status} />],
            ].map(([k, v], i) => (
              <div key={i} className="detail-cell"><div className="detail-lbl">{k}</div><div className="detail-val">{v}</div></div>
            ))}
          </div>

          <div style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: '.875rem', marginBottom: 10 }}>
            Dépenses <span style={{ fontWeight: 400, color: 'var(--ink4)', fontSize: '.78rem' }}>({(detailAdv.expenses || []).length})</span>
          </div>

          {(detailAdv.expenses || []).map(e => (
            <div key={e.id} className="exp-item">
              <div className="exp-info">
                <div className="exp-desc">{e.description}</div>
                <div className="exp-date">{fdate(e.date)}</div>
              </div>
              <div className="exp-amt">{MAD(e.amount)}</div>
              <button className="btn btn-icon" style={{ width: 28, height: 28, fontSize: '.8rem' }} onClick={() => onExpDel(detailAdv.id, e.id)}>🗑</button>
            </div>
          ))}

          <AddExpense advanceId={detailAdv.id} onAdded={(exp) => onExpAdded(detailAdv.id, exp)} />

          <div style={{ background: 'var(--bg)', borderRadius: 'var(--r)', padding: '12px 14px', marginTop: 14, display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
            {[
              ['Avance', MAD(detailAdv.amount), 'var(--ink)'],
              ['Dépensé', MAD(expTotal(detailAdv)), 'var(--orange)'],
              ['Reste', MAD((+detailAdv.amount || 0) - expTotal(detailAdv)), expTotal(detailAdv) <= (+detailAdv.amount || 0) ? 'var(--green)' : 'var(--red)'],
            ].map(([l, v, c]) => (
              <div key={l} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '.62rem', textTransform: 'uppercase', color: 'var(--ink4)', letterSpacing: '.08em' }}>{l}</div>
                <div style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: '.95rem', color: c, marginTop: 3 }}>{v}</div>
              </div>
            ))}
          </div>
        </Modal>
      )}
    </div>
  );
}
