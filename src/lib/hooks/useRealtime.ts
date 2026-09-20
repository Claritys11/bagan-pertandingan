"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { RealtimeEventType } from "@/lib/realtime/broadcast";

export type ConnectionStatus = "connected" | "connecting" | "disconnected";

export interface RealtimeEventPayload {
  type: RealtimeEventType;
  tournamentId: string;
  data: any;
  timestamp: string;
}

export function useTournamentRealtime(
  tournamentId?: string,
  onEvent?: (event: RealtimeEventPayload) => void
) {
  const [status, setStatus] = useState<ConnectionStatus>("connecting");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const onEventRef = useRef(onEvent);
  onEventRef.current = onEvent;

  const connect = useCallback(() => {
    if (typeof window === "undefined") return;

    setStatus("connecting");
    const url = tournamentId
      ? `/api/realtime?tournamentId=${encodeURIComponent(tournamentId)}`
      : `/api/realtime`;

    const es = new EventSource(url);
    eventSourceRef.current = es;

    es.addEventListener("connected", () => {
      setStatus("connected");
      setLastUpdated(new Date());
    });

    const eventTypes: RealtimeEventType[] = [
      "MATCH_UPDATED",
      "SCORE_UPDATED",
      "RESULT_SUBMITTED",
      "BRACKET_LOCKED",
      "BRACKET_UPDATED",
      "SCHEDULE_CHANGED",
      "ANNOUNCEMENT_CREATED",
      "TOURNAMENT_STATUS_CHANGED",
    ];

    eventTypes.forEach((eventType) => {
      es.addEventListener(eventType, (e: MessageEvent) => {
        try {
          const payload = JSON.parse(e.data) as RealtimeEventPayload;
          setLastUpdated(new Date());
          if (onEventRef.current) {
            onEventRef.current(payload);
          }
        } catch (err) {
          console.error("Failed to parse realtime event:", err);
        }
      });
    });

    es.onerror = () => {
      setStatus("disconnected");
      es.close();

      // Retry after 3 seconds
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = setTimeout(() => {
        connect();
      }, 3000);
    };
  }, [tournamentId]);

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, [connect]);

  return {
    status,
    lastUpdated,
  };
}
