import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

describe('FlowCapital Fixed Expenses Matrix & T-3 Alerts', () => {
  it('correctly filters expenses due within 72 hours (T-3 days)', () => {
    const currentDay = 15;
    const fixedExpenses = [
      { id: 1, title: 'Alquiler', due_day: 5, status: 'PAGADO' },
      { id: 2, title: 'Internet', due_day: 16, status: 'PENDIENTE' }, // diff 1 -> inside T-3
      { id: 3, title: 'Tarjeta', due_day: 18, status: 'PENDIENTE' },  // diff 3 -> inside T-3
      { id: 4, title: 'Luz', due_day: 25, status: 'PENDIENTE' },      // diff 10 -> outside T-3
    ];

    const upcoming = fixedExpenses
      .filter((i) => i.status === 'PENDIENTE')
      .map((i) => ({ ...i, daysDiff: i.due_day - currentDay }))
      .filter((i) => i.daysDiff >= 0 && i.daysDiff <= 3);

    assert.equal(upcoming.length, 2);
    assert.equal(upcoming[0].title, 'Internet');
    assert.equal(upcoming[1].title, 'Tarjeta');
  });

  it('determines badge label and style correctly', () => {
    const todayDay = 15;

    const getBadge = (dueDay, status) => {
      if (status === 'PAGADO') return '[PAGADO]';
      const diff = dueDay - todayDay;
      if (diff === 0) return '[VENCE HOY]';
      if (diff > 0 && diff <= 3) return `[VENCE EN ${diff} DÍAS]`;
      if (diff < 0) return `[VENCIDO]`;
      return '[PENDIENTE]';
    };

    assert.equal(getBadge(10, 'PAGADO'), '[PAGADO]');
    assert.equal(getBadge(15, 'PENDIENTE'), '[VENCE HOY]');
    assert.equal(getBadge(17, 'PENDIENTE'), '[VENCE EN 2 DÍAS]');
    assert.equal(getBadge(25, 'PENDIENTE'), '[PENDIENTE]');
    assert.equal(getBadge(12, 'PENDIENTE'), '[VENCIDO]');
  });
});
