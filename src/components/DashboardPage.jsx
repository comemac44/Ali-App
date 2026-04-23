import { useState, useEffect, useCallback, useMemo } from 'react';
import { getAdvances, getTasks, getQuotes } from '../lib/api';
import { MAD, fdate, isPast, expTotal, StatusBadge, Loading, ErrorMsg } from './shared';

export default function DashboardPage({ setPage }) {
  const [advances, setAdvances] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      const [a, t, q] = await Promise.all([getAdvances(), getTasks(), getQuotes()]);
      setAdvances(a); setTasks(t); setQuotes(q);
    } catch (e) { setError(e.message); }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const totalAdv = advances.reduce((s, a) => s + (+a.amount || 0), 0);
  const hajAdv = advances.filter(a => a.source === 'HAJ').reduce((s, a) => s + (+a.amount || 0), 0);
  const totalJust = advances.filter(a => a.status === 'justified').reduce((s, a) => s + (+a.amount || 0), 0);
  const notJust = advances.filter(a => a.status === 'not justified').length;
  const tasksDone = tasks.filter(t => t.done).length;
  const tasksInProg = tasks.filter(t => t.status === 'in progress' && !t.done).length;
  const overdue = tasks.filter(t => !t.done && isPast(t.due_date)).length;
  const sihamPend = advances.filter(a => !a.recorded_by_siham).length + quotes.filter(q => !q.recorded_by_siham).length;
  const totalQuotesAmt = quotes.reduce((s, q) => s + (+q.amount || 0), 0);

  const monthlyAdv = useMemo(() => {
    const m = {};
    advances.forEach(a => { const k = (a.date || '').slice(0, 7); if (k) m[k] = (m[k] || 0) + (+a.amount || 0); });
    const sorted = Object.entries(m).sort().slice(-5);
    const max = Math.max(...sorted.map(([, v]) => v), 1);
    return sorted.map(([k, v]) => ({ l: k.slice(5), v, p: (v / max) * 100 }));
  }, [advances]);

  if (loading) return <Loading />;

  return (
    <div>
      {error && <ErrorMsg msg={error} />}

      <div style={{ marginBottom: 16 }}>
        <div style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: '1.25rem' }}>Bonjour 👋</div>
        <div style={{ fontSize: '.78rem', color: 'var(--ink4)', marginTop: 2 }}>
          {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
        </div>
      </div>

      {notJust > 0 && <div className="alert alert-warn" onClick={() => setPage('adv')}>⚠️ {notJust} avance(s) sans justification</div>}
      {overdue > 0 && <div className="alert alert-danger" onClick={() => setPage('tasks')}>🔴 {overdue} tâche(s) en retard</div>}
      {sihamPend > 0 && <div className="alert alert-warn" onClick={() => setPage('siham')}>📂 {sihamPend} élément(s) en attente Siham</div>}

      <div className="kpi-row">
        <div className="kpi-card" style={{ cursor: 'pointer' }} onClick={() => setPage('adv')}>
          <div className="kpi-lbl">Total avances</div>
          <div className="kpi-val" style={{ fontSize: '1rem' }}>{MAD(totalAdv)}</div>
          <div className="kpi-sub">{advances.length} avances</div>
        </div>
        <div className="kpi-card b" style={{ cursor: 'pointer' }} onClick={() => setPage('adv')}>
          <div className="kpi-lbl">Reste à justifier</div>
          <div className="kpi-val" style={{ color: 'var(--orange)', fontSize: '1rem' }}>{MAD(totalAdv - totalJust)}</div>
          <div className="kpi-sub">{notJust} non justifié(s)</div>
        </div>
        <div className="kpi-card g" style={{ cursor: 'pointer' }} onClick={() => setPage('tasks')}>
          <div className="kpi-lbl">Tâches en cours</div>
          <div className="kpi-val">{tasksInProg}</div>
          <div className="kpi-sub">{tasksDone} terminées</div>
        </div>
        <div className="kpi-card o" style={{ cursor: 'pointer' }} onClick={() => setPage('quotes')}>
          <div className="kpi-lbl">Devis</div>
          <div className="kpi-val">{quotes.length}</div>
          <div className="kpi-sub" style={{ fontSize: '.65rem' }}>{MAD(totalQuotesAmt)}</div>
        </div>
      </div>

      {monthlyAdv.length > 0 && (
        <div className="chart-wrap">
          <div className="chart-title">📊 Avances par mois</div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 70 }}>
            {monthlyAdv.map((m, i) => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', height: '100%' }}>
                <div style={{ width: '100%', height: `${m.p}%`, background: 'var(--accent)', borderRadius: '4px 4px 0 0', opacity: .85, minHeight: 4 }} title={MAD(m.v)} />
                <div style={{ fontSize: '.6rem', color: 'var(--ink4)', marginTop: 3 }}>{m.l}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="sec-hd" style={{ marginTop: 4 }}>
        <div className="sec-title">Tâches récentes</div>
        <span style={{ fontSize: '.75rem', color: 'var(--accent)', fontWeight: 700, cursor: 'pointer' }} onClick={() => setPage('tasks')}>Voir tout →</span>
      </div>
      {tasks.slice(0, 4).map(t => (
        <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: t.done ? 'var(--green)' : t.status === 'in progress' ? 'var(--blue)' : 'var(--ink4)', flexShrink: 0 }} />
          <div style={{ flex: 1, fontSize: '.875rem', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textDecoration: t.done ? 'line-through' : 'none', color: t.done ? 'var(--ink4)' : 'var(--ink)' }}>{t.title}</div>
          <div style={{ fontSize: '.7rem', color: !t.done && isPast(t.due_date) ? 'var(--red)' : 'var(--ink4)', flexShrink: 0, fontWeight: !t.done && isPast(t.due_date) ? 700 : 400 }}>{fdate(t.due_date)}</div>
        </div>
      ))}
      {tasks.length === 0 && <div style={{ color: 'var(--ink4)', fontSize: '.85rem', padding: '8px 0' }}>Aucune tâche</div>}

      <div className="sec-hd" style={{ marginTop: 16 }}>
        <div className="sec-title">Dernières avances</div>
        <span style={{ fontSize: '.75rem', color: 'var(--accent)', fontWeight: 700, cursor: 'pointer' }} onClick={() => setPage('adv')}>Voir tout →</span>
      </div>
      {advances.slice(0, 3).map(a => (
        <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
          <span className={`badge ${a.source === 'HAJ' ? 'bg-blue' : 'bg-gray'}`}>{a.source}</span>
          <div style={{ flex: 1, fontSize: '.875rem', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.reason || 'Sans motif'}</div>
          <StatusBadge status={a.status} />
          <span style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: '.875rem', flexShrink: 0 }}>{MAD(a.amount)}</span>
        </div>
      ))}
      {advances.length === 0 && <div style={{ color: 'var(--ink4)', fontSize: '.85rem', padding: '8px 0' }}>Aucune avance</div>}
    </div>
  );
}
