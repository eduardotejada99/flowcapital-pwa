import { neon } from '@neondatabase/serverless';

const STORAGE_KEY = 'flowcapital_hybrid_state_v1';

/**
 * Datos semilla realistas para el ciclo actual en Soles (S/)
 */
export function getInitialSeedData() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const todayStr = `${year}-${month}-${String(now.getDate()).padStart(2, '0')}`;
  const currentDay = now.getDate();

  const nearDue1 = Math.min(28, currentDay + 1);
  const nearDue2 = Math.min(28, currentDay + 2);

  return {
    incomes: [
      {
        id: 1,
        title: 'Sueldo Neto Principal',
        amount: 4800.0,
        income_type: 'FIJO',
        expected_date: `${year}-${month}-01`,
        received: true,
      },
      {
        id: 2,
        title: 'Consultoría / Honorarios TI',
        amount: 1400.0,
        income_type: 'VARIABLE',
        expected_date: `${year}-${month}-15`,
        received: currentDay >= 15,
      },
      {
        id: 3,
        title: 'Bono de Productividad Quincenal',
        amount: 650.0,
        income_type: 'VARIABLE',
        expected_date: `${year}-${month}-25`,
        received: false,
      },
    ],
    fixed_expenses: [
      {
        id: 101,
        title: 'Departamento & Mantenimiento',
        category: 'Vivienda',
        amount: 1350.0,
        due_day: 5,
        status: 'PAGADO',
        auto_reminder: true,
      },
      {
        id: 102,
        title: 'Internet Fibra Óptica + Plan Móvil',
        category: 'Servicios',
        amount: 169.0,
        due_day: nearDue1,
        status: 'PENDIENTE',
        auto_reminder: true,
      },
      {
        id: 103,
        title: 'Tarjeta de Crédito (Facturación Mes)',
        category: 'Financiero',
        amount: 680.0,
        due_day: nearDue2,
        status: 'PENDIENTE',
        auto_reminder: true,
      },
      {
        id: 104,
        title: 'Energía Eléctrica y Agua',
        category: 'Servicios',
        amount: 145.0,
        due_day: 20,
        status: 'PENDIENTE',
        auto_reminder: true,
      },
      {
        id: 105,
        title: 'Membresía Gym & Suplementación',
        category: 'Salud',
        amount: 180.0,
        due_day: 24,
        status: 'PENDIENTE',
        auto_reminder: false,
      },
    ],
    variable_expenses: [
      {
        id: 201,
        amount: 42.5,
        category: 'Alimentación',
        description: 'Compras proteínas y avena semanal',
        payment_method: 'Yape / Plin',
        expense_date: todayStr,
      },
      {
        id: 202,
        amount: 18.0,
        category: 'Transporte',
        description: 'Combustible y movilidad urbana',
        payment_method: 'Débito',
        expense_date: todayStr,
      },
      {
        id: 203,
        amount: 95.0,
        category: 'Alimentación',
        description: 'Supermercado insumos quincena',
        payment_method: 'Tarjeta Crédito',
        expense_date: `${year}-${month}-${String(Math.max(1, currentDay - 2)).padStart(2, '0')}`,
      },
    ],
    sinking_funds: [
      {
        id: 301,
        title: 'Fondo de Emergencia Líquido (6M)',
        target_amount: 15000.0,
        saved_amount: 9600.0,
        target_date: `${year + 1}-04-01`,
        priority: 'CRÍTICA',
      },
      {
        id: 302,
        title: 'Mantenimiento Preventivo & SOAT',
        target_amount: 2400.0,
        saved_amount: 1400.0,
        target_date: `${year}-12-15`,
        priority: 'ALTA',
      },
      {
        id: 303,
        title: 'Vacaciones & Equipamiento',
        target_amount: 4500.0,
        saved_amount: 1800.0,
        target_date: `${year + 1}-03-01`,
        priority: 'MEDIA',
      },
    ],
  };
}

let cachedNeon = null;

export function getNeonClient() {
  if (cachedNeon) return cachedNeon;
  const url = process.env.DATABASE_URL;
  if (!url || typeof url !== 'string' || url.trim() === '') {
    return null;
  }
  try {
    cachedNeon = neon(url);
    return cachedNeon;
  } catch {
    return null;
  }
}

let schemaInitialized = false;

export async function ensureNeonSchema(sql) {
  if (!sql || schemaInitialized) return;

  try {
    await sql(`
      CREATE TABLE IF NOT EXISTS incomes (
        id SERIAL PRIMARY KEY,
        title VARCHAR(120) NOT NULL,
        amount NUMERIC(12, 2) NOT NULL CHECK (amount >= 0),
        income_type VARCHAR(20) NOT NULL CHECK (income_type IN ('FIJO', 'VARIABLE')),
        expected_date DATE NOT NULL,
        received BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    await sql(`
      CREATE TABLE IF NOT EXISTS fixed_expenses (
        id SERIAL PRIMARY KEY,
        title VARCHAR(120) NOT NULL,
        category VARCHAR(50) NOT NULL,
        amount NUMERIC(12, 2) NOT NULL CHECK (amount >= 0),
        due_day SMALLINT NOT NULL CHECK (due_day BETWEEN 1 AND 31),
        status VARCHAR(20) NOT NULL DEFAULT 'PENDIENTE' CHECK (status IN ('PENDIENTE', 'PAGADO')),
        auto_reminder BOOLEAN NOT NULL DEFAULT TRUE,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    await sql(`
      CREATE TABLE IF NOT EXISTS variable_expenses (
        id SERIAL PRIMARY KEY,
        amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
        category VARCHAR(50) NOT NULL,
        description VARCHAR(160) NOT NULL,
        payment_method VARCHAR(40) NOT NULL,
        expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    await sql(`
      CREATE TABLE IF NOT EXISTS sinking_funds (
        id SERIAL PRIMARY KEY,
        title VARCHAR(120) NOT NULL,
        target_amount NUMERIC(12, 2) NOT NULL CHECK (target_amount > 0),
        saved_amount NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (saved_amount >= 0),
        target_date DATE NOT NULL,
        priority VARCHAR(20) NOT NULL DEFAULT 'ALTA',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    schemaInitialized = true;
  } catch (err) {
    console.warn('Neon schema ensure error:', err.message);
  }
}

export const ClientPersistence = {
  loadLocal() {
    if (typeof window === 'undefined') return getInitialSeedData();
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        const seed = getInitialSeedData();
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
        return seed;
      }
      return JSON.parse(raw);
    } catch {
      return getInitialSeedData();
    }
  },

  saveLocal(state) {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Quota limit fallback
    }
  },

  async fetchFullState() {
    const localState = this.loadLocal();
    try {
      const res = await fetch('/api/finances', { cache: 'no-store' });
      if (!res.ok) return { ...localState, source: 'localStorage' };
      const data = await res.json();
      if (data.mode === 'neon' && data.payload) {
        this.saveLocal(data.payload);
        return { ...data.payload, source: 'neon' };
      }
      return { ...localState, source: 'localStorage' };
    } catch {
      return { ...localState, source: 'localStorage' };
    }
  },
};
