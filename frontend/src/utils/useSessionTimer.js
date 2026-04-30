import { useState, useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

/**
 * useSessionTimer — WebSocket-backed rest timer hook
 *
 * Returns:
 *   remaining  – seconds left (null when no timer is running)
 *   total      – total seconds the current timer was started with
 *   isRunning  – boolean
 *   startTimer(restSec) – call after a set is logged
 *   cancelTimer()       – skip / dismiss the timer
 */
export function useSessionTimer(clerkUserId) {
  const socketRef = useRef(null);
  const [remaining, setRemaining] = useState(null);
  const [total, setTotal] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  // ── Connect once, on mount ───────────────────────────────────────────────
  useEffect(() => {
    const socket = io(API_URL, {
      transports: ['websocket', 'polling'],
      auth: { clerkUserId: clerkUserId || 'anonymous' },
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    socket.on('connect', () => setIsConnected(true));
    socket.on('disconnect', () => {
      setIsConnected(false);
      setIsRunning(false);
      setRemaining(null);
    });

    socket.on('timer:tick', ({ remaining: r, total: t }) => {
      setRemaining(r);
      setTotal(t);
      setIsRunning(true);
    });

    socket.on('timer:done', () => {
      setIsRunning(false);
      setRemaining(0);
      // Auto-clear after a short delay so UI can show "Done"
      setTimeout(() => setRemaining(null), 2000);
    });

    socket.on('timer:cancelled', () => {
      setIsRunning(false);
      setRemaining(null);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [clerkUserId]);

  // ── Controls ─────────────────────────────────────────────────────────────
  const startTimer = useCallback((restSec) => {
    if (!socketRef.current) return;
    socketRef.current.emit('timer:start', { restSec });
  }, []);

  const cancelTimer = useCallback(() => {
    if (!socketRef.current) return;
    socketRef.current.emit('timer:cancel');
  }, []);

  return { remaining, total, isRunning, isConnected, startTimer, cancelTimer };
}
