import { NextResponse } from "next/server";
import { ZodError } from "zod";

export function badRequest(message: string, details?: unknown) {
  return NextResponse.json(
    { error: { code: "bad_request", message, details } },
    { status: 400 },
  );
}

export function notFound(message = "Not found") {
  return NextResponse.json(
    { error: { code: "not_found", message } },
    { status: 404 },
  );
}

export function serverError(err: unknown) {
  console.error("[api] internal error:", err);
  const message = err instanceof Error ? err.message : "Internal server error";
  return NextResponse.json(
    { error: { code: "internal_error", message } },
    { status: 500 },
  );
}

export function fromZodError(err: ZodError) {
  return badRequest("Validation failed", err.flatten());
}
