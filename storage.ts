import { analyses, type Analysis, type InsertAnalysis } from "@shared/schema";

export interface IStorage {
  createAnalysis(analysis: InsertAnalysis): Promise<Analysis>;
  getAnalysis(id: number): Promise<Analysis | undefined>;
  getLatestAnalysis(): Promise<Analysis | undefined>;
}

export class MemStorage implements IStorage {
  private analyses: Map<number, Analysis>;
  private currentId: number;

  constructor() {
    this.analyses = new Map();
    this.currentId = 1;
  }

  async createAnalysis(insertAnalysis: InsertAnalysis): Promise<Analysis> {
    const id = this.currentId++;
    const analysis: Analysis = {
      id,
      facialFeatures: insertAnalysis.facialFeatures || [],
      recommendations: insertAnalysis.recommendations || [],
      createdAt: new Date()
    };
    this.analyses.set(id, analysis);
    return analysis;
  }

  async getAnalysis(id: number): Promise<Analysis | undefined> {
    return this.analyses.get(id);
  }

  async getLatestAnalysis(): Promise<Analysis | undefined> {
    if (this.analyses.size === 0) {
      return undefined;
    }

    // Get the analysis with the highest ID (most recent)
    const latestId = Math.max(...Array.from(this.analyses.keys()));
    return this.analyses.get(latestId);
  }
}

export const storage = new MemStorage();