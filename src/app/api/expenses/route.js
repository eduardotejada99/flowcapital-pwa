import { NextResponse } from 'next/server';
import { getNeonClient, ensureNeonSchema } from '@/lib/db';

export async function GET() {
  const sql = getNeonClient();
  if (!sql) {
    return NextResponse.json({ mode: 'localStorage', items: [] });
  }

  try {
    await ensureNeonSchema(sql);
    const rows = await sql(
      'SELECT * FROM variable_expenses ORDER BY expense_date DESC, id DESC LIMIT 100'
    );
    return NextResponse.json({ mode: 'neon', items: rows });
  } catch {
    return NextResponse.json({ mode: 'localStorage', items: [] });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const amount = Number(body.amount);
    const category = String(body.category || 'General').trim();
    const description = String(body.description || category).trim();
    const payment_method = String(body.payment_method || 'Yape / Plin').trim();
    const expense_date =
      String(body.expense_date || '').slice(0, 10) ||
      new Date().toISOString().slice(0, 10);

    if (Number.isNaN(amount) || amount <= 0) {
      return NextResponse.json(
        { error: 'El monto debe ser mayor a S/ 0.00' },
        { status: 400 }
      );
    }

    const sql = getNeonClient();
    if (!sql) {
      return NextResponse.json({
        mode: 'localStorage',
        item: {
          id: Date.now(),
          amount,
          category,
          description,
          payment_method,
          expense_date,
        },
      });
    }

    await ensureNeonSchema(sql);
    const rows = await sql(
      'INSERT INTO variable_expenses (amount, category, description, payment_method, expense_date) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [amount, category, description, payment_method, expense_date]
    );

    return NextResponse.json({
      mode: 'neon',
      item: { ...rows[0], amount: Number(rows[0].amount) },
    });
  } catch {
    return NextResponse.json(
      { error: 'No se pudo registrar el gasto diario.' },
      { status: 500 }
    );
  }
}
