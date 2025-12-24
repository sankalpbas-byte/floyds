// This file runs on Cloudflare's Edge Network
// It handles requests to /api/*

// Minimal type definitions to satisfy the compiler if @cloudflare/workers-types is not loaded
interface KVNamespace {
  get(key: string, options?: any): Promise<string | null>;
  put(key: string, value: string | ReadableStream | ArrayBuffer | FormData, options?: any): Promise<void>;
  delete(key: string): Promise<void>;
}

interface EventContext<Env, P extends string, Data> {
  request: Request;
  functionPath: string;
  waitUntil: (promise: Promise<any>) => void;
  passThroughOnException: () => void;
  next: (input?: Request | string, init?: RequestInit) => Promise<Response>;
  env: Env;
  params: Record<string, string | string[]>;
  data: Data;
}

type PagesFunction<Env = unknown, P extends string = string, Data extends Record<string, unknown> = Record<string, unknown>> = (
  context: EventContext<Env, P, Data>
) => Response | Promise<Response>;

interface Env {
  FLOYDS_DATA: KVNamespace;
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, env, params } = context;
  const url = new URL(request.url);
  
  // params.route is an array because of the [[route]] filename
  // e.g. /api/state -> ['state']
  const path = params.route; 
  const route = Array.isArray(path) ? path[0] : path;

  // Helper for JSON responses
  const jsonResponse = (data: any, status = 200) => 
    new Response(JSON.stringify(data), {
      status,
      headers: { 'Content-Type': 'application/json' }
    });

  try {
    // 1. GET /api/state
    if (request.method === "GET" && route === "state") {
      const state = await env.FLOYDS_DATA.get("full_state");
      // Return empty structure if nothing exists yet
      return new Response(state || JSON.stringify({ transactions: [], menuItems: [] }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    // 2. POST /api/transactions
    if (request.method === "POST" && route === "transactions") {
      const newTx = await request.json();
      
      const rawState = await env.FLOYDS_DATA.get("full_state");
      let state = rawState ? JSON.parse(rawState) : { transactions: [], menuItems: [] };
      
      // Add new transaction to the top of the list
      state.transactions = [newTx, ...(state.transactions || [])];
      
      await env.FLOYDS_DATA.put("full_state", JSON.stringify(state));
      return jsonResponse({ success: true });
    }

    // 3. POST /api/menu
    if (request.method === "POST" && route === "menu") {
      const menuItems = await request.json();
      
      const rawState = await env.FLOYDS_DATA.get("full_state");
      let state = rawState ? JSON.parse(rawState) : { transactions: [], menuItems: [] };
      
      state.menuItems = menuItems;
      
      await env.FLOYDS_DATA.put("full_state", JSON.stringify(state));
      return jsonResponse({ success: true });
    }

    return new Response("Not Found", { status: 404 });

  } catch (err) {
    // If KV is not bound or other errors
    return jsonResponse({ error: "Backend Error", details: String(err) }, 500);
  }
};
