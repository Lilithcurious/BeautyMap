import { pgTable, text, serial, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const analyses = pgTable("analyses", {
  id: serial("id").primaryKey(),
  facialFeatures: jsonb("facial_features"),
  facialThirds: jsonb("facial_thirds"),
  skinConditions: jsonb("skin_conditions"),
  recommendations: jsonb("recommendations"),
  colorPalette: jsonb("color_palette"),
  analyzedImagePath: text("analyzed_image_path"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertAnalysisSchema = createInsertSchema(analyses).omit({
  id: true,
  createdAt: true,
});

export type InsertAnalysis = z.infer<typeof insertAnalysisSchema>;
export type Analysis = typeof analyses.$inferSelect;

export const uploadSchema = z.object({
  photo: z.instanceof(File),
  video: z.instanceof(File).optional(),
});