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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Tarjeta de Cascada de Asignación Inteligente */}
      <section className="surface-card">
        <div className="sts-eyebrow">Cascada de Asignación Prioritaria</div>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginTop: 4 }}>
          Protección de Compromisos & Metas
        </h3>
        <p
          style={{
            fontSize: '0.76rem',
            color: 'var(--text-secondary)',
            marginTop: 4,
          }}
        >
          Todo nuevo ingreso cubre primero los gastos fijos y la cuota mensual de
          Sinking Funds antes de liberar saldo variable.
        </p>

        <div className="item-list" style={{ marginTop: 14 }}>
          <div className="item-row">
            <div>
              <div className="item-title">1. Ingresos Proyectados del Ciclo</div>
              <div className="item-meta">Fijos + Honorarios variables</div>
            </div>
            <div
              className="tabular-nums"
              style={{ fontWeight: 800, color: 'var(--emerald)' }}
            >
              S/ {totalIncomeMonth.toFixed(2)}
            </div>
          </div>

          <div className="item-row">
            <div>
              <div className="item-title">2. Retención Gastos Fijos ({fixedCoveragePct.toFixed(0)}%)</div>
              <div className="item-meta">Compromisos innegociables del mes</div>
            </div>
            <div className="tabular-nums" style={{ fontWeight: 700, color: 'var(--amber)' }}>
              - S/ {totalFixedMonth.toFixed(2)}
            </div>
          </div>

          <div className="item-row">
            <div>
              <div className="item-title">3. Cuota Sinking Funds ({goalsCoveragePct.toFixed(0)}%)</div>
              <div className="item-meta">Ahorro programado obligatorio</div>
            </div>
            <div className="tabular-nums" style={{ fontWeight: 700, color: 'var(--cyan)' }}>
              - S/ {totalSinkingQuotaMonth.toFixed(2)}
            </div>
          </div>

          <div
            className="item-row"
            style={{ borderColor: 'var(--border-focus)', background: 'var(--emerald-soft)' }}
          >
            <div>
              <div className="item-title">4. Capital Variable Liberado</div>
              <div className="item-meta">Base para Safe-to-Spend diario</div>
            </div>
            <div className="tabular-nums" style={{ fontWeight: 800, color: 'var(--emerald)' }}>
              S/ {variablePoolTotal.toFixed(2)}
            </div>
          </div>
        </div>
      </section>

      {/* Calendario Visual de Entradas de Capital */}
      <section className="surface-card">
        <div className="section-header">
          <span className="section-title">📅 Calendario de Entradas de Capital</span>
        </div>

        <div className="item-list">
          {incomes.map((inc, index) => {
            const runningTotal = incomes
              .slice(0, index + 1)
              .reduce((acc, item) => acc + Number(item.amount), 0);

            return (
              <div key={inc.id} className="item-row">
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span className="item-title">{inc.title}</span>
                    <span
                      className={`micro-badge ${
                        inc.income_type === 'FIJO' ? 'badge-paid' : 'badge-soon'
                      }`}
                    >
                      {inc.income_type}
                    </span>
                  </div>
                  <div className="item-meta">
                    Fecha: {inc.expected_date} · Acumulado ciclo: S/{' '}
                    {runningTotal.toFixed(2)}
                  </div>
                </div>
                <div
                  className="tabular-nums"
                  style={{ fontWeight: 700, color: 'var(--emerald)' }}
                >
                  + S/ {Number(inc.amount).toFixed(2)}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Formulario para Inyectar Nuevo Ingreso por Fecha */}
      <section className="surface-card">
        <div className="section-header">
          <span className="section-title">➕ Registrar Ingreso o Honorario</span>
        </div>
        <form
          onSubmit={handleSubmit}
          style={{ display: 'flex', flexDirection: 'column', gap: 10 }}
        >
          <input
            type="text"
            placeholder="Concepto (Ej. Quincena, Bono, Proyecto Web)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
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
          <button type="submit" className="btn-primary">
            Inyectar al Flujo de Caja
          </button>
        </form>
      </section>
    </div>
  );
}
