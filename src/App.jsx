import { useState } from 'react';
import './styles.css';
import DashboardPage from './components/DashboardPage';
import AdvancesPage from './components/AdvancesPage';
import TasksPage from './components/TasksPage';
import QuotesPage from './components/QuotesPage';
import SihamPage from './components/SihamPage';

const PAGES = {
  dash: { label: 'Tableau de bord', icon: '🏠', short: 'Accueil' },
  adv:  { label: 'Avances de fonds', icon: '💰', short: 'Avances' },
  tasks:{ label: 'Tâches (TAF)',     icon: '✅', short: 'TAF' },
  quotes:{ label: 'Devis & offres',  icon: '📄', short: 'Devis' },
  siham:{ label: 'Suivi Siham',      icon: '📂', short: 'Siham' },
};

export default function App() {
  const [page, setPage] = useState('dash');

  return (
    <div className="app">
      {/* TOP BAR */}
      <div className="topbar">
        <div>
          <div className="tb-brand">ALI AVANCES & TAF</div>
          <div className="tb-sub">{PAGES[page]?.label}</div>
        </div>
        <div className="tb-date">
          {new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: '2-digit' })}
        </div>
      </div>

      {/* PAGE CONTENT */}
      <div className="page">
        {page === 'dash'   && <DashboardPage setPage={setPage} />}
        {page === 'adv'    && <AdvancesPage />}
        {page === 'tasks'  && <TasksPage />}
        {page === 'quotes' && <QuotesPage />}
        {page === 'siham'  && <SihamPage />}
      </div>

      {/* BOTTOM NAV */}
      <nav className="bottom-nav">
        {Object.entries(PAGES).map(([id, p]) => (
          <div key={id} className={`bn-item ${page === id ? 'active' : ''}`} onClick={() => setPage(id)}>
            <div className="bn-icon">{p.icon}</div>
            <div className="bn-label">{p.short}</div>
          </div>
        ))}
      </nav>
    </div>
  );
}
