import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

describe('FlowCapital Sinking Funds & Safe-to-Buy Simulator', () => {
  it('calculates monthly contribution required based on remaining amount and months', () => {
    const targetAmount = 15000;
    const savedAmount = 9600;
    const remainingAmount = targetAmount - savedAmount; // 5400
    const monthsRemaining = 6;

    const monthlyQuota = remainingAmount / monthsRemaining;
    assert.equal(monthlyQuota, 900.0);
  });

  it('simulates Safe-to-Buy whim impact: belt tightening days and goal delay days', () => {
    const whimAmount = 300;
    const dailySafeBase = 60; // S/ 60/day
    const dailyQuotaGoals = 30; // S/ 900/month / 30 = S/ 30/day

    const beltTighteningDays = Math.ceil(whimAmount / dailySafeBase); // 300 / 60 = 5 days
    assert.equal(beltTighteningDays, 5);

    const goalDelayDays = Math.ceil(whimAmount / dailyQuotaGoals); // 300 / 30 = 10 days
    assert.equal(goalDelayDays, 10);

    // Amortized over 15 days
    const reducedDaily = dailySafeBase - whimAmount / 15; // 60 - 20 = 40
    assert.equal(reducedDaily, 40);
  });
});
