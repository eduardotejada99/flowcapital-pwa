import { NextResponse } from 'next/server';
import { getNeonClient, ensureNeonSchema } from '@/lib/db';

const ALLOWED_PATCH_FIELDS = [
  'title',
  'category',
  'amount',
  'due_day',
  'status',
  'auto_reminder',
];

export async function GET() {
  const sql = getNeonClient();
  if (!sql) {
    return NextResponse.json({ mode: 'localStorage', items: [] });
  }

  try {
    await ensureNeonSchema(sql);
    const rows = await sql(
      'SELECT * FROM fixed_expenses ORDER BY due_day ASC'
    );
    return NextResponse.json({ mode: 'neon', items: rows });
  } catch {
    return NextResponse.json({ mode: 'localStorage', items: [] });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const title = String(body.title || '').trim();
    const category = String(body.category || 'Servicios').trim();
    const amount = Number(body.amount);
    const due_day = Number(body.due_day);
    const auto_reminder = Boolean(body.auto_reminder ?? true);

    if (
      !title ||
      Number.isNaN(amount) ||
      amount <= 0 ||
      Number.isNaN(due_day) ||
      due_day < 1 ||
      due_day > 31
    ) {
      return NextResponse.json(
        { error: 'Parámetros de gasto fijo inválidos.' },
        { status: 400 }
      );
    }

    const sql = getNeonClient();
    if (!sql) {
      return NextResponse.json({
        mode: 'localStorage',
        item: {
          id: Date.now(),
          title,
          category,
          amount,
          due_day,
          status: 'PENDIENTE',
          auto_reminder,
        },
      });
    }

    await ensureNeonSchema(sql);
    const rows = await sql(
      'INSERT INTO fixed_expenses (title, category, amount, due_day, status, auto_reminder) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [title, category, amount, due_day, 'PENDIENTE', auto_reminder]
    );

    return NextResponse.json({
      mode: 'neon',
      item: { ...rows[0], amount: Number(rows[0].amount) },
    });
  } catch {
    return NextResponse.json(
      { error: 'Error al registrar gasto fijo.' },
      { status: 500 }
    );
  }
}

export async function PATCH(request) {
  try {
    const body = await request.json();
    const id = Number(body.id);
    if (!id) {
      return NextResponse.json({ error: 'ID requerido.' }, { status: 400 });
    }

    const updates = {};
    for (const key of Object.keys(body)) {
      if (ALLOWED_PATCH_FIELDS.includes(key)) {
        updates[key] = body[key];
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'Ningún campo permitido para actualizar.' },
        { status: 400 }
      );
    }

    const sql = getNeonClient();
    if (!sql) {
      return NextResponse.json({ mode: 'localStorage', id, updates });
    }

    await ensureNeonSchema(sql);
    const setClauses = [];
    const values = [];
    let idx = 1;

    for (const [col, val] of Object.entries(updates)) {
      setClauses.push(`${col} = $${idx}`);
      values.push(val);
      idx++;
    }
    values.push(id);

    const query = `UPDATE fixed_expenses SET ${setClauses.join(
      ', '
    )}, updated_at = NOW() WHERE id = $${idx} RETURNING *`;

    const rows = await sql(query, values);
    return NextResponse.json({ mode: 'neon', item: rows[0] });
  } catch {
    return NextResponse.json(
      { error: 'Error actualizando estado del compromiso.' },
      { status: 500 }
    );
  }
}
