'use client';

import { useState } from 'react';

const CATEGORIES = [
  'Alimentación',
  'Transporte',
  'Salud & Fit',
  'Ocio / Salidas',
  'Compras',
  'Imprevistos',
];

const PAYMENT_METHODS = ['Yape / Plin', 'Débito', 'Tarjeta Crédito', 'Efectivo'];

export default function QuickExpenseModal({ isOpen, onClose, onSave }) {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [paymentMethod, setPaymentMethod] = useState(PAYMENT_METHODS[0]);
  const [description, setDescription] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const numericAmount = parseFloat(amount);
    if (Number.isNaN(numericAmount) || numericAmount <= 0) return;

    onSave({
      amount: numericAmount,
      category,
      payment_method: paymentMethod,
      description: description.trim() || `${category} (${paymentMethod})`,
    });

    setAmount('');
    setDescription('');
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="section-header" style={{ marginBottom: 0 }}>
          <div>
            <div className="sts-eyebrow">Registro Rápido en 3 Toques</div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginTop: 2 }}>
              Nuevo Gasto Variable
            </h3>
          </div>
          <button className="btn-secondary" onClick={onClose} type="button">
            Cerrar
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label className="metric-mini-label">1. Toque — Monto (S/)</label>
            <input
              type="number"
              step="0.10"
              min="0.10"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              autoFocus
              required
              className="tabular-nums"
              style={{
                fontSize: '1.5rem !important',
                fontWeight: 800,
                marginTop: 6,
              }}
            />
          </div>

          <div>
            <label className="metric-mini-label">2. Toque — Categoría</label>
            <div className="chip-grid" style={{ marginTop: 6 }}>
              {CATEGORIES.map((cat) => (
                <button
                  type="button"
                  key={cat}
                  className={`chip-btn ${category === cat ? 'active' : ''}`}
                  onClick={() => setCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="metric-mini-label">3. Toque — Método de Pago</label>
            <div
              className="chip-grid"
              style={{ gridTemplateColumns: 'repeat(2, 1fr)', marginTop: 6 }}
            >
              {PAYMENT_METHODS.map((method) => (
                <button
                  type="button"
                  key={method}
                  className={`chip-btn ${
                    paymentMethod === method ? 'active' : ''
                  }`}
                  onClick={() => setPaymentMethod(method)}
                >
                  {method}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="metric-mini-label">Detalle opcional</label>
            <input
              type="text"
              placeholder="Ej. Almuerzo ejecutivo, café, taxi..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{ marginTop: 6 }}
            />
          </div>

          <button type="submit" className="btn-primary">
            ⚡ Confirmar e Impactar Safe-to-Spend
          </button>
        </form>
      </div>
    </div>
  );
}
