'use client';

import { useState, useEffect, useMemo } from 'react';
import { ClientPersistence, getInitialSeedData } from '@/lib/db';
import TabToday from '@/components/TabToday';
import TabCashflow from '@/components/TabCashflow';
import TabFixed from '@/components/TabFixed';
import TabGoals from '@/components/TabGoals';
import QuickExpenseModal from '@/components/QuickExpenseModal';

export default function FlowCapitalApp() {
  const [activeTab, setActiveTab] = useState('today');
  const [finState, setFinState] = useState(() => getInitialSeedData());
  const [syncSource, setSyncSource] = useState('localStorage');
  const [isQuickModalOpen, setIsQuickModalOpen] = useState(false);

  useEffect(() => {
    let mounted = true;
    ClientPersistence.fetchFullState().then((res) => {
      if (!mounted) return;
      const { source, ...rest } = res;
      setFinState(rest);
      setSyncSource(source || 'localStorage');
    });
    return () => {
      mounted = false;
    };
  }, []);

  const persistUpdate = (updater) => {
    setFinState((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      ClientPersistence.saveLocal(next);
      return next;
    });
  };

  // Motor Matemático Central de Flujo de Caja Adaptativo y Safe-to-Spend
  const metrics = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const currentDay = now.getDate();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const remainingDays = Math.max(1, daysInMonth - currentDay + 1);
    const todayIso = `${year}-${String(month + 1).padStart(2, '0')}-${String(
      currentDay
    ).padStart(2, '0')}`;

    const totalIncomeMonth = finState.incomes.reduce(
      (sum, item) => sum + Number(item.amount || 0),
      0
    );

    const totalFixedMonth = finState.fixed_expenses.reduce(
      (sum, item) => sum + Number(item.amount || 0),
      0
    );

    const totalSinkingQuotaMonth = finState.sinking_funds.reduce((sum, fund) => {
      const targetDate = new Date(fund.target_date);
      const monthsDiff = Math.max(
        1,
        (targetDate.getFullYear() - year) * 12 +
          (targetDate.getMonth() - month)
      );
      const remaining = Math.max(
        0,
        Number(fund.target_amount) - Number(fund.saved_amount)
      );
      return sum + remaining / monthsDiff;
    }, 0);

    const variablePoolTotal = Math.max(
      0,
      totalIncomeMonth - totalFixedMonth - totalSinkingQuotaMonth
    );

    const variableSpentMonth = finState.variable_expenses.reduce(
      (sum, exp) => sum + Number(exp.amount || 0),
      0
    );

    const spentToday = finState.variable_expenses
      .filter((exp) => exp.expense_date === todayIso)
      .reduce((sum, exp) => sum + Number(exp.amount || 0), 0);

    const spentBeforeToday = Math.max(0, variableSpentMonth - spentToday);
    const remainingPoolAtStartOfDay = Math.max(
      0,
      variablePoolTotal - spentBeforeToday
    );

    const baseDailySafeToSpend = remainingPoolAtStartOfDay / remainingDays;
    const safeToSpendToday = baseDailySafeToSpend - spentToday;

    const penaltyPer30Soles = 30 / Math.max(1, remainingDays - 1);

    let healthStatus = { code: 'VERDE', label: 'Bajo Control' };
    if (safeToSpendToday < 0 || variableSpentMonth > variablePoolTotal) {
      healthStatus = { code: 'ROJO', label: 'Riesgo de sobregiro' };
    } else if (safeToSpendToday < baseDailySafeToSpend * 0.35) {
      healthStatus = { code: 'ÁMBAR', label: 'Alerta de aceleración' };
    }

    return {
      totalIncomeMonth,
      totalFixedMonth,
      totalSinkingQuotaMonth,
      variablePoolTotal,
      variableSpentMonth,
      spentToday,
      remainingDays,
      baseDailySafeToSpend,
      safeToSpendToday,
      penaltyPer30Soles,
      healthStatus,
      todayIso,
      currentDay,
    };
  }, [finState]);

  const upcomingFixed = useMemo(() => {
    return finState.fixed_expenses
      .filter((item) => item.status === 'PENDIENTE')
      .map((item) => ({
        ...item,
        daysDiff: Number(item.due_day) - metrics.currentDay,
      }))
      .filter((item) => item.daysDiff >= 0 && item.daysDiff <= 3);
  }, [finState.fixed_expenses, metrics.currentDay]);

  const handleAddQuickExpense = async (payload) => {
    const newItem = {
      id: Date.now(),
      ...payload,
      expense_date: metrics.todayIso,
    };

    persistUpdate((prev) => ({
      ...prev,
      variable_expenses: [newItem, ...prev.variable_expenses],
    }));

    try {
      await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItem),
      });
    } catch {
      // Offline fallback
    }
  };

  const handleToggleFixedStatus = async (item) => {
    const nextStatus = item.status === 'PAGADO' ? 'PENDIENTE' : 'PAGADO';
    persistUpdate((prev) => ({
      ...prev,
      fixed_expenses: prev.fixed_expenses.map((f) =>
        f.id === item.id ? { ...f, status: nextStatus } : f
      ),
    }));

    try {
      await fetch('/api/fixed', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: item.id, status: nextStatus }),
      });
    } catch {
      // Offline fallback
    }
  };

  const handleAddFixedExpense = async (payload) => {
    const newItem = {
      id: Date.now(),
      status: 'PENDIENTE',
      ...payload,
    };

    persistUpdate((prev) => ({
      ...prev,
      fixed_expenses: [...prev.fixed_expenses, newItem].sort(
        (a, b) => a.due_day - b.due_day
      ),
    }));

    try {
      await fetch('/api/fixed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItem),
      });
    } catch {
      // Offline fallback
    }
  };

  const handleAddIncome = async (payload) => {
    const newItem = { id: Date.now(), ...payload };
    persistUpdate((prev) => ({
      ...prev,
      incomes: [...prev.incomes, newItem].sort((a, b) =>
        a.expected_date.localeCompare(b.expected_date)
      ),
    }));

    try {
      await fetch('/api/finances', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entity: 'income', ...payload }),
      });
    } catch {
      // Offline fallback
    }
  };

  const handleContributeGoal = async (id, contribution) => {
    persistUpdate((prev) => ({
      ...prev,
      sinking_funds: prev.sinking_funds.map((g) =>
        g.id === id
          ? { ...g, saved_amount: Number(g.saved_amount) + contribution }
          : g
      ),
    }));

    try {
      await fetch('/api/finances', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entity: 'goal_contribute',
          id,
          contribution,
        }),
      });
    } catch {
      // Offline fallback
    }
  };

  const handleAddGoal = async (payload) => {
    const newItem = { id: Date.now(), ...payload };
    persistUpdate((prev) => ({
      ...prev,
      sinking_funds: [...prev.sinking_funds, newItem],
    }));

    try {
      await fetch('/api/finances', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entity: 'goal', ...payload }),
      });
    } catch {
      // Offline fallback
    }
  };

  const handleTriggerNotification = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) return;
    let permission = Notification.permission;
    if (permission === 'default') {
      permission = await Notification.requestPermission();
    }
    if (permission === 'granted') {
      const count = upcomingFixed.length;
      const bodyText =
        count > 0
          ? `Tienes ${count} compromiso(s) por vencer en las próximas 72 horas.`
          : 'Recordatorios preventivos a 72h y día de pago activados.';

      if (navigator.serviceWorker?.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'TRIGGER_REMINDER',
          payload: {
            title: 'FlowCapital · Alerta Financiera',
            body: bodyText,
          },
        });
      } else {
        new Notification('FlowCapital · Alerta Financiera', { body: bodyText });
      }
    }
  };

  return (
    <div className="app-shell">
      {/* 1. Vaulta Neobank Top Header (Screenshots 8 & 10) */}
      <header className="vaulta-header">
        <div className="vaulta-user-row">
          <div className="vaulta-avatar">💎</div>
          <div>
            <div className="vaulta-greeting-sub">Banca & Cashflow</div>
            <div className="vaulta-greeting-name">Eduardo Tejada</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              fontSize: '11px',
              padding: '4px 10px',
              borderRadius: '999px',
              background: syncSource === 'neon' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.08)',
              color: syncSource === 'neon' ? '#34D399' : '#94A3B8',
              border: '1px solid var(--border-subtle)',
              fontWeight: 700
            }}
          >
            {syncSource === 'neon' ? '● Neon PG' : '○ Local'}
          </div>
        </div>
      </header>

      {/* Viewport Dinámico */}
      <main className="app-content">
        {activeTab === 'today' && (
          <TabToday
            metrics={metrics}
            upcomingFixed={upcomingFixed}
            recentExpenses={finState.variable_expenses}
            onOpenQuickExpense={() => setIsQuickModalOpen(true)}
            onToggleFixedStatus={handleToggleFixedStatus}
          />
        )}

        {activeTab === 'cashflow' && (
          <TabCashflow
            incomes={finState.incomes}
            metrics={metrics}
            onAddIncome={handleAddIncome}
          />
        )}

        {activeTab === 'fixed' && (
          <TabFixed
            fixedExpenses={finState.fixed_expenses}
            onToggleFixedStatus={handleToggleFixedStatus}
            onAddFixedExpense={handleAddFixedExpense}
            onTriggerNotificationTest={handleTriggerNotification}
          />
        )}

        {activeTab === 'goals' && (
          <TabGoals
            sinkingFunds={finState.sinking_funds}
            metrics={metrics}
            onContributeGoal={handleContributeGoal}
            onAddGoal={handleAddGoal}
          />
        )}
      </main>

      {/* Modal 3-Tap de Gasto Rápido */}
      <QuickExpenseModal
        isOpen={isQuickModalOpen}
        onClose={() => setIsQuickModalOpen(false)}
        onSave={handleAddQuickExpense}
      />

      {/* Neobanking Bottom Navigation Bar (Screenshots 8 & 10) */}
      <nav className="nav-bar" aria-label="Navegación Principal">
        <button
          type="button"
          className={`nav-tab-btn ${activeTab === 'today' ? 'active' : ''}`}
          onClick={() => setActiveTab('today')}
        >
          <span className="nav-tab-icon">💳</span>
          <span>Tarjeta & STS</span>
        </button>

        <button
          type="button"
          className={`nav-tab-btn ${activeTab === 'cashflow' ? 'active' : ''}`}
          onClick={() => setActiveTab('cashflow')}
        >
          <span className="nav-tab-icon">📈</span>
          <span>Cashflow</span>
        </button>

        <button
          type="button"
          className={`nav-tab-btn ${activeTab === 'fixed' ? 'active' : ''}`}
          onClick={() => setActiveTab('fixed')}
        >
          <span className="nav-tab-icon">🔔</span>
          <span>Suscripciones</span>
        </button>

        <button
          type="button"
          className={`nav-tab-btn ${activeTab === 'goals' ? 'active' : ''}`}
          onClick={() => setActiveTab('goals')}
        >
          <span className="nav-tab-icon">🎯</span>
          <span>Metas</span>
        </button>
      </nav>
    </div>
  );
}
