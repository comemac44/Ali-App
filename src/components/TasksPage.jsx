import { useState, useEffect, useCallback } from 'react';
import { getTasks, createTask, updateTask, deleteTask } from '../lib/api';
import { fdate, tod, isPast, TaskBadge, Modal, Loading, ErrorMsg } from './shared';

const BLANK = { title: '', description: '', project: '', due_date: '', status: 'todo', done: false, notes: '' };

export default function TasksPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [statusF, setStatusF] = useState('');

  const load = useCallback(async () => {
    try { setData(await getTasks()); } catch (e) { setError(e.message); }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const setF = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const filtered = data.filter(t =>
    !statusF ||
    (statusF === 'done' ? t.done :
      statusF === 'overdue' ? !t.done && isPast(t.due_date) :
        t.status === statusF)
  );

  const doneN = data.filter(t => t.done).length;
  const inProg = data.filter(t => t.status === 'in progress' && !t.done).length;
  const overdue = data.filter(t => !t.done && isPast(t.due_date)).length;

  const save = async () => {
    if (!form?.title) return alert('Titre obligatoire');
    setSaving(true);
    try {
      const payload = { ...form, due_date: form.due_date || null };
      if (modal === 'add') {
        const created = await createTask(payload);
        setData(p => [created, ...p]);
      } else {
        const updated = await updateTask(form.id, payload);
        setData(p => p.map(t => t.id === form.id ? updated : t));
      }
      setModal(null);
    } catch (e) { alert('Erreur: ' + e.message); }
    setSaving(false);
  };

  const del = async (id) => {
    if (!window.confirm('Supprimer cette tâche ?')) return;
    try { await deleteTask(id); setData(p => p.filter(t => t.id !== id)); }
    catch (e) { alert('Erreur: ' + e.message); }
  };

  const toggle = async (task) => {
    const patch = { done: !task.done, status: !task.done ? 'done' : 'in progress' };
    try {
      await updateTask(task.id, patch);
      setData(p => p.map(t => t.id === task.id ? { ...t, ...patch } : t));
    } catch (e) { alert('Erreur: ' + e.message); }
  };

  if (loading) return <Loading />;

  return (
    <div>
      {error && <ErrorMsg msg={error} />}

      <div className="kpi-row">
        <div className="kpi-card b"><div className="kpi-lbl">En cours</div><div className="kpi-val">{inProg}</div></div>
        <div className="kpi-card g"><div className="kpi-lbl">Terminées</div><div className="kpi-val">{doneN}/{data.length}</div></div>
        {overdue > 0 && (
          <div className="kpi-card r" style={{ gridColumn: '1/-1' }}>
            <div className="kpi-lbl">⚠ En retard</div>
            <div className="kpi-val" style={{ color: 'var(--red)' }}>{overdue} tâche(s)</div>
          </div>
        )}
      </div>

      {overdue > 0 && <div className="alert alert-danger">🔴 {overdue} tâche(s) dépassée(s) !</div>}

      <div className="filter-row">
        {[['', 'Tout'], ['todo', 'À faire'], ['in progress', 'En cours'], ['done', 'Terminé'], ['overdue', '⚠ Retard']].map(([v, l]) =>
          <div key={v} className={`filter-chip ${statusF === v ? 'active' : ''}`} onClick={() => setStatusF(v)}>{l}</div>
        )}
      </div>

      <div className="sec-hd">
        <div><div className="sec-title">Tâches (TAF)</div><div className="sec-sub">{filtered.length} affichées</div></div>
      </div>

      {filtered.length === 0 && <div className="empty"><div className="empty-icon">✅</div><div className="empty-txt">Aucune tâche</div></div>}

      {filtered.map(t => (
        <div className="list-card" key={t.id} style={{ opacity: t.done ? .7 : 1 }}>
          <div className="lc-header">
            <div style={{ paddingTop: 2 }}>
              <input type="checkbox" checked={t.done} onChange={() => toggle(t)}
                style={{ width: 20, height: 20, accentColor: 'var(--accent)', cursor: 'pointer' }} />
            </div>
            <div className="lc-main">
              <div className="lc-title" style={{ textDecoration: t.done ? 'line-through' : 'none' }}>{t.title}</div>
              <div className="lc-meta">
                {t.project && <span className="badge bg-blue">{t.project}</span>}
                <TaskBadge status={t.status} done={t.done} />
                {t.due_date && (
                  <span style={{ color: !t.done && isPast(t.due_date) ? 'var(--red)' : 'var(--ink4)', fontWeight: !t.done && isPast(t.due_date) ? 700 : 400 }}>
                    {fdate(t.due_date)}{!t.done && isPast(t.due_date) ? ' ⚠️' : ''}
                  </span>
                )}
              </div>
              {t.notes && <div style={{ fontSize: '.75rem', color: 'var(--ink4)', marginTop: 4, fontStyle: 'italic' }}>"{t.notes}"</div>}
            </div>
            <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
              <button className="btn btn-icon" style={{ width: 30, height: 30 }} onClick={() => { setForm({ ...t, due_date: t.due_date || '' }); setModal('edit'); }}>✏️</button>
              <button className="btn btn-icon" style={{ width: 30, height: 30 }} onClick={() => del(t.id)}>🗑</button>
            </div>
          </div>
        </div>
      ))}

      <button className="fab" onClick={() => { setForm({ ...BLANK }); setModal('add'); }}>+</button>

      {(modal === 'add' || modal === 'edit') && form && (
        <Modal title={modal === 'add' ? 'Nouvelle tâche' : 'Modifier'} onClose={() => setModal(null)} onSave={save} saving={saving}>
          <div className="form-group">
            <label>Titre *</label>
            <input type="text" value={form.title} onChange={e => setF('title', e.target.value)} placeholder="Titre de la tâche" />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea value={form.description} onChange={e => setF('description', e.target.value)} placeholder="Détails..." />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Projet</label>
              <input type="text" value={form.project} onChange={e => setF('project', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Échéance</label>
              <input type="date" value={form.due_date} onChange={e => setF('due_date', e.target.value)} />
            </div>
          </div>
          <div className="form-group">
            <label>Statut</label>
            <select value={form.status} onChange={e => setF('status', e.target.value)}>
              <option value="todo">À faire</option>
              <option value="in progress">En cours</option>
              <option value="done">Terminé</option>
            </select>
          </div>
          <div className="form-group">
            <label>Notes</label>
            <textarea value={form.notes} onChange={e => setF('notes', e.target.value)} style={{ minHeight: 55 }} />
          </div>
          <div className="chk-row">
            <input type="checkbox" id="done1" checked={form.done} onChange={e => setF('done', e.target.checked)} />
            <label htmlFor="done1">Marquer comme terminé</label>
          </div>
        </Modal>
      )}
    </div>
  );
}
