import { useState, useEffect, useCallback } from 'react';
import { getAdvances, updateAdvance, getQuotes, updateQuote } from '../lib/api';
import { MAD, fdate, tod, Loading, ErrorMsg } from './shared';

export default function SihamPage() {
  const [advances, setAdvances] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('adv');
  const [filter, setFilter] = useState('');

  const load = useCallback(async () => {
    try {
      const [a, q] = await Promise.all([getAdvances(), getQuotes()]);
      setAdvances(a); setQuotes(q);
    } catch (e) { setError(e.message); }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const toggleAdv = async (adv) => {
    const patch = { recorded_by_siham: !adv.recorded_by_siham, date_recorded: !adv.recorded_by_siham ? tod() : null };
    try {
      await updateAdvance(adv.id, patch);
      setAdvances(p => p.map(a => a.id === adv.id ? { ...a, ...patch } : a));
    } catch (e) { alert('Erreur: ' + e.message); }
  };

  const toggleQ = async (q) => {
    const patch = { recorded_by_siham: !q.recorded_by_siham, date_recorded: !q.recorded_by_siham ? tod() : null };
    try {
      await updateQuote(q.id, patch);
      setQuotes(p => p.map(x => x.id === q.id ? { ...x, ...patch } : x));
    } catch (e) { alert('Erreur: ' + e.message); }
  };

  const filtAdv = advances.filter(a => !filter || (filter === 'yes' ? a.recorded_by_siham : !a.recorded_by_siham));
  const filtQ = quotes.filter(q => !filter || (filter === 'yes' ? q.recorded_by_siham : !q.recorded_by_siham));
  const pendAdv = advances.filter(a => !a.recorded_by_siham).length;
  const pendQ = quotes.filter(q => !q.recorded_by_siham).length;

  if (loading) return <Loading />;

  return (
    <div>
      {error && <ErrorMsg msg={error} />}

      <div className="kpi-row">
        <div className="kpi-card r"><div className="kpi-lbl">Avances en attente</div><div className="kpi-val">{pendAdv}</div></div>
        <div className="kpi-card o"><div className="kpi-lbl">Devis en attente</div><div className="kpi-val">{pendQ}</div></div>
      </div>

      {(pendAdv + pendQ) > 0 && (
        <div className="alert alert-warn">📂 {pendAdv + pendQ} élément(s) à enregistrer par Siham</div>
      )}

      <div className="sec-hd">
        <div className="sec-title">Suivi Siham</div>
        <div style={{ display: 'flex', gap: 6 }}>
          {[['', 'Tout'], ['no', 'Attente'], ['yes', '✓ Fait']].map(([v, l]) =>
            <div key={v} className={`filter-chip ${filter === v ? 'active' : ''}`}
              style={{ padding: '5px 10px', fontSize: '.68rem' }}
              onClick={() => setFilter(v)}>{l}</div>
          )}
        </div>
      </div>

      <div className="tabs">
        <div className={`tab ${tab === 'adv' ? 'active' : ''}`} onClick={() => setTab('adv')}>
          Avances {pendAdv > 0 ? `(${pendAdv})` : ''}
        </div>
        <div className={`tab ${tab === 'quotes' ? 'active' : ''}`} onClick={() => setTab('quotes')}>
          Devis {pendQ > 0 ? `(${pendQ})` : ''}
        </div>
      </div>

      {tab === 'adv' && (
        filtAdv.length === 0
          ? <div className="empty"><div className="empty-icon">📂</div><div className="empty-txt">Aucune avance</div></div>
          : filtAdv.map(a => (
            <div className="list-card" key={a.id}>
              <div className="lc-header" style={{ cursor: 'default' }}>
                <div className="lc-icon">{a.source === 'HAJ' ? '🏗' : '🏠'}</div>
                <div className="lc-main">
                  <div className="lc-title">{a.reason || 'Sans motif'}</div>
                  <div className="lc-meta">
                    <span className={`badge ${a.source === 'HAJ' ? 'bg-blue' : 'bg-gray'}`}>{a.source}</span>
                    <span style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700 }}>{MAD(a.amount)}</span>
                    <span>{fdate(a.date)}</span>
                  </div>
                </div>
              </div>
              <div className="lc-actions">
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', flex: 1, fontSize: '.875rem', fontWeight: 500, color: a.recorded_by_siham ? 'var(--green)' : 'var(--ink3)' }}>
                  <input type="checkbox" checked={!!a.recorded_by_siham} onChange={() => toggleAdv(a)}
                    style={{ width: 20, height: 20, accentColor: 'var(--green)' }} />
                  {a.recorded_by_siham ? '✓ Enregistré par Siham' : 'Marquer comme enregistré'}
                </label>
                {a.recorded_by_siham && <span style={{ fontSize: '.72rem', color: 'var(--ink4)' }}>{fdate(a.date_recorded)}</span>}
              </div>
            </div>
          ))
      )}

      {tab === 'quotes' && (
        filtQ.length === 0
          ? <div className="empty"><div className="empty-icon">📄</div><div className="empty-txt">Aucun devis</div></div>
          : filtQ.map(q => (
            <div className="list-card" key={q.id}>
              <div className="lc-header" style={{ cursor: 'default' }}>
                <div className="lc-icon">{q.type === 'service' ? '🔧' : '📦'}</div>
                <div className="lc-main">
                  <div className="lc-title">{q.supplier}</div>
                  <div className="lc-meta">
                    <span className={`badge ${q.type === 'service' ? 'bg-blue' : 'bg-orange'}`}>{q.type === 'service' ? 'Prestation' : 'Fournitures'}</span>
                    <span style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700 }}>{MAD(q.amount)}</span>
                    <span>{fdate(q.date)}</span>
                  </div>
                </div>
              </div>
              <div className="lc-actions">
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', flex: 1, fontSize: '.875rem', fontWeight: 500, color: q.recorded_by_siham ? 'var(--green)' : 'var(--ink3)' }}>
                  <input type="checkbox" checked={!!q.recorded_by_siham} onChange={() => toggleQ(q)}
                    style={{ width: 20, height: 20, accentColor: 'var(--green)' }} />
                  {q.recorded_by_siham ? '✓ Enregistré par Siham' : 'Marquer comme enregistré'}
                </label>
                {q.recorded_by_siham && <span style={{ fontSize: '.72rem', color: 'var(--ink4)' }}>{fdate(q.date_recorded)}</span>}
              </div>
            </div>
          ))
      )}
    </div>
  );
}
