import { z } from 'zod';
import { insertLeaderboardSchema, leaderboard } from './schema';

export const api = {
  leaderboard: {
    list: {
      method: 'GET' as const,
      path: '/api/leaderboard' as const,
      responses: {
        200: z.array(z.custom<typeof leaderboard.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/leaderboard' as const,
      input: insertLeaderboardSchema,
      responses: {
        201: z.custom<typeof leaderboard.$inferSelect>(),
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
