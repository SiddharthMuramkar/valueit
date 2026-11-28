/** Throwaway ValueIt catalog for testing live composition with official A2UI 1.0. */
import { Catalog, createFunctionImplementation } from '@a2ui/web_core';
import { CommonSchemas } from '@a2ui/web_core/v1_0';
import { z } from 'zod';

export const catalogId = 'https://value-it.xyz/catalogs/prototype-finance-v1.json';
const D = CommonSchemas;
const unit = z.enum(['$', '%', 'number']).describe('Formatting only: dollars, percentages, or plain numbers.');
const tone = z.enum(['royal', 'cash', 'loan', 'equipment', 'neutral']).describe('Choose consistent tones for the same economic quantities across the Widget.');

export const ColumnApi = {
  name: 'Column',
  allowedParents: ['Surface', 'Column'],
  allowedChildren: ['Column', 'Text', 'Chart', 'Table', 'Formula', 'NumberInput'],
  schema: z.object({ children: D.ChildList.describe('Ordered child ids. Use as the Widget root.') }).strict().describe('Stacks Building blocks vertically.'),
};
export const TextApi = {
  name: 'Text',
  allowedParents: ['Column'],
  schema: z.object({ text: D.DynamicString, variant: z.enum(['heading', 'body', 'caption']).optional() }).strict().describe('Brief teaching heading, explanatory sentence or small caption.'),
};
export const ChartApi = {
  name: 'Chart',
  allowedParents: ['Column'],
  schema: z.object({
    title: D.DynamicString,
    groups: z.array(z.object({
      label: D.DynamicString,
      segments: z.array(z.object({ label: D.DynamicString, value: D.DynamicNumber, tone: tone.optional() }).strict()).min(1).max(5),
    }).strict()).min(1).max(5),
    unit: unit.optional(),
    min: z.number().max(0).optional().describe('Fixed minimum chart scale, normally zero unless values may become negative.'),
    max: z.number().positive().optional().describe('Fixed maximum chart scale covering all inputs; use to make comparisons honest.'),
  }).strict().describe('An accessible chart of vertical stacks, one per group with one or more segments. Each segment shows its label and actual numeric value. Negative values extend below the zero line.'),
};
export const TableApi = {
  name: 'Table',
  allowedParents: ['Column'],
  schema: z.object({
    title: D.DynamicString,
    rows: z.array(z.object({ label: D.DynamicString, value: D.DynamicNumber, emphasis: z.boolean().optional() }).strict()).min(1).max(8),
    unit: unit.optional(),
  }).strict().describe('Ledger-style table of labels and numeric values. Use emphasis for totals.'),
};
export const FormulaApi = {
  name: 'Formula',
  allowedParents: ['Column'],
  schema: z.object({
    label: D.DynamicString,
    expression: D.DynamicString.describe('Plain text teaching formula, using human-readable names, ×, ÷, −, and exponents. No HTML or LaTeX.'),
    result: D.DynamicNumber.describe('Use a trusted function or data binding, never a stale hard-coded derived result.'),
    unit: unit.optional(),
  }).strict().describe('Shows a formula in words with a large reactive numeric result.'),
};
export const NumberInputApi = {
  name: 'NumberInput',
  allowedParents: ['Column'],
  schema: z.object({
    label: D.DynamicString,
    value: D.DynamicNumber.describe('MUST use a data binding {"@path":"/inputName"}, not a literal or function, so the Student can change it.'),
    min: z.number(),
    max: z.number(),
    step: z.number().positive().optional(),
    unit: unit.optional(),
  }).strict().describe('Editable numeric field with a linked slider, updating the data model locally.'),
};

export const componentApis = [ColumnApi, TextApi, ChartApi, TableApi, FormulaApi, NumberInputApi];

const binarySchema = z.object({ a: D.DynamicNumber, b: D.DynamicNumber }).strict();
const pvSchema = z.object({
  futureValue: D.DynamicNumber,
  ratePercent: D.DynamicNumber.describe('Annual discount rate as percentage points, e.g. 10 means 10%.'),
  years: D.DynamicNumber,
}).strict();

// All inputs arrive resolved by the official A2UI expression evaluator. No generated maths runs.
function finite(value: unknown): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) throw new Error('Finance calculation requires a finite number.');
  return value;
}
export const sum = (a: number, b: number) => finite(a + b);
export const subtract = (a: number, b: number) => finite(a - b);
export const presentValue = (fv: number, ratePercent: number, years: number) => {
  if (ratePercent <= -100 || years < 0) throw new Error('Discount rate must exceed −100%; years cannot be negative.');
  return finite(fv / Math.pow(1 + ratePercent / 100, years));
};
export const functions = [
  createFunctionImplementation({ name: 'sum', returnType: 'number', allowedCallers: 'rendererOnly', schema: binarySchema, description: 'Adds a and b. Nest to add multiple quantities, e.g. total assets.' }, args => sum(finite(args.a), finite(args.b))),
  createFunctionImplementation({ name: 'subtract', returnType: 'number', allowedCallers: 'rendererOnly', schema: binarySchema, description: 'Returns a minus b. Use for profit or assets less liabilities.' }, args => subtract(finite(args.a), finite(args.b))),
  createFunctionImplementation({ name: 'presentValue', returnType: 'number', allowedCallers: 'rendererOnly', schema: pvSchema, description: 'Discounts a future amount using futureValue / (1 + ratePercent / 100)^years. Computes locally.' }, args => presentValue(finite(args.futureValue), finite(args.ratePercent), finite(args.years))),
];

export const catalogInstructions = `Build the Widget from this catalog. All layout choices and bindings are your decisions, but never write new maths or hard-code a derived numeric result. Use @path for changing inputs and @call with args for live calculations. Example value: {"@call":"sum","args":{"a":{"@path":"/cash"},"b":{"@path":"/cart"}}}. Use one Column as root, a single brief heading, a visual comparison (Chart), and an immediately visible live NumberInput. Use a Formula or Table where it teaches a distinct idea; avoid repeating the exact same information everywhere. Use actual numbers from the Widget brief. Keep words compact; most of the teaching happens in the surrounding Chatbot. The only design tokens are the named tones. Chart scales must cover the full allowed range of inputs, with a zero line; maintain the same tone for the same quantity in each segment. All calculations and inputs must be bound; do not make derived values part of the data model. Set sendDataModel to true in createSurface. Use protocol 1.0 and catalog id ${catalogId}.`;
const schemaCatalog = new Catalog(catalogId, '1.0', componentApis, functions, { instructions: catalogInstructions });
export const catalogDefinition = schemaCatalog.toJson();
