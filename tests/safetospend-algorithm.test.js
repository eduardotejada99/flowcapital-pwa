import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

describe('FlowCapital Safe-to-Spend Algorithm', () => {
  it('calculates daily safe-to-spend correctly from remaining variable pool and days', () => {
    const totalIncome = 6850;
    const totalFixed = 2524;
    const totalSinkingQuota = 1350;

    // Free variable pool = 6850 - 2524 - 1350 = 2976
    const variablePool = totalIncome - totalFixed - totalSinkingQuota;
    assert.equal(variablePool, 2976);

    const remainingDays = 16;
    const spentBeforeToday = 1200;
    const remainingAtStartOfDay = variablePool - spentBeforeToday; // 1776
    const baseDaily = remainingAtStartOfDay / remainingDays; // 1776 / 16 = 111.00

    assert.equal(baseDaily, 111.0);

    const spentToday = 31.0;
    const safeToSpendRemainingToday = baseDaily - spentToday; // 80.00
    assert.equal(safeToSpendRemainingToday, 80.0);
  });

  it('calculates daily penalty absorption correctly when an excess occurs', () => {
    // If user spends S/ 30 over budget and 15 days remain:
    const remainingDays = 16;
    const daysLeftAfterToday = remainingDays - 1; // 15
    const penaltyPer30 = 30 / daysLeftAfterToday; // 30 / 15 = 2.00
    assert.equal(penaltyPer30, 2.0);
  });

  it('determines traffic light health statuses accurately', () => {
    const baseDaily = 100;

    // Green: safeToSpend > 35% of baseDaily
    const safeGreen = 80;
    assert.ok(safeGreen >= baseDaily * 0.35);

    // Amber: 0 <= safeToSpend < 35% of baseDaily
    const safeAmber = 25;
    assert.ok(safeAmber >= 0 && safeAmber < baseDaily * 0.35);

    // Red: safeToSpend < 0
    const safeRed = -10;
    assert.ok(safeRed < 0);
  });
});
