'use client';
import { Fragment, useId } from 'react';
import { createComponentImplementation } from '@a2ui/react';
import { Catalog } from '@a2ui/web_core';
import { catalogId, catalogInstructions, ColumnApi, TextApi, ChartApi, TableApi, FormulaApi, NumberInputApi, functions } from './catalogDefinition';
import styles from '../components/Widget.module.css';

const numberFormat = new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 });
function amount(value: unknown, unit: string = '$') {
  if (typeof value !== 'number' || !Number.isFinite(value)) return '—';
  const sign = value < 0 ? '−' : '';
  const numeric = numberFormat.format(Math.abs(value));
  return sign + (unit === '$' ? '$' + numeric : numeric + (unit === '%' ? '%' : ''));
}

const Column = createComponentImplementation(ColumnApi, ({ props, buildChild }) => (
  <div className={styles.column}>
    {props.children.map((child, index) => (
      <Fragment key={typeof child === 'string' ? child : child.id + index}>
        {typeof child === 'string' ? buildChild(child) : buildChild(child.id, child.basePath)}
      </Fragment>
    ))}
  </div>
));
const Text = createComponentImplementation(TextApi, ({ props }) => {
  if (props.variant === 'heading') return <h2 className={styles.heading}>{props.text}</h2>;
  return <p className={props.variant === 'caption' ? styles.caption : styles.text}>{props.text}</p>;
});

const colorNames = ['royal','cash','equipment','loan','neutral'];
const Chart = createComponentImplementation(ChartApi, ({ props }) => {
  const groups = props.groups;
  const valid = (n: unknown) => typeof n === 'number' && Number.isFinite(n) ? n : 0;
  const groupTotals = groups.map(g => g.segments.reduce((total, segment) => total + valid(segment.value), 0));
  const upper = Math.max(1, props.max ?? 0, ...groups.map(g => g.segments.reduce((s, seg) => s + Math.max(0, valid(seg.value)), 0)));
  const lower = Math.min(0, props.min ?? 0, ...groups.map(g => g.segments.reduce((s, seg) => s + Math.min(0, valid(seg.value)), 0)));
  const zero = upper / (upper - lower) * 100;
  const height = (n: number) => Math.abs(n) / (upper - lower) * 100;
  return <figure className={styles.panel}>
    <figcaption className={styles.kicker}>{props.title}</figcaption>
    <div className={styles.plotRow}>
      <div className={styles.axis} aria-hidden="true">
        <span>{amount(upper, props.unit)}</span>
        {lower < 0 && <span className={styles.zeroMark} style={{top: `${zero}%`}}>0</span>}
        <span>{amount(lower, props.unit)}</span>
      </div>
      <div className={styles.plot} role="img" aria-label={`${props.title}. ${groups.map((g, i) => `${g.label}: ${amount(groupTotals[i], props.unit)} (${g.segments.map(s => `${s.label}: ${amount(s.value, props.unit)}`).join(', ')})`).join('; ')}.`}>
        <div className={styles.baseline} style={{top:`${zero}%`}}/>
        {groups.map((group, i) => {
          let positive = 0, negative = 0;
          return <div className={styles.barColumn} key={i}>
            <div className={styles.total} style={{top: `${zero - height(group.segments.reduce((n, s) => n + Math.max(0, valid(s.value)), 0))}%`}}>{amount(groupTotals[i], props.unit)}</div>
            {group.segments.map((segment, j) => {
              const n = valid(segment.value);
              const top = n >= 0 ? zero - height(positive + n) : zero + height(negative);
              if (n >= 0) positive += n; else negative += Math.abs(n);
              const color = segment.tone ?? colorNames[j % colorNames.length];
              return <div key={j} data-tone={color} title={`${segment.label}: ${amount(segment.value, props.unit)}`} className={styles.block} style={{height: `${height(n)}%`, top:`${top}%`}}>
                {height(n) >= 23 && <span className={styles.blockName}>{segment.label}</span>}
              </div>;
            })}
          </div>;
        })}
      </div>
    </div>
    <div className={styles.chartLedger}>
      {groups.map((g, i) => <div className={styles.ledgerGroup} key={i}>
        <strong>{g.label}</strong>
        {g.segments.map((seg, j) => <div className={styles.legendRow} key={j}><span className={styles.swatch} data-tone={seg.tone ?? colorNames[j % colorNames.length]}/><span>{seg.label}</span><b>{amount(seg.value, props.unit)}</b></div>)}
      </div>)}
    </div>
  </figure>;
});
const Table = createComponentImplementation(TableApi, ({ props }) => (
  <div className={styles.panel}>
    <table className={styles.table}>
      <caption className={styles.kicker}>{props.title}</caption>
      <tbody>{props.rows.map((row, i) => <tr key={i} className={row.emphasis ? styles.emphasis : undefined}><th scope="row">{row.label}</th><td>{amount(row.value, props.unit)}</td></tr>)}</tbody>
    </table>
  </div>
));
const Formula = createComponentImplementation(FormulaApi, ({props}) => (
  <section className={`${styles.formula} ${styles.panel}`}>
    <p className={styles.kicker}>{props.label}</p>
    <p className={styles.expression}>{props.expression}</p>
    <output className={styles.result}>{amount(props.result, props.unit)}</output>
  </section>
));
const NumberInput = createComponentImplementation(NumberInputApi, ({props, accessibilityRef}) => {
  const id = useId();
  const min = props.min;
  const max = Math.max(min, props.max);
  const step = props.step ?? 1;
  const value = typeof props.value === 'number' && Number.isFinite(props.value) ? props.value : min;
  const update = (v: number) => {
    if (Number.isFinite(v) && v >= min && v <= max) props.setValue?.(v);
  };
  return <section className={`${styles.control} ${styles.panel}`}>
    <div className={styles.controlHeading}>
      <label htmlFor={`${id}-range`}>{props.label}</label>
      <span className={styles.numericField}>
        {props.unit === '$' && <span aria-hidden="true">$</span>}
        <input aria-label={`${props.label} — exact value`} type="number" min={min} max={max} step={step} value={value} onChange={e => update(e.currentTarget.valueAsNumber)}/>
        {props.unit === '%' && <span aria-hidden="true">%</span>}
      </span>
    </div>
    <input ref={accessibilityRef} id={`${id}-range`} aria-valuetext={amount(value, props.unit)} type="range" min={min} max={max} step={step} value={value} onChange={e => update(e.currentTarget.valueAsNumber)}/>
    <div className={styles.controlBounds}><span>{amount(min, props.unit)}</span><span>{amount(max, props.unit)}</span></div>
  </section>;
});

export const catalog = new Catalog(catalogId, '1.0', [Column, Text, Chart, Table, Formula, NumberInput], functions, {instructions: catalogInstructions});
