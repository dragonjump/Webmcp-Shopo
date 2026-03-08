# WebMCP API Reference & Conversion Examples

## API summary

- **navigator.modelContext** (SecureContext only)
  - `registerTool(tool)` — add one tool; throws if name exists or inputSchema invalid.
  - `unregisterTool(name)` — remove tool by name.

- **ModelContextTool**
  - `name` (required): string, unique.
  - `description` (required): string, non-empty.
  - `inputSchema` (optional): plain object, JSON Schema for the single input object.
  - `execute` (required): `(input, client) => Promise<any>`.
  - `annotations` (optional): `{ readOnlyHint?: boolean }`.

- **ToolExecuteCallback:** `Promise<any>(object input, ModelContextClient client)`  
  Return value is passed to the agent (e.g. `{ content: [{ type: "text", text: "..." }] }` or a simple value).

- **ModelContextClient:** e.g. `requestUserInteraction(callback)` for future user-confirmation flows.

## JSON Schema (inputSchema) quick reference

| Type    | Example |
|---------|--------|
| string  | `{ type: "string", minLength: 1, maxLength: 500 }` |
| number  | `{ type: "number", minimum: 0, maximum: 100 }` |
| integer | `{ type: "integer", minimum: 1 }` |
| boolean | `{ type: "boolean", default: false }` |
| enum    | `{ type: "string", enum: ["a", "b"] }` |
| object  | `{ type: "object", properties: { ... }, required: ["x"] }` |
| array   | `{ type: "array", items: { type: "string" } }` |

Omit optional props from `required`. Use `default` where it helps the agent.

## Examples

### Apply filters (read-only hint)

```javascript
navigator.modelContext.registerTool({
  name: "apply_list_filters",
  description: "Apply product list filters by size, min/max price (RM), body type, and min rating. All params optional.",
  inputSchema: {
    type: "object",
    properties: {
      sizes: { type: "array", items: { type: "string", enum: ["S", "M", "L", "XL"] } },
      priceMin: { type: "number", minimum: 0 },
      priceMax: { type: "number", minimum: 0 },
      bodyType: { type: "string", enum: ["fit", "fat", "chubby", "large", "xl"] },
      minRating: { type: "integer", minimum: 0, maximum: 5 }
    }
  },
  annotations: { readOnlyHint: true },
  async execute(input) {
    // Set filter UI state from input, then runFilters() or equivalent
    return { content: [{ type: "text", text: "Filters applied." }] };
  }
});
```

### Get cart summary

```javascript
navigator.modelContext.registerTool({
  name: "get_cart_summary",
  description: "Return current cart item count and a short summary. Does not change cart.",
  inputSchema: { type: "object", properties: {} },
  annotations: { readOnlyHint: true },
  async execute() {
    const items = getCart();
    const count = getCartCount();
    const summary = items.length
      ? items.map(i => `${i.name} ${i.size} × ${i.qty}`).join("; ")
      : "Cart is empty.";
    return { content: [{ type: "text", text: `Cart: ${count} items. ${summary}` }] };
  }
});
```

### Reset cart

```javascript
navigator.modelContext.registerTool({
  name: "reset_cart",
  description: "Clear all items from the cart. Use when user wants to start over.",
  inputSchema: { type: "object", properties: {} },
  async execute() {
    resetCart();
    updateCartCountInHeader();
    return { content: [{ type: "text", text: "Cart cleared." }] };
  }
});
```

### Teardown (e.g. SPA route change)

```javascript
const toolNames = ["add_to_cart", "get_size_recommendation", "get_cart_summary", "reset_cart", "apply_list_filters"];
toolNames.forEach(name => {
  try { navigator.modelContext.unregisterTool(name); } catch (_) {}
});
```

## Links

- [WebMCP spec (W3C)](https://webmachinelearning.github.io/webmcp/)
- [WebMCP Early Preview (Google Doc)](https://docs.google.com/document/d/1rtU1fRPS0bMqd9abMG_hc6K9OAI6soUy3Kh00toAgyk/edit)
- [MCP specification](https://modelcontextprotocol.io/specification/latest)
- [JSON Schema](https://json-schema.org/draft/2020-12/json-schema-core.html)
