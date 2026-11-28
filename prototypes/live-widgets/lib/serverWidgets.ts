/** Server-side, throwaway live Widget experiment; never deploy the unauthenticated prototype. */
import OpenAI from 'openai';
import {
  A2uiGenerator, Catalog, CatalogConfig, DirectJsonFormatFactory,
  type AgentToRendererMessage, type A2uiRequestProcessor,
  type RendererState,
} from '@a2ui/agent';
import { z } from 'zod';
import { catalogDefinition, catalogId } from './catalogDefinition';

export const modelName = 'gpt-6.2-sol';
export const reasoningEffort = 'xhigh' as const;
export class PrototypeError extends Error {
  constructor(message: string, public status = 400, public code = 'BAD_REQUEST') {
    super(message);
  }
}

const messageSchema = z.record(z.unknown());
export const historySchema = z.array(messageSchema).min(1).max(150);
export const dataModelSchema = z.record(z.unknown());
const genInput = z.object({ brief: z.string().min(15).max(12000) });
const changeInput = z.object({
  messages: historySchema, dataModel: dataModelSchema,
  request: z.string().min(1).max(2000),
});

let generator: A2uiGenerator | undefined;
function createProcessor() {
  if (!generator) {
    const catalog = Catalog.fromJson(catalogDefinition, '1.0', catalogId);
    generator = new A2uiGenerator([new CatalogConfig(catalog)], undefined, new DirectJsonFormatFactory());
  }
  return generator.createProcessor({ supportedCatalogIds: [catalogId] });
}

function verifiedHistory(processor: A2uiRequestProcessor, messages: unknown[]) {
  const state = processor.createState();
  state.apply(messages);
  state.checkTopology(state.surfaceIds);
  if (state.surfaceIds.length !== 1) throw new Error('Exactly one surface is required.');
  return state;
}

export function snapshotHistory(rawMessages: unknown, rawDataModel: unknown) {
  const messages = historySchema.parse(rawMessages);
  const dataModel = dataModelSchema.parse(rawDataModel);
  const processor = createProcessor();
  const state = verifiedHistory(processor, messages);
  const snapshot = {
    version: '1.0', updateDataModel: {
      surfaceId: state.surfaceIds[0], path: '/', value: dataModel,
    },
  };
  state.apply(snapshot);
  return { messages: [...messages, snapshot], state, processor };
}

function getModelClient() {
  if (!process.env.OPENAI_API_KEY) {
    throw new PrototypeError('The project OPENAI_API_KEY is not configured. No live call was made.', 503, 'OPENAI_KEY_MISSING');
  }
  // No browser key, no alternate model, and no automatic retry of paid API requests.
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY, maxRetries: 0, timeout: 900_000 });
}

function safeOpenAIError(error: unknown): never {
  if (error instanceof OpenAI.APIError) {
    const status = error.status;
    const reason = status === 401 ? 'The project API key was rejected.'
      : status === 403 ? 'The project does not have access to the requested model or operation.'
      : status === 404 ? 'The requested model was not found or is not accessible to this project.'
      : status === 429 ? 'The project hit an API rate or quota limit.'
      : status === 400 ? 'OpenAI rejected the request (including possible model or reasoning effort incompatibility).'
      : 'The Responses API request failed.';
    throw new PrototypeError(`${reason} ${status ? `(HTTP ${status})` : ''} No replacement model was used.`, 502, status ? `OPENAI_${status}` : 'OPENAI_CONNECTION');
  }
  if (error instanceof PrototypeError) throw error;
  throw new PrototypeError('The Responses API request could not be completed. No replacement model was used.', 502, 'OPENAI_CONNECTION');
}

const teachingPrompt = `You are the ValueIt Chatbot teaching finance, not offering investment advice. You will compose one small, beautiful interactive Widget from the installed catalog of trusted Building blocks. Follow the Widget brief's teaching goal and fixed figures exactly. A few well-chosen pieces teach better than a long dashboard. The Student should be able to change the relevant input and immediately see every affected amount. Bind every editable value with an absolute @path such as /loan; calculate every dependent value using the catalog's trusted @call functions. Do not invent derived values in the data model or write arithmetic code. Include units, keep text clear and concise, group related quantities, and use consistent tones. Use a balanced scale so changes are visually meaningful. The responses are parsed and checked before they are rendered. Return one short natural-language introduction alongside the actual messages. No invented figures, no source links, no Markdown code fence around the A2UI block.`;

const buildPrompt = `Create exactly one new A2UI v1.0 surface with id "widget", catalog id ${catalogId}, sendDataModel:true, an intentional complete component tree rooted at "root" and its initial data model. Include at least one properly bound NumberInput and at least one Chart. Use Table or Formula as needed by the Widget brief. Only createSurface, updateComponents and updateDataModel messages are needed. A valid example of a reactive numeric property (not a layout): {"@call":"subtract","args":{"a":{"@path":"/revenue"},"b":{"@path":"/expenses"}}}. A NumberInput must use {"@path":"/inputName"} to control a numeric data model property. Follow the brief, not the example's names or numbers. Use supported components as declared in the catalog; do not assume any other controls.`;

const updatePrompt = `The Student already has a generated Widget. You receive its actual current data model and original A2UI message history. Read the current model (the authoritative values the Student has set) before replying. To change an input, emit only updateDataModel messages with the existing surface id, the exact bound input's path and a numeric value within that input's declared range. Do not recreate its surface, change its design, change fixed values, or change derived values. If the Student only asks what a value is, reply in words; do not emit unnecessary messages. When asked to read then change an input, explicitly state the previous and new input values in your natural-language reply.`;

function checkNewWidget(messages: AgentToRendererMessage[]) {
  const objects = messages as Array<Record<string, any>>;
  const creates = objects.filter(m => m.createSurface);
  if (creates.length !== 1 || creates[0].createSurface.surfaceId !== 'widget' || creates[0].createSurface.catalogId !== catalogId || creates[0].createSurface.sendDataModel !== true) {
    throw new Error('Generate one surface with id widget, the exact catalog id, and sendDataModel:true.');
  }
  if (objects.some(m => !m.createSurface && !m.updateComponents && !m.updateDataModel)) throw new Error('Use only surface creation, component updates, and data-model updates.');
  const components = objects.flatMap(m => m.createSurface?.components ?? m.updateComponents?.components ?? []);
  const inputs = components.filter(c => c.component === 'NumberInput');
  if (!components.some(c => c.component === 'Chart') || !inputs.length) throw new Error('Include a Chart and at least one NumberInput.');
  for (const input of inputs) {
    if (typeof input.value?.['@path'] !== 'string' || !input.value['@path'].startsWith('/') || input.value['@path'] === '/' || !(input.min < input.max)) {
      throw new Error('Each NumberInput needs a writable absolute @path and sensible min/max.');
    }
  }
}

function inputsFromHistory(messages: unknown[]) {
  const byId = new Map<string, any>();
  for (const item of messages as Array<Record<string, any>>) {
    for (const component of item.createSurface?.components ?? item.updateComponents?.components ?? []) {
      byId.set(component.id, component);
    }
  }
  const byPath = new Map<string, { min: number; max: number }>();
  for (const component of byId.values()) {
    if (component.component === 'NumberInput' && typeof component.value?.['@path'] === 'string') {
      byPath.set(component.value['@path'], { min: component.min, max: component.max });
    }
  }
  return byPath;
}

async function askModel(processor: A2uiRequestProcessor, prompt: string, input: string,
  makeState: () => RendererState | undefined,
  postCheck: (messages: AgentToRendererMessage[], state: RendererState | undefined) => void,
) {
  const client = getModelClient();
  let repair = '';
  let priorReply = '';
  for (let attempt = 1; attempt <= 2; attempt++) {
    let response;
    try {
      response = await client.responses.create({
        model: modelName,
        reasoning: { effort: reasoningEffort },
        store: false,
        instructions: `${teachingPrompt}\n\n${prompt}\n\n${processor.promptSnippet}`,
        input: `${input}${repair}`,
        max_output_tokens: 24000,
      });
    } catch (error) { safeOpenAIError(error); }
    if (!response || response.status !== 'completed' || !response.output_text) {
      throw new PrototypeError('OpenAI did not return a completed textual response. No Widget was built.', 502, 'OPENAI_INCOMPLETE');
    }
    const state = makeState(); // New copy on repair, so invalid or unwanted changes never leak across attempts.
    priorReply = response.output_text;
    try {
      const parts = processor.parseResponse(priorReply, { state });
      const messages = parts.flatMap(part => part.type === 'a2ui' ? part.a2ui : []);
      const reply = parts.flatMap(part => part.type === 'text' ? [part.text.trim()] : []).filter(Boolean).join('\n\n');
      postCheck(messages, state);
      return { messages, reply, model: response.model, reasoningEffort, validationAttempts: attempt };
    } catch (error) {
      const issue = (error instanceof Error ? error.message : 'A2UI validation failed.').slice(0, 1200);
      if (attempt === 2) {
        // Do not return partially generated Widgets.
        throw new PrototypeError(`The live model responded but the Widget failed validation twice: ${issue}`, 422, 'WIDGET_VALIDATION_FAILED');
      }
      repair = `\n\nYour previous reply was rejected. Repair it once, preserving the original brief and fixed figures. Validation problem: ${issue}\nPrevious reply (for repair):\n${priorReply.slice(0, 16000)}`;
    }
  }
  throw new PrototypeError('No validated Widget was returned.', 502);
}

export async function generateWidget(body: unknown) {
  const { brief } = genInput.parse(body);
  const processor = createProcessor();
  return askModel(processor, buildPrompt, `WIDGET BRIEF:\n${brief}`, () => undefined, checkNewWidget);
}

export async function changeWidget(body: unknown) {
  const { messages, dataModel, request } = changeInput.parse(body);
  const { messages: history, processor, state } = snapshotHistory(messages, dataModel);
  const inputs = inputsFromHistory(messages);
  const surfaceId = state.surfaceIds[0];
  const result = await askModel(processor, updatePrompt,
    `CURRENT STUDENT DATA MODEL (authoritative):\n${JSON.stringify(dataModel)}\n\nWIDGET HISTORY (messages):\n${JSON.stringify(history)}\n\nSTUDENT REQUEST:\n${request}`,
    () => verifiedHistory(processor, history),
    newMessages => {
      for (const message of newMessages) {
        if (!('updateDataModel' in message)) throw new Error('Only updateDataModel is allowed when changing existing inputs.');
        const update = message.updateDataModel;
        const limits = update.path ? inputs.get(update.path) : undefined;
        if (update.surfaceId !== surfaceId || !limits || typeof update.value !== 'number' || !Number.isFinite(update.value) || update.value < limits.min || update.value > limits.max) {
          throw new Error('Update only an existing bound numeric input path and stay within its range.');
        }
      }
    });
  return { ...result, messages: [...history, ...result.messages] };
}

export function errorResponse(error: unknown) {
  if (error instanceof PrototypeError) return Response.json({ error: error.message, code: error.code }, { status: error.status });
  if (error instanceof z.ZodError || error instanceof SyntaxError) return Response.json({ error: 'Invalid prototype request.', code: 'BAD_REQUEST' }, { status: 400 });
  // Never return connection strings, provider request ids, or unexpected error internals.
  return Response.json({ error: 'The prototype encountered an internal error. No unverified result is shown.', code: 'INTERNAL_ERROR' }, { status: 500 });
}
