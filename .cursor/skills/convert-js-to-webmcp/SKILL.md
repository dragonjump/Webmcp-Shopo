---
name: convert-js-to-webmcp
description: Converts existing JavaScript functions into WebMCP tools so AI agents can call them via navigator.modelContext. Use when exposing web app logic as MCP tools, converting JS to WebMCP, or implementing WebMCP tool registration in browser code.
---

# Convert Existing JS to WebMCP Tools

WebMCP (W3C draft) lets web apps expose JavaScript as **tools** that AI agents can invoke. Use this skill when turning existing JS functions into `navigator.modelContext` tools.

## When to use this skill

- Adding WebMCP tool registration to an existing site or app
- Converting current JavaScript APIs (e.g. cart, search, filters) into agent-callable tools
- Designing `inputSchema` and `execute` for `registerTool()`

## WebMCP API (imperative)

- **Register:** `navigator.modelContext.registerTool(tool)` — requires secure context (HTTPS or localhost).
- **Unregister:** `navigator.modelContext.unregisterTool(name)`.
- **Tool shape:** `{ name, description, inputSchema, execute[, annotations] }`.

Reference: [WebMCP spec](https://webmachinelearning.github.io/webmcp/), [Early Preview doc](https://docs.google.com/document/d/1rtU1fRPS0bMqd9abMG_hc6K9OAI6soUy3Kh00toAgyk/edit).

---

## Conversion workflow

### 1. Pick candidate functions

Good candidates:

- Take clear inputs (ids, strings, numbers, options).
- Perform one logical action (add to cart, apply filter, get recommendation).
- Return a result or a stable side effect the agent can describe.

Avoid exposing internal helpers with unclear contracts or many implicit dependencies.

### 2. Define the tool contract

For each function:

- **name:** One short, snake_case identifier (e.g. `add_to_cart`, `get_size_recommendation`).
- **description:** One or two sentences for the agent: what the tool does and when to use it. Include main parameters by name.
- **inputSchema:** JSON Schema for the single argument object the agent will send.

### 3. Write inputSchema (JSON Schema)

Schema must be a plain object (no classes/functions). Common patterns:

```javascript
// String
{ type: "string", minLength: 1, maxLength: 200 }

// Number (integer)
{ type: "integer", minimum: 1, maximum: 99 }

// Enum
{ type: "string", enum: ["S", "M", "L", "XL"] }

// Optional property: omit required or use oneOf with null
```

Full input schema example:

```javascript
inputSchema: {
  type: "object",
  properties: {
    size: { type: "string", enum: ["S", "M", "L", "XL"] },
    logo: { type: "string", enum: ["big", "small"] },
    qty: { type: "integer", minimum: 1, default: 1 },
    note: { type: "string", maxLength: 500 }
  },
  required: ["size", "logo"]
}
```

Keep property names and types aligned with your existing JS.

### 4. Implement execute

Signature:

```javascript
async function execute(input, client) {
  // input = object matching inputSchema (from agent)
  // client = ModelContextClient (e.g. requestUserInteraction)
  return result; // Promise<any>
}
```

- **Call your existing JS** with values from `input`. Validate or coerce types if needed.
- **Return value:** Prefer a short, agent-friendly result. Common pattern: `{ content: [{ type: "text", text: "Done. Cart has 3 items." }] }` or a plain string/number. Avoid returning DOM nodes or non-serializable data.
- **Errors:** Catch and return a clear message so the agent can report failure.

### 5. Register once, unregister when done

- Call `registerTool()` once per tool (e.g. on app init or when the feature is enabled). Do not register on every render.
- If the page or component tears down, call `unregisterTool(name)` so the agent no longer sees the tool.
- Guard: check `navigator.modelContext` exists before registering (not all browsers support WebMCP yet).

---

## Example: existing addToCart → WebMCP tool

**Existing JS (e.g. in cart.js):**

```javascript
export function addToCart(item) {
  cart.push({ id: item.id, name: item.name, size: item.size, logo: item.logo, price: item.price, qty: item.qty || 1, note: item.note || '' });
}
export function getCartCount() { return cart.reduce((sum, i) => sum + (i.qty || 1), 0); }
```

**WebMCP registration (e.g. in app.js or a dedicated webmcp.js):**

```javascript
if (navigator.modelContext) {
  navigator.modelContext.registerTool({
    name: "add_to_cart",
    description: "Add Pure Man Kurta to cart. Requires size (S, M, L, XL), logo (big or small), optional quantity and note. Returns new cart count.",
    inputSchema: {
      type: "object",
      properties: {
        size: { type: "string", enum: ["S", "M", "L", "XL"] },
        logo: { type: "string", enum: ["big", "small"] },
        qty: { type: "integer", minimum: 1, default: 1 },
        note: { type: "string", maxLength: 500 }
      },
      required: ["size", "logo"]
    },
    async execute(input) {
      const product = getProducts().find(p => p.size === input.size);
      if (!product) return { content: [{ type: "text", text: "Invalid size." }] };
      addToCart({
        ...product,
        logo: input.logo,
        qty: input.qty ?? 1,
        note: input.note ?? ""
      });
      updateCartCountInHeader();
      const count = getCartCount();
      return { content: [{ type: "text", text: `Added to cart. Cart has ${count} items.` }] };
    }
  });
}
```

Use your real `getProducts`, `addToCart`, and `updateCartCountInHeader`; keep parameter names aligned with `inputSchema`.

---

## Example: read-only tool (e.g. size recommendation)

```javascript
navigator.modelContext.registerTool({
  name: "get_size_recommendation",
  description: "Recommend kurta size from height (cm) and weight (kg). Returns S, M, L, or XL.",
  inputSchema: {
    type: "object",
    properties: {
      heightCm: { type: "number", minimum: 140, maximum: 220 },
      weightKg: { type: "number", minimum: 40, maximum: 150 }
    },
    required: ["heightCm", "weightKg"]
  },
  annotations: { readOnlyHint: true },
  async execute(input) {
    const size = recommendSize(input.heightCm, input.weightKg);
    return { content: [{ type: "text", text: size ? `Recommended size: ${size}` : "Enter height and weight." }] };
  }
});
```

Set `annotations.readOnlyHint: true` for tools that do not modify state.

---

## Checklist

- [ ] Candidate functions chosen; each has clear inputs and one action.
- [ ] Tool `name` is unique and snake_case.
- [ ] `description` tells the agent what the tool does and main parameters.
- [ ] `inputSchema` is valid JSON Schema; `required` and types match your JS.
- [ ] `execute(input, client)` calls existing JS and returns an agent-friendly result.
- [ ] Register once per lifecycle; unregister on teardown if needed.
- [ ] `navigator.modelContext` checked before use (feature detection).

## More detail

- Full API and types: [reference.md](reference.md)
- More conversion examples: [reference.md](reference.md#examples)
