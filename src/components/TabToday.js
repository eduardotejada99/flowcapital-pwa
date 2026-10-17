'use client';

export default function TabToday({
  metrics,
  upcomingFixed,
  recentExpenses,
  onOpenQuickExpense,
  onToggleFixedStatus,
}) {
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

  const statusCardClass =
    healthStatus.code === 'ROJO'
      ? 'status-red'
      : healthStatus.code === 'ÁMBAR'
      ? 'status-amber'
      : '';

  const badgeClass =
    healthStatus.code === 'ROJO'
      ? 'traffic-red'
      : healthStatus.code === 'ÁMBAR'
      ? 'traffic-amber'
      : 'traffic-green';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Tarjeta Hero Central: Safe-to-Spend Diario */}
      <section className={`hero-sts-card ${statusCardClass}`}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span className="sts-eyebrow">Safe-to-Spend para Hoy</span>
          <span className={`traffic-badge ${badgeClass}`}>
            ● {healthStatus.label}
          </span>
        </div>

        <div className="sts-amount tabular-nums">
          S/ {safeToSpendToday.toFixed(2)}
        </div>

        <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
          Cuota base diaria: <strong className="tabular-nums">S/ {baseDailySafeToSpend.toFixed(2)}</strong> · Gastado hoy:{' '}
          <strong className="tabular-nums">S/ {spentToday.toFixed(2)}</strong>
        </p>

        <div className="metrics-split">
          <div>
            <div className="metric-mini-label">Bolsa Variable Libre del Mes</div>
            <div className="metric-mini-value tabular-nums">
              S/ {Math.max(0, variablePoolTotal - variableSpentMonth).toFixed(2)}{' '}
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                / S/ {variablePoolTotal.toFixed(0)}
              </span>
            </div>
          </div>
          <div>
            <div className="metric-mini-label">Restan en el Ciclo</div>
            <div className="metric-mini-value tabular-nums">
              {remainingDays} {remainingDays === 1 ? 'día' : 'días'}
            </div>
          </div>
        </div>
      </section>

      {/* Botón de Registro Rápido en 3 Toques */}
      <button
        type="button"
        className="btn-primary"
        onClick={onOpenQuickExpense}
      >
        <span>⚡ Registrar Gasto en 3 Toques</span>
      </button>

      {/* Alerta Dinámica de Elasticidad */}
      <div className="dynamic-alert-box">
        <strong>Simulación de Fricción Diaria:</strong> Si hoy gastas{' '}
        <span className="tabular-nums" style={{ color: 'var(--amber)', fontWeight: 700 }}>
          S/ 30.00
        </span>{' '}
        de más, tu disponible diario de los siguientes{' '}
        <strong>{Math.max(1, remainingDays - 1)} días</strong> bajará en{' '}
        <span className="tabular-nums" style={{ color: 'var(--crimson)', fontWeight: 700 }}>
          S/ {penaltyPer30Soles.toFixed(2)}
        </span>{' '}
        por día.
      </div>

      {/* Bloque de Gastos Fijos Próximos (Vencimientos en las próximas 72h) */}
      <section className="surface-card">
        <div className="section-header">
          <span className="section-title">
            ⏰ Vencimientos en las próximas 72 Horas
          </span>
          <span className="micro-badge badge-soon">
            {upcomingFixed.length} alerta(s)
          </span>
        </div>

        {upcomingFixed.length === 0 ? (
          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
            Sin pagos fijos pendientes en las siguientes 72 horas.
          </p>
        ) : (
          <div className="item-list">
            {upcomingFixed.map((item) => (
              <div key={item.id} className="item-row">
                <div>
                  <div className="item-title">{item.title}</div>
                  <div className="item-meta">
                    Día {item.due_day} ·{' '}
                    {item.daysDiff === 0
                      ? 'Vence Hoy'
                      : `Vence en ${item.daysDiff} día(s)`}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div
                    className="tabular-nums"
                    style={{ fontWeight: 700, fontSize: '0.92rem' }}
                  >
                    S/ {Number(item.amount).toFixed(2)}
                  </div>
                  <button
                    type="button"
                    onClick={() => onToggleFixedStatus(item)}
                    className="micro-badge badge-urgent"
                    style={{ marginTop: 4 }}
                  >
                    Marcar Pagado
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Movimientos Recientes del Día */}
      <section className="surface-card">
        <div className="section-header">
          <span className="section-title">🧾 Últimos Gastos Variables</span>
        </div>
        <div className="item-list">
          {recentExpenses.slice(0, 4).map((exp) => (
            <div key={exp.id} className="item-row">
              <div>
                <div className="item-title">{exp.description}</div>
                <div className="item-meta">
                  {exp.category} · {exp.payment_method} · {exp.expense_date}
                </div>
              </div>
              <div
                className="tabular-nums"
                style={{ fontWeight: 700, color: 'var(--crimson)' }}
              >
                - S/ {Number(exp.amount).toFixed(2)}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
