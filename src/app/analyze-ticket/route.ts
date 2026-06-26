import { NextRequest, NextResponse } from "next/server";
import { TicketRequestSchema } from "@/lib/schema/request";
import { orchestrator } from "@/lib/orchestrator";
import { safeErrorResponse } from "@/lib/errors";
import { ZodError } from "zod";

export async function POST(request: NextRequest) {
  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 },
      );
    }

    const parseResult = TicketRequestSchema.safeParse(body);

    if (!parseResult.success) {
      const zodError = parseResult.error as ZodError;
      const fieldErrors = zodError.issues.map((e) => ({
        field: e.path.join("."),
        message: e.message,
      }));

      const hasMissingRequired = zodError.issues.some(
        (e) => e.code === "invalid_type" && e.message.includes("Required"),
      );

      return NextResponse.json(
        {
          error: hasMissingRequired
            ? "Missing required fields"
            : "Unprocessable ticket data",
          details: fieldErrors,
        },
        { status: hasMissingRequired ? 400 : 422 },
      );
    }

    const response = await orchestrator(parseResult.data);

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    const safe = safeErrorResponse(error);
    return NextResponse.json({ error: safe.body.error }, { status: safe.status });
  }
}
