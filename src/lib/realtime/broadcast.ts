import { EventEmitter } from "events";

// Global singleton event emitter for Realtime SSE broadcasting
declare global {
  var tournamentEventEmitter: EventEmitter | undefined;
}

export const realtimeEmitter: EventEmitter =
  globalThis.tournamentEventEmitter ?? new EventEmitter();

// Allow unlimited listeners for multi-client SSE connections
realtimeEmitter.setMaxListeners(100);

if (process.env.NODE_ENV !== "production") {
  globalThis.tournamentEventEmitter = realtimeEmitter;
}

export type RealtimeEventType =
  | "MATCH_UPDATED"
  | "SCORE_UPDATED"
  | "RESULT_SUBMITTED"
  | "BRACKET_LOCKED"
  | "BRACKET_UPDATED"
  | "SCHEDULE_CHANGED"
  | "ANNOUNCEMENT_CREATED"
  | "TOURNAMENT_STATUS_CHANGED";

export interface RealtimePayload {
  type: RealtimeEventType;
  tournamentId: string;
  data: any;
  timestamp: string;
}

export function broadcastTournamentEvent(
  type: RealtimeEventType,
  tournamentId: string,
  data: any
) {
  const payload: RealtimePayload = {
    type,
    tournamentId,
    data,
    timestamp: new Date().toISOString(),
  };
  realtimeEmitter.emit(`tournament:${tournamentId}`, payload);
  realtimeEmitter.emit("tournament:all", payload);
}
