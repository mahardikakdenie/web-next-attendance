import { NextRequest } from "next/server";
import crypto from "crypto";

const BASE_URL = process.env.API_URL ?? "";
const INTERNAL_SECRET = process.env.INTERNAL_SECRET ?? "";
const SIGN_SECRET = process.env.SIGN_SECRET ?? "";
const APP_URL = process.env.APP_URL ?? "";

type RouteContext = {
  params: Promise<{ path?: string[] }>;
};

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

export async function GET(req: NextRequest, ctx: RouteContext) {
  return handler(req, ctx, "GET");
}

export async function POST(req: NextRequest, ctx: RouteContext) {
  return handler(req, ctx, "POST");
}

export async function PUT(req: NextRequest, ctx: RouteContext) {
  return handler(req, ctx, "PUT");
}

export async function DELETE(req: NextRequest, ctx: RouteContext) {
  return handler(req, ctx, "DELETE");
}

export async function PATCH(req: NextRequest, ctx: RouteContext) {
  return handler(req, ctx, "PATCH");
}

//////////////////////////////////////////////////////////////
// 🔥 MAIN HANDLER
//////////////////////////////////////////////////////////////

async function handler(
  req: NextRequest,
  context: RouteContext,
  method: HttpMethod
): Promise<Response> {
  const { path: pathArray = [] } = await context.params;

  if (!pathArray.length) {
    return json({ message: "Invalid API path" }, 400);
  }

  ////////////////////////////////////////////////////////////
  // 🔥 1. BUILD URL
  ////////////////////////////////////////////////////////////
  const path = pathArray.join("/");
  const fullURL = `${BASE_URL}/api/${path}${req.nextUrl.search}`;

  ////////////////////////////////////////////////////////////
  // 🔥 2. ORIGIN CHECK
  ////////////////////////////////////////////////////////////
  const origin = req.headers.get("origin");
  if (origin && APP_URL && origin !== APP_URL) {
    return json({ message: "Forbidden origin" }, 403);
  }

  ////////////////////////////////////////////////////////////
  // 🔥 3. BODY (RAW BUFFER)
  ////////////////////////////////////////////////////////////
  let bodyBuffer: ArrayBuffer | undefined =
    method !== "GET" ? await req.arrayBuffer() : undefined;

  // Ensure body is at least "{}" for signing and forwarding if empty
  if (method !== "GET" && (!bodyBuffer || bodyBuffer.byteLength === 0)) {
    bodyBuffer = new TextEncoder().encode("{}").buffer;
  }

  const rawBody: Buffer =
    bodyBuffer !== undefined
      ? Buffer.from(bodyBuffer)
      : Buffer.from("{}");

  ////////////////////////////////////////////////////////////
  // 🔥 4. SECURITY (PERBAIKAN)
  ////////////////////////////////////////////////////////////
  // JANGAN generate Date.now() atau UUID di sini. 
  // Ambil dari request yang dikirim oleh Browser (Client-side)
  const timestamp = req.headers.get("x-timestamp");
  const requestId = req.headers.get("x-request-id");

  // Jika browser tidak mengirim header ini, tolak request
  if (!timestamp || !requestId) {
    return json({ message: "Missing security headers (X-Timestamp / X-Request-ID)" }, 400);
  }

  const contentType = req.headers.get("content-type") ?? "";
  const isMultipart = contentType.includes("multipart/form-data");

  let signature: string | undefined;

  // Gunakan timestamp dan requestId bawaan dari browser untuk hashing
  if (!isMultipart) {
    signature = generateSignatureRaw(rawBody, timestamp, requestId);
  }

  ////////////////////////////////////////////////////////////
  // 🔥 5. BUILD HEADERS
  ////////////////////////////////////////////////////////////
  const headers: Record<string, string> = {
    "X-Internal-Secret": INTERNAL_SECRET,
    "X-Timestamp": timestamp, // Teruskan timestamp browser ke Go
    "X-Request-ID": requestId, // Teruskan UUID browser ke Go
  };

  if (contentType) {
    headers["Content-Type"] = contentType;
  }

  const cookie = req.headers.get("cookie");
  if (cookie) {
    headers["Cookie"] = cookie;
  }

  if (signature) {
    headers["X-Signature"] = signature;
  }

  ////////////////////////////////////////////////////////////
  // 🔥 6. FORWARD REQUEST
  ////////////////////////////////////////////////////////////
  const res = await fetch(fullURL, {
    method,
    headers,
    body: bodyBuffer,
  });

  ////////////////////////////////////////////////////////////
  // 🔥 7. RESPONSE
  ////////////////////////////////////////////////////////////
  const data = await res.text();

  const responseHeaders: HeadersInit = {
    "Content-Type":
      res.headers.get("content-type") ?? "application/json",
  };

  const setCookie = res.headers.get("set-cookie");
  if (setCookie) {
    responseHeaders["set-cookie"] = setCookie;
  }

  return new Response(data, {
    status: res.status,
    headers: responseHeaders,
  });
}

//////////////////////////////////////////////////////////////
// 🔥 HELPERS
//////////////////////////////////////////////////////////////

function generateSignatureRaw(body: Buffer, timestamp: string, requestId: string): string {
  return crypto
    .createHmac("sha256", SIGN_SECRET)
    .update(body)
    .update(timestamp)
    .update(requestId)
    .digest("hex");
}

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
