import { type NextRequest, NextResponse } from "next/server";
import { updateTicketMeta } from "@/lib/support-state";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { conversationId, status, priority, adminNotes } = body;

    if (!conversationId) {
      return NextResponse.json({ error: "Missing conversationId" }, { status: 400 });
    }

    const updated = updateTicketMeta(conversationId, {
      ...(status ? { status } : {}),
      ...(priority ? { priority } : {}),
      ...(adminNotes !== undefined ? { adminNotes } : {}),
    });

    return NextResponse.json({ success: true, ticket: updated });
  } catch (error) {
    console.error("[Support Status API] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
