export const openApiDocument = {
  openapi: "3.0.3",
  info: {
    title: "Sinza Coffee Shop API",
    version: "1.0.0",
    description:
      "Public + admin REST API for the Sinza Coffee Shop platform (menu, orders, payments, CMS, newsletter, AI assistant).",
  },
  servers: [{ url: "/" }],
  tags: [
    { name: "System" },
    { name: "Menu" },
    { name: "Orders" },
    { name: "Payments" },
    { name: "Content" },
    { name: "Engagement" },
    { name: "Admin" },
    { name: "AI" },
  ],
  paths: {
    "/api/health": {
      get: { tags: ["System"], summary: "Healthcheck", responses: { "200": { description: "OK" } } },
    },
    "/api/menu": {
      get: {
        tags: ["Menu"],
        summary: "Full menu grouped by category",
        parameters: [
          { name: "menu", in: "query", schema: { type: "string" } },
          { name: "category", in: "query", schema: { type: "string" } },
          { name: "q", in: "query", schema: { type: "string" } },
        ],
        responses: { "200": { description: "Menu payload" } },
      },
    },
    "/api/menu/{slug}": {
      get: {
        tags: ["Menu"],
        summary: "Single menu item",
        parameters: [{ name: "slug", in: "path", required: true, schema: { type: "string" } }],
        responses: { "200": { description: "Item" }, "404": { description: "Not found" } },
      },
    },
    "/api/waiters": {
      get: {
        tags: ["Orders"],
        summary: "Available waiters (requires a valid table QR token)",
        parameters: [{ name: "token", in: "query", schema: { type: "string" } }],
        responses: { "200": { description: "Waiters" }, "403": { description: "Invalid QR token" } },
      },
    },
    "/api/orders": {
      post: {
        tags: ["Orders"],
        summary: "Create an order",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["items"],
                properties: {
                  items: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        itemId: { type: "integer" },
                        quantity: { type: "integer" },
                        options: { type: "array", items: { type: "object" } },
                      },
                    },
                  },
                  channel: { type: "string", enum: ["waiter", "restaurant", "whatsapp"] },
                  waiterId: { type: "integer" },
                  customerName: { type: "string" },
                  customerEmail: { type: "string" },
                  customerPhone: { type: "string" },
                  note: { type: "string" },
                },
              },
            },
          },
        },
        responses: { "201": { description: "Order created" } },
      },
      get: { tags: ["Admin"], summary: "List orders (admin)", responses: { "200": { description: "Orders" } } },
    },
    "/api/orders/{code}": {
      get: {
        tags: ["Orders"],
        summary: "Order by public code",
        parameters: [{ name: "code", in: "path", required: true, schema: { type: "string" } }],
        responses: { "200": { description: "Order" } },
      },
    },
    "/api/payments/initiate": {
      post: {
        tags: ["Payments"],
        summary: "Start a PawaPay (MoMo/Airtel) or Pesapal (card) payment",
        responses: { "200": { description: "Payment intent" } },
      },
    },
    "/api/payments/webhook": {
      post: { tags: ["Payments"], summary: "Provider callback", responses: { "200": { description: "ACK" } } },
    },
    "/api/reservations": {
      post: { tags: ["Engagement"], summary: "Book a table", responses: { "201": { description: "Created" } } },
    },
    "/api/contact": {
      post: { tags: ["Engagement"], summary: "Contact form", responses: { "201": { description: "Created" } } },
    },
    "/api/newsletter": {
      post: { tags: ["Engagement"], summary: "Subscribe to the newsletter", responses: { "201": { description: "Subscribed" } } },
    },
    "/api/feedback": {
      post: { tags: ["Engagement"], summary: "Leave feedback", responses: { "201": { description: "Created" } } },
    },
    "/api/posts": {
      get: {
        tags: ["Content"],
        summary: "Blog posts, offers, news and events",
        parameters: [{ name: "type", in: "query", schema: { type: "string" } }],
        responses: { "200": { description: "Posts" } },
      },
    },
    "/api/gallery": { get: { tags: ["Content"], summary: "Gallery items", responses: { "200": { description: "Gallery" } } } },
    "/api/settings": { get: { tags: ["Content"], summary: "Public site settings", responses: { "200": { description: "Settings" } } } },
    "/api/auth/request-link": {
      post: { tags: ["System"], summary: "Send magic activation link", responses: { "200": { description: "Sent" } } },
    },
    "/api/auth/verify": { get: { tags: ["System"], summary: "Verify magic link", responses: { "302": { description: "Redirect" } } } },
    "/api/auth/me": { get: { tags: ["System"], summary: "Current session", responses: { "200": { description: "Session" } } } },
    "/api/upload": { post: { tags: ["Admin"], summary: "Multi-file upload to Cloudflare R2", responses: { "200": { description: "Uploaded" } } } },
    "/api/admin/{resource}": {
      get: {
        tags: ["Admin"],
        summary: "Generic CMS resource list",
        parameters: [{ name: "resource", in: "path", required: true, schema: { type: "string" } }],
        responses: { "200": { description: "Rows" } },
      },
      post: {
        tags: ["Admin"],
        summary: "Create a CMS resource row",
        parameters: [{ name: "resource", in: "path", required: true, schema: { type: "string" } }],
        responses: { "201": { description: "Created" } },
      },
    },
    "/api/admin/stats": { get: { tags: ["Admin"], summary: "Sales reports (day/week/month) + top items", responses: { "200": { description: "Stats" } } } },
    "/api/admin/social-sync": { post: { tags: ["Admin"], summary: "Sync Instagram/Threads/TikTok via Apify", responses: { "200": { description: "Synced" } } } },
    "/api/ai/chat": { post: { tags: ["AI"], summary: "Gemini powered assistant grounded on site content", responses: { "200": { description: "Answer" } } } },
  },
} as const;
