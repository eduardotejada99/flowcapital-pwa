'use client';

import { useState } from 'react';

export default function TabCashflow({ incomes, metrics, onAddIncome }) {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [incomeType, setIncomeType] = useState('VARIABLE');
  const [expectedDate, setExpectedDate] = useState(
    new Date().toISOString().slice(0, 10)
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    const numeric = parseFloat(amount);
    if (!title.trim() || Number.isNaN(numeric) || numeric <= 0) return;

    onAddIncome({
      title: title.trim(),
      amount: numeric,
      income_type: incomeType,
      expected_date: expectedDate,
      received: true,
    });

    setTitle('');
    setAmount('');
  };

  const {
    totalIncomeMonth,
    totalFixedMonth,
    totalSinkingQuotaMonth,
    variablePoolTotal,
  } = metrics;

  const fixedCoveragePct = Math.min(
    100,
    totalIncomeMonth > 0 ? (totalFixedMonth / totalIncomeMonth) * 100 : 0
  );
  const goalsCoveragePct = Math.min(
    100,
    totalIncomeMonth > 0
      ? (totalSinkingQuotaMonth / totalIncomeMonth) * 100
      : 0
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* 1. Tarjeta Neobanco: Cascada de Asignación Prioritaria */}
      <section className="reminder-header-card" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 16 }}>
        <div>
          <span className="reminder-spend-eyebrow">Motor de Cascada Financiera</span>
          <h3 style={{ fontSize: '18px', fontWeight: 800, marginTop: 4, color: 'var(--text-primary)' }}>
            Protección de Compromisos & Metas
          </h3>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: 4, lineHeight: 1.4 }}>
            Todo ingreso cubre primero los gastos fijos innegociables y la cuota de Sinking Funds antes de liberar capital variable.
          </p>
        </div>

        {/* 4 Pasos Visuales en Tarjetas */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {/* Paso 1: Ingresos */}
          <div className="bank-tx-item" style={{ padding: '14px' }}>
            <div className="bank-tx-left">
              <div className="bank-tx-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34D399' }}>
                💰
              </div>
              <div>
                <div className="bank-tx-title">1. Ingresos Proyectados del Ciclo</div>
                <div className="bank-tx-meta">Fijos + Honorarios variables del mes</div>
              </div>
            </div>
            <div className="bank-tx-amount tabular-nums" style={{ color: 'var(--emerald)', fontSize: '16px' }}>
              + S/ {totalIncomeMonth.toFixed(2)}
            </div>
          </div>

          {/* Paso 2: Retención Fijos */}
          <div className="bank-tx-item" style={{ padding: '14px' }}>
            <div className="bank-tx-left">
              <div className="bank-tx-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#FBBF24' }}>
                📌
              </div>
              <div>
                <div className="bank-tx-title">2. Retención Gastos Fijos ({fixedCoveragePct.toFixed(0)}%)</div>
                <div className="bank-tx-meta">Compromisos innegociables obligatorios</div>
              </div>
            </div>
            <div className="bank-tx-amount tabular-nums" style={{ color: 'var(--gold)', fontSize: '16px' }}>
              - S/ {totalFixedMonth.toFixed(2)}
            </div>
          </div>

          {/* Paso 3: Sinking Funds */}
          <div className="bank-tx-item" style={{ padding: '14px' }}>
            <div className="bank-tx-left">
              <div className="bank-tx-icon" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#60A5FA' }}>
                🎯
              </div>
              <div>
                <div className="bank-tx-title">3. Cuota Sinking Funds ({goalsCoveragePct.toFixed(0)}%)</div>
                <div className="bank-tx-meta">Ahorro programado para metas</div>
              </div>
            </div>
            <div className="bank-tx-amount tabular-nums" style={{ color: 'var(--sapphire-light)', fontSize: '16px' }}>
              - S/ {totalSinkingQuotaMonth.toFixed(2)}
            </div>
          </div>

          {/* Paso 4: Capital Variable Liberado */}
          <div className="bank-tx-item" style={{ padding: '14px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.35)' }}>
            <div className="bank-tx-left">
              <div className="bank-tx-icon" style={{ background: 'var(--emerald)', color: '#060A14' }}>
                ⚡
              </div>
              <div>
                <div className="bank-tx-title" style={{ color: 'var(--emerald)' }}>4. Capital Variable Liberado</div>
                <div className="bank-tx-meta">Base del Safe-to-Spend diario</div>
              </div>
            </div>
            <div className="bank-tx-amount tabular-nums" style={{ color: 'var(--emerald)', fontSize: '18px', fontWeight: 900 }}>
              S/ {variablePoolTotal.toFixed(2)}
            </div>
          </div>
        </div>
      </section>

      {/* 2. Calendario Visual de Entradas de Capital (Screenshot 8 / Vaulta Style) */}
      <section style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '18px', padding: '18px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Historial del Ciclo</span>
            <h4 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)' }}>
              📅 Calendario de Entradas de Capital
            </h4>
          </div>
          <span className="reminder-active-pill">
            {incomes.length} ingresos
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {incomes.map((inc, index) => {
            const runningTotal = incomes
              .slice(0, index + 1)
              .reduce((acc, item) => acc + Number(item.amount), 0);

            return (
              <div key={inc.id} className="bank-tx-item">
                <div className="bank-tx-left">
                  <div className="bank-tx-icon">
                    {inc.income_type === 'FIJO' ? '🏦' : '💼'}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span className="bank-tx-title">{inc.title}</span>
                      <span
                        className={`badge-countdown ${
                          inc.income_type === 'FIJO' ? 'badge-paid' : 'badge-soon'
                        }`}
                      >
                        {inc.income_type}
                      </span>
                    </div>
                    <div className="bank-tx-meta">
                      Fecha: {inc.expected_date} · Acumulado: S/ {runningTotal.toFixed(2)}
                    </div>
                  </div>
                </div>
                <div className="bank-tx-amount tabular-nums" style={{ color: 'var(--emerald)', fontSize: '15px' }}>
                  + S/ {Number(inc.amount).toFixed(2)}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. Formulario Neobanco para Inyectar Nuevo Ingreso */}
      <section style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '18px', padding: '18px' }}>
        <h4 style={{ fontSize: '14px', fontWeight: 800, marginBottom: '14px', color: 'var(--text-primary)' }}>
          ➕ Inyectar Nuevo Ingreso u Honorario
        </h4>
        <form
          onSubmit={handleSubmit}
          style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
        >
          <div>
            <input
              type="text"
              placeholder="Concepto (Ej. Quincena, Consultoría, Bono)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <input
              type="number"
              step="0.01"
              placeholder="Monto (S/)"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
            <select
              value={incomeType}
              onChange={(e) => setIncomeType(e.target.value)}
            >
              <option value="VARIABLE">Ingreso Variable</option>
              <option value="FIJO">Ingreso Fijo</option>
            </select>
          </div>

          <input
            type="date"
            value={expectedDate}
            onChange={(e) => setExpectedDate(e.target.value)}
            required
          />

          <button type="submit" className="btn-primary" style={{ marginTop: 4 }}>
            Inyectar al Flujo de Caja
          </button>
        </form>
      </section>
    </div>
  );
}
