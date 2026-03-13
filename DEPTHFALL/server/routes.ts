import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Get top leaderboard entries
  app.get(api.leaderboard.list.path, async (req, res) => {
    try {
      const entries = await storage.getTopLeaderboard(10);
      res.json(entries);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch leaderboard" });
    }
  });

  // Create new leaderboard entry
  app.post(api.leaderboard.create.path, async (req, res) => {
    try {
      const input = api.leaderboard.create.input.parse(req.body);
      const entry = await storage.createLeaderboardEntry(input);
      res.status(201).json(entry);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create leaderboard entry" });
    }
  });

  return httpServer;
}
