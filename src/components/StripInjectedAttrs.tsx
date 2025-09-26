// src/components/StripInjectedAttrs.tsx
'use client';
import { useEffect } from 'react';

/** Strip extension-injected attrs (fdprocessedid, etc.) to prevent hydration overlays. */
export default function StripInjectedAttrs() {
  useEffect(() => {
    const bad = ['fdprocessedid', 'data-focus-visible-added'];
    const walk = (n: Element) => {
      const st = [n];
      while (st.length) {
        const el = st.pop()!;
        for (const k of bad) if (el.hasAttribute(k)) el.removeAttribute(k);
        if (el.tagName === 'BUTTON') el.removeAttribute('autofocus');
        st.push(...Array.from(el.children));
      }
    };
    walk(document.body);
  }, []);
  return null;
}
