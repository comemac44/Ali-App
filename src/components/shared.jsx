// ── HELPERS ──────────────────────────────────────────────────────────────────
export const MAD = (n) =>
  new Intl.NumberFormat('fr-MA', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n || 0) + ' MAD';

export const fdate = (d) =>
  d ? new Date(d + 'T00:00:00').toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: '2-digit' }) : '—';

export const tod = () => new Date().toISOString().slice(0, 10);

export const isPast = (d) => d && new Date(d + 'T00:00:00') < new Date(new Date().toDateString());

export const expTotal = (adv) => (adv.expenses || []).reduce((s, e) => s + (+e.amount || 0), 0);

// ── BADGES ───────────────────────────────────────────────────────────────────
export function StatusBadge({ status }) {
  if (status === 'justified')          return <span className="badge bg-green">✓ Justifié</span>;
  if (status === 'partially justified') return <span className="badge bg-orange">◑ Partiel</span>;
  return <span className="badge bg-red">✗ Non justifié</span>;
}

export function TaskBadge({ status, done }) {
  if (done || status === 'done') return <span className="badge bg-green">✓ Terminé</span>;
  if (status === 'in progress')  return <span className="badge bg-blue">⚡ En cours</span>;
  return <span className="badge bg-gray">À faire</span>;
}

// ── MODAL ────────────────────────────────────────────────────────────────────
export function Modal({ title, onClose, onSave, saving, children }) {
  return (
    <div className="modal-bg" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-hd">
          <span className="modal-title">{title}</span>
          <button className="btn btn-icon" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">{children}</div>
        {onSave && (
          <div className="modal-footer">
            <button className="btn btn-secondary" style={{ flex: 1 }} onClick={onClose} disabled={saving}>Annuler</button>
            <button className="btn btn-primary" style={{ flex: 2 }} onClick={onSave} disabled={saving}>
              {saving ? '⏳ Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── LOADING ──────────────────────────────────────────────────────────────────
export function Loading() {
  return <div className="loading"><div className="spinner" /><span>Chargement...</span></div>;
}

// ── ERROR ────────────────────────────────────────────────────────────────────
export function ErrorMsg({ msg }) {
  return <div className="error-msg">❌ {msg}</div>;
}
