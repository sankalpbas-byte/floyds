
// This file runs on Cloudflare's Edge Network
// It handles requests to /api/*

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

// Type definition for D1 Database
interface D1Database {
  prepare: (query: string) => D1PreparedStatement;
  dump: () => Promise<ArrayBuffer>;
  batch: (statements: D1PreparedStatement[]) => Promise<D1Result[]>;
  exec: (query: string) => Promise<D1ExecResult>;
}

interface D1PreparedStatement {
  bind: (...values: any[]) => D1PreparedStatement;
  first: <T = unknown>(colName?: string) => Promise<T | null>;
  run: () => Promise<D1Result>;
  all: <T = unknown>() => Promise<D1Result<T>>;
  raw: <T = unknown>() => Promise<T[]>;
}

interface D1Result<T = unknown> {
  results: T[];
  success: boolean;
  meta: any;
  error?: string;
}

interface D1ExecResult {
  count: number;
  duration: number;
}

interface Env {
  DB: D1Database;
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, env, params } = context;
  
  // CORS Headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  // Handle preflight requests
  if (request.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const path = params.route; 
  const route = Array.isArray(path) ? path[0] : path;

  // Helper for JSON responses
  const jsonResponse = (data: any, status = 200) => 
    new Response(JSON.stringify(data), {
      status,
      headers: { 
        ...corsHeaders,
        'Content-Type': 'application/json' 
      }
    });

  try {
    // 0. Ensure Schema Exists (Lazy Migration)
    const initSql = `
      CREATE TABLE IF NOT EXISTS menu_items (
        id TEXT PRIMARY KEY,
        name TEXT,
        description TEXT,
        price REAL,
        imageUrl TEXT,
        category TEXT
      );
      CREATE TABLE IF NOT EXISTS transactions (
        id TEXT PRIMARY KEY,
        created TEXT,
        data TEXT
      );
    `;
    
    // We only run this on the state fetch (app load) to minimize overhead on writes
    if (request.method === "GET" && route === "state") {
        await env.DB.exec(initSql);

        // Fetch Menu
        const { results: menuItems } = await env.DB.prepare("SELECT * FROM menu_items").all();

        // Fetch Transactions (sorted by newest first)
        const { results: txRows } = await env.DB.prepare("SELECT data FROM transactions ORDER BY created DESC").all();
        
        // Safely parse the JSON data column
        const transactions = txRows.map((row: any) => {
            try {
                return JSON.parse(row.data);
            } catch (e) {
                console.error("Failed to parse transaction:", row);
                return null;
            }
        }).filter(Boolean); // Filter out any nulls from failed parses

        return jsonResponse({ transactions, menuItems });
    }

    // 2. POST /api/transactions
    if (request.method === "POST" && route === "transactions") {
      const newTx = await request.json() as any;
      
      // Store the transaction
      const stmt = env.DB.prepare(
        "INSERT INTO transactions (id, created, data) VALUES (?, ?, ?)"
      ).bind(newTx.id, newTx.created, JSON.stringify(newTx));
      
      await stmt.run();
      
      return jsonResponse({ success: true });
    }

    // 3. POST /api/menu
    if (request.method === "POST" && route === "menu") {
      const menuItems = await request.json() as any[];
      
      if (!Array.isArray(menuItems)) {
        return jsonResponse({ error: "Invalid input" }, 400);
      }

      // We perform a full replacement of the menu using a batch operation
      const statements = [];
      
      // 1. Clear existing menu
      statements.push(env.DB.prepare("DELETE FROM menu_items"));
      
      // 2. Insert new items
      for (const item of menuItems) {
        statements.push(
          env.DB.prepare(
            "INSERT INTO menu_items (id, name, description, price, imageUrl, category) VALUES (?, ?, ?, ?, ?, ?)"
          ).bind(item.id, item.name, item.description, item.price, item.imageUrl, item.category)
        );
      }
      
      await env.DB.batch(statements);
      
      return jsonResponse({ success: true });
    }

    return new Response("Not Found", { status: 404, headers: corsHeaders });

  } catch (err) {
    console.error(err);
    return jsonResponse({ error: "Backend Error", details: String(err) }, 500);
  }
};
