'use client';

import { useState } from 'react';

export default function TabFixed({
  fixedExpenses,
  onToggleFixedStatus,
  onAddFixedExpense,
  onTriggerNotificationTest,
}) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Suscripciones');
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
      return { text: 'PAGADO', className: 'badge-paid' };
    }
    const diff = item.due_day - todayDay;
    if (diff === 0) {
      return { text: 'VENCE HOY', className: 'badge-today' };
    }
    if (diff > 0 && diff <= 3) {
      return { text: `EN ${diff} DÍAS`, className: 'badge-soon' };
    }
    if (diff < 0) {
      return { text: `VENCIDO (${Math.abs(diff)}D)`, className: 'badge-today' };
    }
    return { text: `DÍA ${item.due_day}`, className: 'badge-soon' };
  };

  const getServiceLogo = (name) => {
    const l = name.toLowerCase();
    if (l.includes('netflix')) return '🎬';
    if (l.includes('spotify')) return '🎵';
    if (l.includes('claude') || l.includes('chatgpt') || l.includes('openai')) return '🤖';
    if (l.includes('figma')) return '🎨';
    if (l.includes('luz') || l.includes('electricidad')) return '💡';
    if (l.includes('agua')) return '💧';
    if (l.includes('internet') || l.includes('fibra')) return '🌐';
    if (l.includes('alquiler') || l.includes('depa')) return '🏠';
    if (l.includes('gym') || l.includes('gimnasio')) return '💪';
    return '💳';
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
      {/* 1. Reminder App Header Card (Screenshot 9) */}
      <section className="reminder-header-card">
        <div>
          <span className="reminder-spend-eyebrow">Compromisos Fijos del Mes</span>
          <div className="reminder-spend-val tabular-nums">
            S/ {totalCommitted.toFixed(2)}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
            Pagado: <strong style={{ color: 'var(--emerald)' }}>S/ {totalPaid.toFixed(2)}</strong> · Pendiente: <strong style={{ color: 'var(--gold)' }}>S/ {totalPending.toFixed(2)}</strong>
          </div>
        </div>

        <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
          <div className="reminder-active-pill">
            {fixedExpenses.length} activas
          </div>
          <button
            type="button"
            onClick={onTriggerNotificationTest}
            style={{
              fontSize: '11px',
              color: 'var(--sapphire-light)',
              background: 'rgba(59, 130, 246, 0.1)',
              padding: '4px 8px',
              borderRadius: '6px',
              border: '1px solid rgba(59, 130, 246, 0.25)'
            }}
          >
            🔔 Probar Alerta
          </button>
        </div>
      </section>

      {/* 2. Subscriptions & Fixed Expenses Feed (Screenshot 9) */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '13px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.4px', color: 'var(--text-secondary)' }}>
            Próximos Vencimientos
          </span>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            Calendario mensual
          </span>
        </div>

        {fixedExpenses.map((item) => {
          const badge = getBadgeData(item);
          return (
            <div key={item.id} className="reminder-item">
              <div className="reminder-item-left">
                <div className="reminder-logo">
                  {getServiceLogo(item.title)}
                </div>
                <div>
                  <div className="reminder-title">{item.title}</div>
                  <div className="reminder-meta">
                    <span className={`badge-countdown ${badge.className}`}>
                      {badge.text}
                    </span>
                    <span>Día {item.due_day}</span>
                  </div>
                </div>
              </div>

              <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                <div className="tabular-nums" style={{ fontSize: '15px', fontWeight: 800 }}>
                  S/ {Number(item.amount).toFixed(2)}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => onToggleFixedStatus(item)}
                    style={{
                      background: item.status === 'PAGADO' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.08)',
                      border: '1px solid var(--border-subtle)',
                      color: item.status === 'PAGADO' ? '#34D399' : 'var(--text-secondary)',
                      padding: '3px 8px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: 700
                    }}
                  >
                    {item.status === 'PAGADO' ? '✓ Pagado' : 'Marcar Pago'}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </section>

      {/* 3. Formulario Rápido para Añadir Nuevo Gasto Fijo / Suscripción */}
      <section style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '18px', padding: '18px' }}>
        <h4 style={{ fontSize: '14px', fontWeight: 800, marginBottom: '12px' }}>
          + Agregar Nuevo Compromiso o Suscripción
        </h4>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div>
            <input
              type="text"
              placeholder="Nombre del servicio (ej. Netflix, Alquiler, Luz)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <input
              type="number"
              step="0.01"
              placeholder="Monto S/"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
            <input
              type="number"
              min="1"
              max="31"
              placeholder="Día vencimiento (1-31)"
              value={dueDay}
              onChange={(e) => setDueDay(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="Suscripciones">Suscripciones (Streaming/SaaS)</option>
              <option value="Vivienda">Vivienda (Alquiler/Mantenimiento)</option>
              <option value="Servicios">Servicios Básicos (Luz/Agua/Net)</option>
              <option value="Educación">Educación & Cursos</option>
              <option value="Salud">Salud & Seguros</option>
              <option value="Finanzas">Préstamos & Tarjetas</option>
            </select>

            <button
              type="submit"
              className="btn-primary"
              style={{ padding: '10px', fontSize: '13px' }}
            >
              Guardar Suscripción
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
