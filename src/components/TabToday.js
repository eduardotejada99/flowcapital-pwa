'use client';

import { useState } from 'react';

export default function TabToday({
  metrics,
  upcomingFixed,
  recentExpenses,
  onOpenQuickExpense,
  onToggleFixedStatus,
}) {
  const [hideBalance, setHideBalance] = useState(false);

  const {
    safeToSpendToday,
    baseDailySafeToSpend,
    spentToday,
    remainingDays,
    penaltyPer30Soles,
    healthStatus,
    variablePoolTotal,
    variableSpentMonth,
  } = metrics;

  const totalBalance = Math.max(0, variablePoolTotal - variableSpentMonth + 3200);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* 1. Vaulta Virtual Bank Card (Screenshots 8 & 10) */}
      <section className="vaulta-card">
        <div className="vaulta-card-top">
          <div className="vaulta-card-brand">
            <span>FLOWCAPITAL</span>
            <span style={{ fontSize: '10px', opacity: 0.8 }}>PREMIUM</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div className="vaulta-card-chip" />
            <span style={{ fontSize: '16px', opacity: 0.8 }}>📡</span>
          </div>
        </div>

        <div className="vaulta-card-mid">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="vaulta-card-eyebrow">Balance Total Disponible</span>
            <button
              type="button"
              onClick={() => setHideBalance(!hideBalance)}
              style={{
                color: 'rgba(255,255,255,0.7)',
                fontSize: '14px',
                background: 'rgba(0,0,0,0.2)',
                padding: '2px 8px',
                borderRadius: '12px'
              }}
            >
              {hideBalance ? '👁️ Ver' : '🙈 Ocultar'}
            </button>
          </div>
          <div className="vaulta-card-balance tabular-nums">
            {hideBalance ? 'S/ ••••••••' : `S/ ${totalBalance.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          </div>
        </div>

        <div className="vaulta-card-bottom">
          <div>
            <div className="vaulta-card-pan">•••• •••• •••• 5678</div>
            <div className="vaulta-card-holder">EDUARDO TEJADA · EXP 12/32</div>
          </div>
          <div className="vaulta-card-visa">VISA</div>
        </div>
      </section>

      {/* 2. Vaulta Quick Actions Row (Screenshot 8) */}
      <section className="vaulta-actions-row">
        <button
          type="button"
          className="vaulta-action-btn"
          onClick={onOpenQuickExpense}
        >
          <div className="vaulta-action-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#FBBF24' }}>
            ⚡
          </div>
          <span className="vaulta-action-label">Gasto</span>
        </button>

        <button
          type="button"
          className="vaulta-action-btn"
          onClick={() => alert('Para registrar un ingreso mensual dirígete a la pestaña Flujo de Caja.')}
        >
          <div className="vaulta-action-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34D399' }}>
            💰
          </div>
          <span className="vaulta-action-label">Ingreso</span>
        </button>

        <button
          type="button"
          className="vaulta-action-btn"
          onClick={() => alert(`Simulación de Fricción: Gastar S/30 extra hoy reduce tu límite diario en S/ ${penaltyPer30Soles.toFixed(2)} por los siguientes ${remainingDays} días.`)}
        >
          <div className="vaulta-action-icon" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#60A5FA' }}>
            🔒
          </div>
          <span className="vaulta-action-label">Límites</span>
        </button>

        <button
          type="button"
          className="vaulta-action-btn"
          onClick={() => alert(`Estado de Liquidez: ${healthStatus.label}. Bolsa libre del mes: S/ ${Math.max(0, variablePoolTotal - variableSpentMonth).toFixed(2)}.`)}
        >
          <div className="vaulta-action-icon" style={{ background: 'rgba(139, 92, 246, 0.15)', color: '#C084FC' }}>
            📊
          </div>
          <span className="vaulta-action-label">Métricas</span>
        </button>
      </section>

      {/* 3. Twin Usage & Budget Cards (Screenshot 8) */}
      <section className="vaulta-twin-grid">
        <div className="vaulta-metric-card">
          <span className="vaulta-metric-title">Safe-to-Spend Hoy</span>
          <div className="vaulta-metric-val tabular-nums" style={{ color: safeToSpendToday < 0 ? '#EF4444' : '#10B981' }}>
            {hideBalance ? 'S/ •••' : `S/ ${safeToSpendToday.toFixed(2)}`}
          </div>
          <div className="vaulta-metric-sub">
            Base: S/ {baseDailySafeToSpend.toFixed(2)}
          </div>
          <div className="vaulta-progress-wrap">
            <div
              className="vaulta-progress-fill"
              style={{
                width: `${Math.min(100, Math.max(5, (spentToday / (baseDailySafeToSpend || 1)) * 100))}%`,
                background: safeToSpendToday < 0 ? '#EF4444' : '#10B981'
              }}
            />
          </div>
        </div>

        <div className="vaulta-metric-card">
          <span className="vaulta-metric-title">Uso de este mes</span>
          <div className="vaulta-metric-val tabular-nums">
            {hideBalance ? 'S/ •••' : `S/ ${variableSpentMonth.toFixed(0)}`}
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>
              {' '}/ {variablePoolTotal.toFixed(0)}
            </span>
          </div>
          <div className="vaulta-metric-sub">
            {remainingDays} días restantes
          </div>
          <div className="vaulta-progress-wrap">
            <div
              className="vaulta-progress-fill"
              style={{
                width: `${Math.min(100, (variableSpentMonth / (variablePoolTotal || 1)) * 100)}%`,
                background: 'linear-gradient(90deg, #3B82F6, #F59E0B)'
              }}
            />
          </div>
        </div>
      </section>

      {/* 4. Próximos Pagos Fijos en 72 Horas (Screenshot 9) */}
      <section style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '18px', padding: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <span style={{ fontSize: '13px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.4px', color: 'var(--text-secondary)' }}>
            ⏰ Vencimientos Inmediatos
          </span>
          <span style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#FBBF24', fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '12px' }}>
            {upcomingFixed.length} pendientes
          </span>
        </div>

        {upcomingFixed.length === 0 ? (
          <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Al día. Sin compromisos fijos en las próximas 72 horas.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {upcomingFixed.map((item) => (
              <div key={item.id} className="reminder-item">
                <div className="reminder-item-left">
                  <div className="reminder-logo">
                    {item.title.toLowerCase().includes('netflix')
                      ? '🎬'
                      : item.title.toLowerCase().includes('spotify')
                      ? '🎵'
                      : item.title.toLowerCase().includes('luz') || item.title.toLowerCase().includes('agua')
                      ? '💡'
                      : item.title.toLowerCase().includes('internet')
                      ? '🌐'
                      : '💳'}
                  </div>
                  <div>
                    <div className="reminder-title">{item.title}</div>
                    <div className="reminder-meta">
                      <span className={`badge-countdown ${item.daysDiff === 0 ? 'badge-today' : 'badge-soon'}`}>
                        {item.daysDiff === 0 ? 'Vence Hoy' : `En ${item.daysDiff} días`}
                      </span>
                      <span>Día {item.due_day}</span>
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className="tabular-nums" style={{ fontWeight: 800, fontSize: '14px' }}>
                    S/ {Number(item.amount).toFixed(2)}
                  </div>
                  <button
                    type="button"
                    onClick={() => onToggleFixedStatus(item)}
                    style={{
                      marginTop: '4px',
                      background: 'rgba(16, 185, 129, 0.15)',
                      border: '1px solid rgba(16, 185, 129, 0.3)',
                      color: '#34D399',
                      padding: '3px 8px',
                      borderRadius: '6px',
                      fontSize: '10px',
                      fontWeight: 700
                    }}
                  >
                    Marcar Pagado
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 5. Historial de Transacciones Bancarias (Screenshot 8 & 10) */}
      <section style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '18px', padding: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <span style={{ fontSize: '13px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.4px', color: 'var(--text-secondary)' }}>
            🧾 Últimos Movimientos
          </span>
          <span style={{ fontSize: '11px', color: 'var(--sapphire-light)', fontWeight: 600 }}>
            Ver todos ↗
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {recentExpenses.slice(0, 4).map((exp) => (
            <div key={exp.id} className="bank-tx-item">
              <div className="bank-tx-left">
                <div className="bank-tx-icon">
                  {exp.category === 'Alimentación'
                    ? '🍔'
                    : exp.category === 'Transporte'
                    ? '🚕'
                    : exp.category === 'Salud'
                    ? '💊'
                    : '🛍️'}
                </div>
                <div>
                  <div className="bank-tx-title">{exp.description}</div>
                  <div className="bank-tx-meta">{exp.category} · {exp.expense_date}</div>
                </div>
              </div>
              <div className="bank-tx-amount tabular-nums" style={{ color: '#EF4444' }}>
                - S/ {Number(exp.amount).toFixed(2)}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
