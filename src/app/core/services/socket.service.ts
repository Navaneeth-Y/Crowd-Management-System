
import { Injectable, NgZone, OnDestroy } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../../environments/environment';

export interface LiveOccupancyEvent {
  ts?: number;
  siteId?: string;
  siteOccupancy?: number;
  zoneId?: string;
  zoneName?: string;
  zoneOccupancy?: number;
  occupancy?: number;
  count?: number;
  [key: string]: unknown;
}

export interface CrowdAlertEvent {
  ts?: number;
  eventId?: string;
  siteId?: string;
  zoneId?: string;
  zoneName?: string;
  direction?: 'entry' | 'exit' | string;
  personName?: string;
  severity?: string;
  action?: string;
  zone?: string;
  site?: string;
  message?: string;
  [key: string]: unknown;
}

@Injectable({
  providedIn: 'root'
})
export class SocketService implements OnDestroy {
  private socket?: Socket;

  private readonly occupancySubject =
    new BehaviorSubject<LiveOccupancyEvent | null>(null);

  private readonly alertSubject =
    new BehaviorSubject<CrowdAlertEvent | null>(null);

  readonly occupancy$ = this.occupancySubject.asObservable();
  readonly alerts$ = this.alertSubject.asObservable();

  constructor(private readonly zone: NgZone) {}

  connect(token: string): void {
    // Prevent connection attempts when no URL is configured.
    if (!environment.socketUrl) {
      console.warn(
        '[Socket.IO] URL is not configured. Live events are unavailable.'
      );
      return;
    }

    // Avoid creating duplicate connections.
    if (this.socket?.connected) {
      console.log('[Socket.IO] Already connected.');
      return;
    }

    // Reuse an existing socket if a connection attempt is already in progress.
    if (this.socket) {
      console.log('[Socket.IO] Connection already initialized.');
      return;
    }

    console.log('[Socket.IO] Connecting to:', environment.socketUrl);

    this.socket = io(environment.socketUrl, {
      transports: ['websocket'],
      auth: { token }
    });

    this.socket.on('connect', () => {
      console.log('[Socket.IO] Connected. Socket ID:', this.socket?.id);
    });

    this.socket.on('connect_error', (error: Error) => {
      console.error('[Socket.IO] Connection error:', error.message);
    });

    this.socket.on('disconnect', (reason: string) => {
      console.warn('[Socket.IO] Disconnected:', reason);
    });

    this.socket.on(
      'live_occupancy',
      (payload: LiveOccupancyEvent) => {
        console.log('[Socket.IO] Live occupancy received:', payload);

        this.zone.run(() => {
          this.occupancySubject.next(payload);
        });
      }
    );

    this.socket.on('alert', (payload: CrowdAlertEvent) => {
      console.log('[Socket.IO] Alert received:', payload);

      this.zone.run(() => {
        this.alertSubject.next(payload);
      });
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = undefined;

      console.log('[Socket.IO] Connection closed.');
    }
  }

  ngOnDestroy(): void {
    this.disconnect();
    this.occupancySubject.complete();
    this.alertSubject.complete();
  }
}
