'use client';

import { useEffect, useRef, useState } from 'react';
import { A2uiSurface } from '@a2ui/react';
import { MessageProcessor, type ProcessableMessage } from '@a2ui/web_core';
import { catalog } from '../lib/catalog';
import styles from './Widget.module.css';

function newProcessor() {
  return new MessageProcessor([catalog], undefined, { version: '1.0' });
}
type Processor = ReturnType<typeof newProcessor>;
type Surface = NonNullable<ReturnType<Processor['model']['surfacesMap']['get']>>;

export function Widget({ messages, onDataModel, onReady }: {
  messages: unknown[];
  onDataModel?: (model: Record<string, unknown>) => void;
  onReady?: () => void;
}) {
  const [surfaces, setSurfaces] = useState<Surface[]>([]);
  const [error, setError] = useState('');
  const handlers = useRef({onDataModel, onReady});
  handlers.current = {onDataModel, onReady};
  const engine = useRef<Processor | null>(null);
  const processed = useRef<string[]>([]);
  const subscriptions = useRef<{unsubscribe(): void}[]>([]);

  function detach() {
    subscriptions.current.forEach(sub => sub.unsubscribe());
    subscriptions.current = [];
  }

  useEffect(() => () => {
    detach();
    engine.current?.dispose();
    engine.current = null;
    processed.current = [];
  }, []);

  useEffect(() => {
    const signatures = messages.map(m => JSON.stringify(m));
    const append = !!engine.current && processed.current.every((s, i) => signatures[i] === s);
    if (append && signatures.length === processed.current.length) return;
    try {
      // Keep the same official A2UI processor for Chatbot update messages. Rebuild only
      // when the history is replaced (e.g. reopen a different Widget from a saved Note).
      if (!append) {
        detach();
        engine.current?.dispose();
        engine.current = newProcessor();
        processed.current = [];
      }
      detach();
      const processor = engine.current!;
      processor.processMessages(messages.slice(processed.current.length) as ProcessableMessage[]);
      processed.current = signatures;
      const next = Array.from(processor.model.surfacesMap.values());
      setError('');
      setSurfaces(next);
      for (const surface of next) {
        const publish = () => handlers.current.onDataModel?.(structuredClone(surface.dataModel.get<Record<string, unknown>>('/')));
        subscriptions.current.push(surface.dataModel.subscribe<Record<string, unknown>>('/', publish));
        publish();
      }
      if (next.length) handlers.current.onReady?.();
    } catch (e) {
      detach();
      engine.current?.dispose();
      engine.current = null;
      processed.current = [];
      setError(e instanceof Error ? e.message : 'The Widget could not be rendered.');
      setSurfaces([]);
    }
  }, [messages]);

  return <div className={styles.widget}>
    {error ? <p className={styles.error} role="alert">Widget rendering failed: {error}</p> : surfaces.map(surface => <A2uiSurface key={surface.id} surface={surface}/>)}
  </div>;
}
