import { db } from "./db";
import { leaderboard, type InsertLeaderboard, type LeaderboardEntry } from "@shared/schema";
import { desc } from "drizzle-orm";

export interface IStorage {
  getTopLeaderboard(limit?: number): Promise<LeaderboardEntry[]>;
  createLeaderboardEntry(entry: InsertLeaderboard): Promise<LeaderboardEntry>;
}

// In-memory fallback storage for development without database
const mockLeaderboardEntries: LeaderboardEntry[] = [
  { id: 1, playerName: "Deep Diver", depthReached: 5000 },
  { id: 2, playerName: "Ocean Explorer", depthReached: 4500 },
  { id: 3, playerName: "Abyss Seeker", depthReached: 4000 },
];

let nextMockId = 4;

class DatabaseStorage implements IStorage {
  async getTopLeaderboard(limit: number = 10): Promise<LeaderboardEntry[]> {
    if (!db) {
      return mockLeaderboardEntries.slice(0, limit);
    }
    return await db.select().from(leaderboard).orderBy(desc(leaderboard.depthReached)).limit(limit);
  }

  async createLeaderboardEntry(entry: InsertLeaderboard): Promise<LeaderboardEntry> {
    if (!db) {
      const newEntry: LeaderboardEntry = {
        id: nextMockId++,
        ...entry,
      };
      mockLeaderboardEntries.push(newEntry);
      mockLeaderboardEntries.sort((a, b) => b.depthReached - a.depthReached);
      return newEntry;
    }
    const [newEntry] = await db.insert(leaderboard).values(entry).returning();
    return newEntry;
  }
}

export const storage = new DatabaseStorage();
