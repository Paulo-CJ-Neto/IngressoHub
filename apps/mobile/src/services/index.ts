export { eventsService } from './eventsService';
export { ticketsService } from './ticketsService';
export { usersService } from './usersService';
export { default as api } from './api';
export { authService } from './authService';
export { SocialAuthService } from './socialAuthService';

// Re-export interfaces for convenience
export type { EventsService } from './eventsService';
export type { TicketsService } from './ticketsService';
export type { UsersService } from './usersService';

// Export examples for testing
export * from './examples';
