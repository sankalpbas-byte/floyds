interface Env {
  DB: any; // Cloudflare D1 Database binding
}

export const onRequest: any = async (context: any) => {
  const { request, env } = context;
  const url = new URL(request.url);
  const path = url.pathname;
  const method = request.method;

  // Ensure DB binding exists
  if (!env.DB) {
    return new Response(JSON.stringify({ error: "D1 Database binding 'DB' not found. Please check your Cloudflare Pages configuration." }), { 
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    // 1. GET State (Initial Load)
    if (path === '/api/state' && method === 'GET') {
      const phone = url.searchParams.get('phone');
      
      // Fetch menu items
      const menuResults = await env.DB.prepare("SELECT * FROM menu_items").all();
      
      // Fetch transactions
      let txResults;
      if (phone) {
        txResults = await env.DB.prepare(
          "SELECT * FROM transactions WHERE userPhone = ? OR userPhone IS NULL ORDER BY createdAt DESC LIMIT 50"
        ).bind(phone).all();
      } else {
        txResults = await env.DB.prepare(
          "SELECT * FROM transactions ORDER BY createdAt DESC LIMIT 50"
        ).all();
      }

      // Parse JSON payloads safely
      const parsedTransactions = (txResults.results || []).map((tx: any) => {
        try {
          return {
            ...JSON.parse(tx.payload),
            id: tx.id,
            created: tx.createdAt
          };
        } catch (e) {
          return null;
        }
      }).filter(Boolean);

      return Response.json({
        menuItems: menuResults.results || [],
        transactions: parsedTransactions
      });
    }

    // 2. POST Sync Transaction
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

      return Response.json({ success: true });
    }

    // 3. POST Sync Menu (Admin Only)
    if (path === '/api/sync/menu' && method === 'POST') {
      const items = await request.json();
      
      // We use a batch transaction approach for multiple items if supported, 
      // or simple sequential runs for smaller menus.
      const statements = items.map((item: any) => {
        return env.DB.prepare(
          "INSERT OR REPLACE INTO menu_items (id, name, description, price, imageUrl, category) VALUES (?, ?, ?, ?, ?, ?)"
        ).bind(item.id, item.name, item.description, item.price, item.imageUrl, item.category);
      });

      await env.DB.batch(statements);

      return Response.json({ success: true });
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