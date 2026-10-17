# 💰 FlowCapital PWA

> **Progressive Web App Mobile-First de Flujo de Caja Adaptativo, Safe-to-Spend Diario, Gastos Fijos con Alertas de 72 Horas & Sinking Funds con Simulador Safe-to-Buy.**

Diseñado con los estándares de diseño e ingeniería ergonómica de **Emil Kowalski** (`100dvh`, retroalimentación háptica `:active { transform: scale(0.96) }`, safe areas de iPhone y entradas de 16px para evitar auto-zoom en iOS Safari).

---

## 🚀 Características Principales

1. **⚡ Safe-to-Spend para Hoy (Gasto Seguro Adaptativo):**
   - Métrica hero central recalibrada en tiempo real tras cada gasto.
   - Semáforo de salud del ciclo: Verde (Bajo control), Ámbar (Alerta de aceleración), Rojo (Riesgo de sobregiro).
   - Botón de Registro Rápido en 3 toques (Monto -> Categoría -> Método de Pago).
   - Alerta dinámica de fricción: cuánto impacta gastar S/ 30 de más en los días restantes.

2. **📅 Flujo de Ingresos & Cascada de Prioridades:**
   - Mapeo de ingresos regulares (sueldo) e ingresos variables / honorarios por fecha.
   - Cascada inteligente: Primero retiene fijos del ciclo y cuotas de Sinking Funds antes de liberar saldo variable.

3. **📌 Gastos Fijos & Vigilancia Preventiva:**
   - Control de compromisos obligatorios con micro-badges: `[PAGADO]`, `[VENCE EN X DÍAS]`, `[VENCE HOY]`.
   - Sistema de alertas a 72 horas (T-3) y el día de vencimiento vía Service Worker.

4. **🎯 Metas & Sinking Funds:**
   - Ahorros programados con cálculo automático de cuota mensual según fecha límite.
   - Simulador **Safe-to-Buy**: Evalúa caprichos no planificados calculando días de cinturón ajustado y retraso sobre metas.

---

## 🛠️ Stack Tecnológico

- **Framework:** Next.js 16 (App Router)
- **Estilos:** 100% Vanilla CSS Modular (Dark Cockpit Theme `#0A0E1A`)
- **Persistencia:** Dual Neon PostgreSQL Serverless + LocalStorage Sync
- **PWA:** Service Worker y Web Manifest standalone

---

## 🧪 Pruebas Automatizadas

```bash
npm test
```
- Cobertura completa de algoritmo Safe-to-Spend, Sinking Funds y matriz de gastos fijos.
