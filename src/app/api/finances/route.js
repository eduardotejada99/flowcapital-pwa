import { NextResponse } from 'next/server';
import {
  getNeonClient,
  ensureNeonSchema,
  getInitialSeedData,
} from '@/lib/db';

export async function GET() {
  const sql = getNeonClient();
  if (!sql) {
    return NextResponse.json({
      mode: 'localStorage',
      payload: getInitialSeedData(),
    });
  }

  try {
    await ensureNeonSchema(sql);

    const [incomes, fixed_expenses, variable_expenses, sinking_funds] =
      await Promise.all([
        sql('SELECT * FROM incomes ORDER BY expected_date ASC'),
        sql('SELECT * FROM fixed_expenses ORDER BY due_day ASC'),
        sql('SELECT * FROM variable_expenses ORDER BY expense_date DESC, id DESC'),
        sql('SELECT * FROM sinking_funds ORDER BY target_date ASC'),
      ]);

    return NextResponse.json({
      mode: 'neon',
      payload: {
        incomes: incomes.map((i) => ({ ...i, amount: Number(i.amount) })),
        fixed_expenses: fixed_expenses.map((f) => ({
          ...f,
          amount: Number(f.amount),
        })),
        variable_expenses: variable_expenses.map((v) => ({
          ...v,
          amount: Number(v.amount),
        })),
        sinking_funds: sinking_funds.map((s) => ({
          ...s,
          target_amount: Number(s.target_amount),
          saved_amount: Number(s.saved_amount),
        })),
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        mode: 'localStorage',
        error: 'Fallback activado por desconexión de base de datos.',
      },
      { status: 200 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { entity } = body;
    const sql = getNeonClient();

    if (entity === 'income') {
      const title = String(body.title || '').trim();
      const amount = Number(body.amount);
      const income_type =
        body.income_type === 'FIJO' ? 'FIJO' : 'VARIABLE';
      const expected_date = String(body.expected_date || '').slice(0, 10);
      const received = Boolean(body.received);

      if (!title || Number.isNaN(amount) || amount <= 0 || !expected_date) {
        return NextResponse.json(
          { error: 'Datos de ingreso inválidos.' },
          { status: 400 }
        );
      }

      if (!sql) {
        return NextResponse.json({
          mode: 'localStorage',
          item: {
            id: Date.now(),
            title,
            amount,
            income_type,
            expected_date,
            received,
          },
        });
      }

      await ensureNeonSchema(sql);
      const rows = await sql(
        'INSERT INTO incomes (title, amount, income_type, expected_date, received) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [title, amount, income_type, expected_date, received]
      );
      return NextResponse.json({ mode: 'neon', item: rows[0] });
    }

    if (entity === 'goal') {
      const title = String(body.title || '').trim();
      const target_amount = Number(body.target_amount);
      const saved_amount = Number(body.saved_amount || 0);
      const target_date = String(body.target_date || '').slice(0, 10);
      const priority = String(body.priority || 'ALTA').slice(0, 20);

      if (!title || Number.isNaN(target_amount) || target_amount <= 0 || !target_date) {
        return NextResponse.json(
          { error: 'Datos de Sinking Fund inválidos.' },
          { status: 400 }
        );
      }

      if (!sql) {
        return NextResponse.json({
          mode: 'localStorage',
          item: {
            id: Date.now(),
            title,
            target_amount,
            saved_amount,
            target_date,
            priority,
          },
        });
      }

      await ensureNeonSchema(sql);
      const rows = await sql(
        'INSERT INTO sinking_funds (title, target_amount, saved_amount, target_date, priority) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [title, target_amount, saved_amount, target_date, priority]
      );
      return NextResponse.json({ mode: 'neon', item: rows[0] });
    }

    if (entity === 'goal_contribute') {
      const id = Number(body.id);
      const contribution = Number(body.contribution);
      if (!id || Number.isNaN(contribution) || contribution <= 0) {
        return NextResponse.json(
          { error: 'Aporte inválido.' },
          { status: 400 }
        );
      }

      if (!sql) {
        return NextResponse.json({ mode: 'localStorage', id, contribution });
      }

      await ensureNeonSchema(sql);
      const rows = await sql(
        'UPDATE sinking_funds SET saved_amount = saved_amount + $1 WHERE id = $2 RETURNING *',
        [contribution, id]
      );
      return NextResponse.json({ mode: 'neon', item: rows[0] });
    }

    return NextResponse.json({ error: 'Entidad no soportada.' }, { status: 400 });
  } catch {
    return NextResponse.json(
      { error: 'Error procesando solicitud financiera.' },
      { status: 500 }
    );
  }
}
