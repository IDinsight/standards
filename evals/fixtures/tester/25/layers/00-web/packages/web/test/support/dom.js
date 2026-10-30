// In-memory DOM for component tests: elements, text, attributes, events,
// focus, and role queries. It does no layout or styling and does not perform
// the browser's default actions for keyboard input.
const ROLES = { A: 'link', BUTTON: 'button', SELECT: 'combobox', TABLE: 'table', TR: 'row', TH: 'columnheader', TD: 'cell' };
const FOCUSABLE = new Set(['A', 'BUTTON', 'INPUT', 'SELECT', 'TEXTAREA']);

export class FakeEvent {
  constructor(type, init = {}) {
    Object.assign(this, { type, bubbles: Boolean(init.bubbles), key: init.key, target: null, defaultPrevented: false });
  }

  preventDefault() {
    this.defaultPrevented = true;
  }
}

class FakeText {
  constructor(data) {
    this.nodeType = 3;
    this.parentNode = null;
    this.textContent = String(data);
  }
}

class FakeElement {
  constructor(document, tagName) {
    this.nodeType = 1;
    this.ownerDocument = document;
    this.tagName = tagName.toUpperCase();
    this.parentNode = null;
    this.childNodes = [];
    this.value = '';
    this.attrs = new Map();
    this.listeners = new Map();
  }

  get children() {
    return this.childNodes.filter((node) => node.nodeType === 1);
  }

  get textContent() {
    return this.childNodes.map((node) => node.textContent).join('');
  }

  set textContent(value) {
    this.replaceChildren(...(value === '' || value == null ? [] : [String(value)]));
  }

  append(...nodes) {
    for (const node of nodes) {
      const child = typeof node === 'string' ? new FakeText(node) : node;
      child.parentNode?.removeChild(child);
      child.parentNode = this;
      this.childNodes.push(child);
    }
  }

  removeChild(node) {
    this.childNodes = this.childNodes.filter((child) => child !== node);
    node.parentNode = null;
    return node;
  }

  remove() {
    this.parentNode?.removeChild(this);
  }

  replaceChildren(...nodes) {
    for (const child of this.childNodes) child.parentNode = null;
    this.childNodes = [];
    this.append(...nodes);
  }

  setAttribute(name, value) {
    this.attrs.set(name.toLowerCase(), String(value));
  }

  getAttribute(name) {
    return this.attrs.get(name.toLowerCase()) ?? null;
  }

  hasAttribute(name) {
    return this.attrs.has(name.toLowerCase());
  }

  removeAttribute(name) {
    this.attrs.delete(name.toLowerCase());
  }

  addEventListener(type, listener) {
    this.listeners.set(type, [...(this.listeners.get(type) ?? []), listener]);
  }

  dispatchEvent(event) {
    event.target ??= this;
    for (let node = this; node; node = event.bubbles ? node.parentNode : null) {
      for (const listener of node.listeners.get(event.type) ?? []) listener.call(node, event);
    }
    return !event.defaultPrevented;
  }

  // Like a browser, a disabled control ignores click().
  click() {
    if (!this.disabled) this.dispatchEvent(new FakeEvent('click', { bubbles: true }));
  }

  // Focus moves to an enabled control or link, or an element with a tabindex,
  // when it is attached to the document and not hidden.
  focus() {
    const focusable = this.hasAttribute('tabindex') || (FOCUSABLE.has(this.tagName) && !this.disabled);
    if (focusable && isAttached(this) && !isHidden(this)) this.ownerDocument.activeElement = this;
  }
}

// Properties that mirror an attribute, as in the DOM.
for (const [property, attribute] of [['id', 'id'], ['className', 'class'], ['type', 'type'], ['href', 'href'], ['download', 'download']]) {
  Object.defineProperty(FakeElement.prototype, property, {
    get() { return this.getAttribute(attribute) ?? ''; },
    set(value) { this.setAttribute(attribute, value); },
  });
}
for (const flag of ['hidden', 'disabled']) {
  Object.defineProperty(FakeElement.prototype, flag, {
    get() { return this.hasAttribute(flag); },
    set(value) { if (value) this.setAttribute(flag, ''); else this.removeAttribute(flag); },
  });
}

class FakeDocument {
  constructor() {
    this.body = new FakeElement(this, 'body');
    this.activeElement = this.body;
  }

  createElement(tagName) {
    return new FakeElement(this, tagName);
  }

  getElementById(id) {
    return descendants(this.body).find((element) => element.id === id) ?? null;
  }
}

export function createDocument() {
  return new FakeDocument();
}

// Every element below root, in document order.
export function descendants(root) {
  return root.children.flatMap((child) => [child, ...descendants(child)]);
}

function isAttached(element) {
  let node = element;
  while (node.parentNode) node = node.parentNode;
  return node === element.ownerDocument.body;
}

export function isHidden(element) {
  for (let node = element; node; node = node.parentNode) {
    if (node.hasAttribute('hidden')) return true;
  }
  return false;
}

// The one visible element with the role (implicit or explicit) and, when
// given, the accessible name (aria-label or text).
export function getByRole(root, role, { name } = {}) {
  const matches = descendants(root).filter((element) => (element.getAttribute('role') ?? ROLES[element.tagName]) === role
    && !isHidden(element)
    && (name === undefined || (element.getAttribute('aria-label') ?? element.textContent).trim() === name));
  if (matches.length !== 1) {
    throw new Error(`expected one ${role}${name === undefined ? '' : ` named ${name}`}, found ${matches.length}`);
  }
  return matches[0];
}

// Lets pending promise callbacks run, for example a handler awaiting a request.
export function flush() {
  return new Promise((resolve) => setImmediate(resolve));
}
