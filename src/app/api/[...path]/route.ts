import { NextRequest } from "next/server";
import { cookies } from "next/headers";

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
  console.log("🚀 ~ handler ~ BASE_URL:", BASE_URL)

  console.log("========== PROXY DEBUG ==========");
  console.log("Incoming Path:", pathArray);
  console.log("Final URL:", fullURL);

  const token = (await cookies()).get("token")?.value;

  const body = method !== "GET" ? await req.text() : undefined;

  const res = await fetch(fullURL, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
    },
    body,
  });

  const data = await res.text();

  console.log("Response Status:", res.status);
  console.log("================================");

  return new Response(data, {
    status: res.status,
    headers: {
      "Content-Type": res.headers.get("content-type") || "application/json",
    },
  });
}
