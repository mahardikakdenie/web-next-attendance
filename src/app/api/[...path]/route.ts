import { NextRequest } from "next/server";

const BASE_URL = process.env.API_URL || "";

export async function GET(req: NextRequest, context: { params: Promise<{ path?: string[] }> }) {
  return handler(req, context, "GET");
}

export async function POST(req: NextRequest, context: { params: Promise<{ path?: string[] }> }) {
  return handler(req, context, "POST");
}

export async function PUT(req: NextRequest, context: { params: Promise<{ path?: string[] }> }) {
  return handler(req, context, "PUT");
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ path?: string[] }> }) {
  return handler(req, context, "DELETE");
}

async function handler(
  req: NextRequest,
  context: { params: Promise<{ path?: string[] }> },
  method: string
) {
  const { path: pathArray = [] } = await context.params;

  if (pathArray.length === 0) {
    console.error("❌ EMPTY PATH");
    return new Response(JSON.stringify({ message: "Invalid API path" }), {
      status: 400,
    });
  }

  const path = pathArray.join("/");

  const fullURL = `${BASE_URL}/api/${path}${req.nextUrl.search}`;
  const requestCookie = req.headers.get("cookie");

  const body = method !== "GET" ? await req.text() : undefined;

  const res = await fetch(fullURL, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(requestCookie ? { Cookie: requestCookie } : {}),
    },
    body,
  });

  const data = await res.text();
  const response = new Response(data, {
    status: res.status,
    headers: {
      "Content-Type": res.headers.get("content-type") || "application/json",
    },
  });

  const setCookie = res.headers.get("set-cookie");
  if (setCookie) {
    response.headers.set("set-cookie", setCookie);
  }

  return response;
}
