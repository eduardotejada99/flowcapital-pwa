'use client';

import { useState } from 'react';

export default function TabFixed({
  fixedExpenses,
  onToggleFixedStatus,
  onAddFixedExpense,
  onTriggerNotificationTest,
}) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Servicios');
  const [amount, setAmount] = useState('');
  const [dueDay, setDueDay] = useState('15');

  const todayDay = new Date().getDate();

  const totalCommitted = fixedExpenses.reduce(
    (sum, item) => sum + Number(item.amount),
    0
  );
  const totalPaid = fixedExpenses
    .filter((item) => item.status === 'PAGADO')
    .reduce((sum, item) => sum + Number(item.amount), 0);
  const totalPending = Math.max(0, totalCommitted - totalPaid);

  const getBadgeData = (item) => {
    if (item.status === 'PAGADO') {
      return { text: '[PAGADO]', className: 'badge-paid' };
    }
    const diff = item.due_day - todayDay;
    if (diff === 0) {
      return { text: '[VENCE HOY]', className: 'badge-urgent' };
    }
    if (diff > 0 && diff <= 3) {
      return { text: `[VENCE EN ${diff} DÍAS]`, className: 'badge-soon' };
    }
    if (diff < 0) {
      return { text: `[VENCIDO HACE ${Math.abs(diff)}D]`, className: 'badge-urgent' };
    }
    return { text: '[PENDIENTE]', className: 'badge-pending' };
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const numeric = parseFloat(amount);
    const day = parseInt(dueDay, 10);
    if (!title.trim() || Number.isNaN(numeric) || numeric <= 0) return;

    onAddFixedExpense({
      title: title.trim(),
      category,
      amount: numeric,
      due_day: Math.min(31, Math.max(1, day || 1)),
      auto_reminder: true,
    });

    setTitle('');
    setAmount('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Resumen Total Comprometido vs Pagado */}
      <section className="surface-card">
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <div className="sts-eyebrow">Compromisos Innegociables</div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginTop: 2 }}>
              Control de Gastos Fijos
            </h3>
          </div>
          <button
            type="button"
            className="btn-secondary"
            onClick={onTriggerNotificationTest}
          >
            🔔 Activar Alertas 72h
          </button>
        </div>

        <div className="metrics-split">
          <div>
            <div className="metric-mini-label">Total Comprometido Mes</div>
            <div className="metric-mini-value tabular-nums">
              S/ {totalCommitted.toFixed(2)}
            </div>
          </div>
          <div>
            <div className="metric-mini-label">Total Ya Pagado</div>
            <div
              className="metric-mini-value tabular-nums"
              style={{ color: 'var(--emerald)' }}
            >
              S/ {totalPaid.toFixed(2)}{' '}
              <span style={{ fontSize: '0.72rem', color: 'var(--amber)' }}>
                (Falta S/ {totalPending.toFixed(0)})
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Lista Interactiva con Micro-Badges */}
      <section className="surface-card">
        <div className="section-header">
          <span className="section-title">📌 Calendario de Pagos Fijos</span>
          <span className="metric-mini-label">Toca para alternar estado</span>
        </div>

        <div className="item-list">
          {fixedExpenses.map((item) => {
            const badge = getBadgeData(item);
            return (
              <div
                key={item.id}
                className="item-row tactile-card"
                onClick={() => onToggleFixedStatus(item)}
                style={{ cursor: 'pointer' }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                    <span className="item-title">{item.title}</span>
                    <span className={`micro-badge ${badge.className}`}>
                      {badge.text}
                    </span>
                  </div>
                  <div className="item-meta">
                    {item.category} · Día de pago: {item.due_day} de cada mes
                  </div>
                </div>
                <div
                  className="tabular-nums"
                  style={{
                    fontWeight: 700,
                    color:
                      item.status === 'PAGADO'
                        ? 'var(--emerald)'
                        : 'var(--text-primary)',
                  }}
                >
                  S/ {Number(item.amount).toFixed(2)}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Formulario Nuevo Gasto Fijo */}
      <section className="surface-card">
        <div className="section-header">
          <span className="section-title">➕ Agregar Gasto Fijo Mensual</span>
        </div>
        <form
          onSubmit={handleSubmit}
          style={{ display: 'flex', flexDirection: 'column', gap: 10 }}
        >
          <input
            type="text"
            placeholder="Nombre (Ej. Seguro Vehicular, Streaming, Alquiler)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 0.8fr', gap: 8 }}>
            <input
              type="number"
              step="0.01"
              placeholder="S/ Monto"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="Vivienda">Vivienda</option>
              <option value="Servicios">Servicios</option>
              <option value="Financiero">Financiero</option>
              <option value="Salud">Salud</option>
              <option value="Suscripción">Suscripción</option>
            </select>
            <input
              type="number"
              min="1"
              max="31"
              placeholder="Día (1-31)"
              value={dueDay}
              onChange={(e) => setDueDay(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn-primary">
            Guardar Compromiso con Recordatorio
          </button>
        </form>
      </section>
    </div>
  );
}
