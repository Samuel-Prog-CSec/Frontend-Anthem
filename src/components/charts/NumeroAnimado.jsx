/**
 * NumeroAnimado - cuenta animada hasta el valor numerico.
 *
 * Acepta el valor YA formateado (string es-ES tipo "1.993.304", "49,42 EUR",
 * "6,3%", "22,8 ug/m3") o un number. Extrae el numero, anima desde el valor
 * anterior hasta el nuevo y lo reconstruye con su prefijo/sufijo, formateando
 * en es-ES con los mismos decimales detectados.
 *
 * Implementacion IMPERATIVA: la cuenta escribe textContent del span via ref
 * dentro del callback de requestAnimationFrame (no useState por frame), lo que
 * es robusto y no genera re-render por fotograma. useLayoutEffect arranca en el
 * valor de origen antes del paint para que no haya parpadeo del valor final.
 *
 * Si el valor NO es "numerico-ish" (p.ej. "AUTOV. M-30, +01100I") lo renderiza
 * tal cual. Respeta prefers-reduced-motion (muestra el valor final, sin cuenta).
 */

import { useLayoutEffect, useRef } from 'react';

/**
 * Parsea un valor mostrado a {num, dec, pre, suf} o null si no es numerico.
 * @param {string|number} value
 */
function parsearValor(value) {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? { num: value, dec: 0, pre: '', suf: '' } : null;
  }
  if (typeof value !== 'string') { return null; }
  const m = value.match(/^(\D*?)([+-]?[\d.,]*\d)(\D*)$/);
  if (!m) { return null; }
  const [, pre, raw, suf] = m;
  let dec = 0;
  let limpio;
  if (raw.includes(',')) {
    // es-ES: coma decimal, punto miles
    const [ent, frac = ''] = raw.split(',');
    dec = frac.length;
    limpio = `${ent.replace(/\./g, '')}.${frac}`;
  } else if (/^[+-]?\d{1,2}\.\d{1,2}$/.test(raw)) {
    // punto decimal con 1-2 cifras enteras y 1-2 decimales ("30.6", "0.87")
    dec = raw.split('.')[1].length;
    limpio = raw;
  } else {
    // puntos como separador de miles
    limpio = raw.replace(/\./g, '');
  }
  const num = Number(limpio);
  if (!Number.isFinite(num)) { return null; }
  return { num, dec, pre, suf };
}

/**
 * @param {Object} props
 * @param {string|number} props.value - Valor a mostrar (formateado o number)
 * @param {number} [props.duracion=850] - Duracion de la cuenta en ms
 * @param {string} [props.className]
 */
export function NumeroAnimado({ value, duracion = 850, className }) {
  const parsed = parsearValor(value);
  const ref = useRef(null);
  const prevRef = useRef(0);
  const hayNumero = parsed !== null;
  const num = parsed ? parsed.num : 0;
  const dec = parsed ? parsed.dec : 0;
  const pre = parsed ? parsed.pre : '';
  const suf = parsed ? parsed.suf : '';

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || !hayNumero) { return undefined; }
    const nf = new Intl.NumberFormat('es-ES', {
      minimumFractionDigits: dec,
      maximumFractionDigits: dec
    });
    const fmt = (x) => `${pre}${nf.format(x)}${suf}`;
    const reduce = typeof window !== 'undefined'
      && window.matchMedia
      && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      el.textContent = fmt(num);
      prevRef.current = num;
      return undefined;
    }
    const origen = prevRef.current;
    el.textContent = fmt(origen); // arranca en el valor previo (0 al montar)
    let raf = 0;
    let t0 = null;
    const tick = (t) => {
      if (t0 === null) { t0 = t; }
      const p = Math.min(1, (t - t0) / duracion);
      const eased = 1 - Math.pow(1 - p, 3); // ease-out cubico
      el.textContent = fmt(origen + (num - origen) * eased);
      if (p < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        prevRef.current = num;
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [num, dec, pre, suf, duracion, hayNumero]);

  if (!parsed) { return value; }

  // El contenido lo controla el effect imperativo (textContent), por eso el span
  // se renderiza VACIO: si React renderizara el numero, sobrescribiria la cuenta
  // en cada re-render del padre. useLayoutEffect lo rellena antes del paint (sin
  // parpadeo). aria-label expone el valor final estable para lectores de pantalla.
  const etiqueta = `${pre}${new Intl.NumberFormat('es-ES', {
    minimumFractionDigits: dec,
    maximumFractionDigits: dec
  }).format(num)}${suf}`;
  return <span ref={ref} className={className} aria-label={etiqueta} />;
}
