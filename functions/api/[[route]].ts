// Cloudflare Pages Function for API routes
// This handles all requests starting with /api/

type Env = {
  DB: any; // D1Database binding
};

export const onRequest: any = async (context: any) => {
  const { request, env } = context;
  const url = new URL(request.url);
  const path = url.pathname;
  const method = request.method;

  if (!env.DB) {
    return new Response(JSON.stringify({ error: "D1 Database binding 'DB' not found. Please ensure your Pages project has a D1 database bound to 'DB' in the Cloudflare dashboard." }), { 
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    // 1. GET State (Initial Load)
    // Path: /api/state?phone=...
    if (path === '/api/state' && method === 'GET') {
      const phone = url.searchParams.get('phone');
      
      const menuResults = await env.DB.prepare("SELECT * FROM menu_items").all();
      
      let txResults;
      if (phone) {
        txResults = await env.DB.prepare(
          "SELECT * FROM transactions WHERE userPhone = ? OR userPhone IS NULL ORDER BY createdAt DESC LIMIT 100"
        ).bind(phone).all();
      } else {
        txResults = await env.DB.prepare(
          "SELECT * FROM transactions ORDER BY createdAt DESC LIMIT 100"
        ).all();
      }

      const parsedTransactions = (txResults.results || []).map((tx: any) => {
        try {
          const data = JSON.parse(tx.payload);
          return {
            ...data,
            id: tx.id,
            created: tx.createdAt
          };
        } catch (e) {
          return null;
        }
      }).filter(Boolean);

      return new Response(JSON.stringify({
        menuItems: menuResults.results || [],
        transactions: parsedTransactions
      }), {
        headers: { "Content-Type": "application/json" }
      });
    }

    // 2. POST Sync Transaction
    // Path: /api/sync/transaction
    if (path === '/api/sync/transaction' && method === 'POST') {
      const data = await request.json();
      const id = data.id || crypto.randomUUID();
      const type = data.type;
      const userPhone = data.userPhone || null;
      const payload = JSON.stringify(data);
      const createdAt = data.created || new Date().toISOString();

      await env.DB.prepare(
        "INSERT OR REPLACE INTO transactions (id, type, userPhone, payload, createdAt) VALUES (?, ?, ?, ?, ?)"
      ).bind(id, type, userPhone, payload, createdAt).run();

      return new Response(JSON.stringify({ success: true }), {
        headers: { "Content-Type": "application/json" }
      });
    }

    // 3. POST Sync Menu
    // Path: /api/sync/menu
    if (path === '/api/sync/menu' && method === 'POST') {
      const items = await request.json();
      const statements = items.map((item: any) => {
        return env.DB.prepare(
          "INSERT OR REPLACE INTO menu_items (id, name, description, price, imageUrl, category) VALUES (?, ?, ?, ?, ?, ?)"
        ).bind(item.id, item.name, item.description, item.price, item.imageUrl, item.category);
      });

      await env.DB.batch(statements);
      return new Response(JSON.stringify({ success: true }), {
        headers: { "Content-Type": "application/json" }
      });
    }

    return new Response(JSON.stringify({ error: "Endpoint not found" }), { 
      status: 404,
      headers: { "Content-Type": "application/json" }
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { 
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};