import { NextRequest } from "next/server";
import { realtimeEmitter, RealtimePayload } from "@/lib/realtime/broadcast";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const tournamentId = searchParams.get("tournamentId");

  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();

      // Initial handshake message
      controller.enqueue(
        encoder.encode(`event: connected\ndata: ${JSON.stringify({ status: "connected", timestamp: new Date().toISOString() })}\n\n`)
      );

      // Event listener
      const handleEvent = (payload: RealtimePayload) => {
        try {
          controller.enqueue(
            encoder.encode(`event: ${payload.type}\ndata: ${JSON.stringify(payload)}\n\n`)
          );
        } catch {
          // Stream closed
        }
      };

      const eventKey = tournamentId ? `tournament:${tournamentId}` : "tournament:all";
      realtimeEmitter.on(eventKey, handleEvent);

      // Periodic heartbeat ping to keep connection alive
      const pingInterval = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`: ping\n\n`));
        } catch {
          clearInterval(pingInterval);
        }
      }, 25000);

      // Clean up on request abort
      req.signal.addEventListener("abort", () => {
        clearInterval(pingInterval);
        realtimeEmitter.off(eventKey, handleEvent);
        try {
          controller.close();
        } catch {
          // Already closed
        }
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
