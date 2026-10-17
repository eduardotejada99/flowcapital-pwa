'use client';

import { useState } from 'react';

export default function TabGoals({
  sinkingFunds,
  metrics,
  onContributeGoal,
  onAddGoal,
}) {
  const [whimAmount, setWhimAmount] = useState('250');
  const [title, setTitle] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [targetDate, setTargetDate] = useState('2027-06-01');

  const numericWhim = Math.max(0, parseFloat(whimAmount) || 0);
  const dailySafeBase = Math.max(1, metrics.baseDailySafeToSpend);

  const beltTighteningDays = Math.ceil(numericWhim / dailySafeBase);
  const reducedDailyFor15Days = Math.max(
    0,
    dailySafeBase - numericWhim / 15
  );
  const dailyQuotaGoals = Math.max(1, metrics.totalSinkingQuotaMonth / 30);
  const goalDelayDays = Math.ceil(numericWhim / dailyQuotaGoals);

  const calculateMonthsRemaining = (dateStr) => {
    const target = new Date(dateStr);
    const now = new Date();
    const months =
      (target.getFullYear() - now.getFullYear()) * 12 +
      (target.getMonth() - now.getMonth());
    return Math.max(1, months);
  };

  const handleAddGoal = (e) => {
    e.preventDefault();
    const numericTarget = parseFloat(targetAmount);
    if (!title.trim() || Number.isNaN(numericTarget) || numericTarget <= 0)
      return;

    onAddGoal({
      title: title.trim(),
      target_amount: numericTarget,
      saved_amount: 0,
      target_date: targetDate,
      priority: 'ALTA',
    });

    setTitle('');
    setTargetAmount('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Simulador Interactivo Safe-to-Buy */}
      <section className="hero-sts-card">
        <div className="sts-eyebrow">Simulador de Impacto & Caprichos</div>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginTop: 4 }}>
          ¿Es seguro comprarlo hoy? (Safe-to-Buy)
        </h3>
        <p
          style={{
            fontSize: '0.76rem',
            color: 'var(--text-secondary)',
            marginTop: 4,
            marginBottom: 12,
          }}
        >
          Ingresa el monto de una compra no planificada para medir cuántos días
          deberás ajustarte el cinturón.
        </p>

        <input
          type="number"
          step="10"
          min="0"
          value={whimAmount}
          onChange={(e) => setWhimAmount(e.target.value)}
          placeholder="Monto del capricho (S/)"
          className="tabular-nums"
          style={{ fontWeight: 800 }}
        />

        <div className="metrics-split">
          <div>
            <div className="metric-mini-label">Días de Cinturón Ajustado</div>
            <div
              className="metric-mini-value tabular-nums"
              style={{ color: beltTighteningDays > 5 ? 'var(--crimson)' : 'var(--amber)' }}
            >
              {beltTighteningDays} días sin gasto libre
            </div>
          </div>
          <div>
            <div className="metric-mini-label">Retraso en Sinking Funds</div>
            <div
              className="metric-mini-value tabular-nums"
              style={{ color: 'var(--cyan)' }}
            >
              +{goalDelayDays} días de demora
            </div>
          </div>
        </div>

        <p
          style={{
            fontSize: '0.76rem',
            color: 'var(--text-secondary)',
            marginTop: 12,
          }}
        >
          Si lo amortizas en 15 días, tu nuevo Safe-to-Spend diario bajará de{' '}
          <strong className="tabular-nums">S/ {dailySafeBase.toFixed(2)}</strong> a{' '}
          <strong className="tabular-nums" style={{ color: 'var(--amber)' }}>
            S/ {reducedDailyFor15Days.toFixed(2)}
          </strong>
          .
        </p>
      </section>

      {/* Lista de Metas & Sinking Funds */}
      <section className="surface-card">
        <div className="section-header">
          <span className="section-title">🎯 Sinking Funds Activos</span>
          <span className="micro-badge badge-paid">
            Cuota Total: S/ {metrics.totalSinkingQuotaMonth.toFixed(0)}/mes
          </span>
        </div>

        <div className="item-list">
          {sinkingFunds.map((fund) => {
            const pct = Math.min(
              100,
              (Number(fund.saved_amount) / Number(fund.target_amount)) * 100
            );
            const monthsLeft = calculateMonthsRemaining(fund.target_date);
            const remainingAmount = Math.max(
              0,
              Number(fund.target_amount) - Number(fund.saved_amount)
            );
            const monthlyQuota = remainingAmount / monthsLeft;

            return (
              <div
                key={fund.id}
                className="item-row"
                style={{ flexDirection: 'column', alignItems: 'stretch' }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <div className="item-title">{fund.title}</div>
                    <div className="item-meta">
                      Meta: {fund.target_date} ({monthsLeft} meses restantes)
                    </div>
                  </div>
                  <span className="micro-badge badge-soon">
                    {pct.toFixed(1)}%
                  </span>
                </div>

                <div className="progress-track">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${pct}%`,
                      transform: 'scaleX(1)',
                    }}
                  />
                </div>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: 4,
                  }}
                >
                  <div className="item-meta tabular-nums">
                    Ahorrado:{' '}
                    <strong style={{ color: 'var(--text-primary)' }}>
                      S/ {Number(fund.saved_amount).toFixed(0)}
                    </strong>{' '}
                    / S/ {Number(fund.target_amount).toFixed(0)} · Cuota:{' '}
                    <strong style={{ color: 'var(--emerald)' }}>
                      S/ {monthlyQuota.toFixed(2)}/mes
                    </strong>
                  </div>

                  <button
                    type="button"
                    className="btn-secondary"
                    style={{ padding: '5px 10px', fontSize: '0.72rem' }}
                    onClick={() => onContributeGoal(fund.id, 100)}
                  >
                    + S/ 100
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Crear Nuevo Sinking Fund */}
      <section className="surface-card">
        <div className="section-header">
          <span className="section-title">➕ Crear Meta (Sinking Fund)</span>
        </div>
        <form
          onSubmit={handleAddGoal}
          style={{ display: 'flex', flexDirection: 'column', gap: 10 }}
        >
          <input
            type="text"
            placeholder="Meta (Ej. Laptop, Fondo Emergencia, Viaje)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <input
              type="number"
              step="10"
              placeholder="Objetivo (S/)"
              value={targetAmount}
              onChange={(e) => setTargetAmount(e.target.value)}
              required
            />
            <input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn-primary">
            Programar Sinking Fund
          </button>
        </form>
      </section>
    </div>
  );
}
