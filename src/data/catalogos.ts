// Catálogos hardcodeados — editá este archivo para actualizar opciones sin tocar la lógica de UI.

export interface Suboption {
  id: string;
  title: string;
  speech?: string;            // undefined → navega a la pantalla de selección de modo
  goToModeSelector?: boolean;
  needsAmountInput?: boolean; // muestra pantalla para escribir monto libre
  needsPhoneNumber?: boolean; // muestra pantalla para ingresar número de línea
}

// ─── Marcas de celulares ──────────────────────────────────────────────────────
// Compartido entre "Comprar un celular" y "Cambiar de equipo".
// El speech difiere según el contexto (ver los dos arrays abajo).

const MARCAS_BASE = ['Samsung', 'Motorola', 'Apple', 'Xiaomi', 'Honor', 'TCL'] as const;

export const MARCAS_PARA_COMPRA: Suboption[] = MARCAS_BASE.map(marca => ({
  id: marca.toLowerCase(),
  title: marca,
  speech: `Quiero comprar un celular ${marca}. ¿Qué modelos tienen disponibles?`,
}));

export const MARCAS_PARA_CAMBIO: Suboption[] = MARCAS_BASE.map(marca => ({
  id: marca.toLowerCase(),
  title: marca,
  speech: `Quiero cambiar mi equipo por uno ${marca}. ¿Qué modelos tienen disponibles?`,
  needsPhoneNumber: true,
}));

// ─── Ver planes ───────────────────────────────────────────────────────────────

export const SUBOPCIONES_PLANES: Suboption[] = [
  { id: 'prepago',      title: 'Prepago',                  speech: 'Quiero información sobre los planes prepagos' },
  { id: 'abono',        title: 'Plan con abono',           speech: 'Quiero información sobre los planes con abono',           needsPhoneNumber: true },
  { id: 'equipo',       title: 'Plan con equipo incluido', speech: 'Quiero un plan que incluya un celular nuevo',             needsPhoneNumber: true },
  { id: 'portabilidad', title: 'Portabilidad',             speech: 'Quiero traer mi número de otra compañía a Claro',        needsPhoneNumber: true },
  { id: 'datos',        title: 'Planes de datos',          speech: 'Quiero información sobre los planes de datos para internet', needsPhoneNumber: true },
];

// ─── Recargar saldo ───────────────────────────────────────────────────────────

export const SUBOPCIONES_RECARGA: Suboption[] = [
  { id: '1000',  title: '$1.000',     speech: 'Quiero recargar 1000 pesos de saldo', needsPhoneNumber: true },
  { id: '2000',  title: '$2.000',     speech: 'Quiero recargar 2000 pesos de saldo', needsPhoneNumber: true },
  { id: '3000',  title: '$3.000',     speech: 'Quiero recargar 3000 pesos de saldo', needsPhoneNumber: true },
  { id: '5000',  title: '$5.000',     speech: 'Quiero recargar 5000 pesos de saldo', needsPhoneNumber: true },
  { id: 'otro',  title: 'Otro monto', needsAmountInput: true, needsPhoneNumber: true },
];

// ─── Pagar mi factura ─────────────────────────────────────────────────────────

export const SUBOPCIONES_FACTURA: Suboption[] = [
  { id: 'cuanto', title: '¿Cuánto debo?',    speech: 'Quiero saber cuánto tengo que pagar de mi factura', needsPhoneNumber: true },
  { id: 'pagar',  title: 'Pagar ahora',      speech: 'Quiero pagar mi factura ahora',                    needsPhoneNumber: true },
  { id: 'medios', title: 'Medios de pago',   speech: 'Quiero saber con qué medios puedo pagar mi factura', needsPhoneNumber: true },
  { id: 'copia',  title: 'Quiero la factura', speech: 'Necesito que me den una copia de mi factura',     needsPhoneNumber: true },
];

// ─── Problema de facturación ──────────────────────────────────────────────────

export const SUBOPCIONES_PROBLEMA_FACTURA: Suboption[] = [
  { id: 'cobro-extra',    title: 'Me cobraron de más',      speech: 'Creo que me cobraron de más en mi factura',           needsPhoneNumber: true },
  { id: 'cargo-raro',     title: 'No entiendo un cargo',    speech: 'Hay un cargo en mi factura que no entiendo',          needsPhoneNumber: true },
  { id: 'reclamo',        title: 'Quiero hacer un reclamo', speech: 'Quiero hacer un reclamo sobre mi factura',            needsPhoneNumber: true },
  { id: 'baja-servicio',  title: 'Dar de baja un servicio', speech: 'Quiero dar de baja un servicio que estoy pagando',   needsPhoneNumber: true },
];

// ─── Soporte técnico ──────────────────────────────────────────────────────────

export const SUBOPCIONES_SOPORTE: Suboption[] = [
  { id: 'no-signal',         title: 'Sin señal',            speech: 'No tengo señal en mi celular',                    needsPhoneNumber: true },
  { id: 'internet-slow',     title: 'Internet lento',       speech: 'Mi internet está muy lento',                      needsPhoneNumber: true },
  { id: 'phone-not-working', title: 'Teléfono no funciona', speech: 'Mi teléfono no está funcionando correctamente',   needsPhoneNumber: true },
  { id: 'otro',              title: 'Otro',                 goToModeSelector: true },
];
