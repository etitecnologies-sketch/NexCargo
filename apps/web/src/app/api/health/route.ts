import { NextResponse } from "next/server";

// Endpoint de health check — usado pelo Docker e load balancer
// para verificar se a aplicação está viva
export async function GET() {
  return NextResponse.json({
    status: "ok",
    version: process.env.NEXT_PUBLIC_APP_VERSION ?? "0.1.0",
    timestamp: new Date().toISOString(),
  });
}
