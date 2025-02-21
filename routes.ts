import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from 'multer';
import { storage } from "./storage";
import { PythonShell } from 'python-shell';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import express from 'express';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Ensure uploads directory exists
const uploadsDir = 'uploads';
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Ensure analyzed directory exists
const analyzedDir = path.join(uploadsDir, 'analyzed');
if (!fs.existsSync(analyzedDir)) {
  fs.mkdirSync(analyzedDir);
}

// Configure multer for file uploads
const upload = multer({ 
  dest: uploadsDir,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 2 // Allow only photo and video
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Serve uploaded files
  app.use('/uploads', express.static(uploadsDir));

  app.post('/api/analyze', upload.fields([
    { name: 'photo', maxCount: 1 },
    { name: 'video', maxCount: 1 }
  ]), async (req, res) => {
    try {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;

      if (!files || !files['photo']) {
        return res.status(400).json({ 
          message: "Photo is required",
          details: "Please upload a clear photo of your face"
        });
      }

      const photoPath = files['photo'][0].path;
      console.log('Processing photo:', photoPath);

      // Run Python script for facial analysis
      const options = {
        mode: 'text' as const,
        pythonPath: 'python3',
        pythonOptions: ['-u'], // Unbuffered output
        scriptPath: __dirname,
        args: [photoPath]
      };

      try {
        const results = await new Promise<string>((resolve, reject) => {
          PythonShell.run('analyze_face.py', options)
            .then(messages => {
              console.log('Python script output:', messages);
              if (messages && messages.length > 0) {
                resolve(messages[messages.length - 1]);
              } else {
                reject(new Error("No analysis results received"));
              }
            })
            .catch(err => {
              console.error('Python analysis error:', err);
              reject(err);
            });
        });

        try {
          const analysis = JSON.parse(results);

          // Check if we received an error from the Python script
          if (analysis.error) {
            throw new Error(analysis.details || analysis.error);
          }

          const savedAnalysis = await storage.createAnalysis({
            facialFeatures: analysis.facialFeatures,
            facialThirds: analysis.facialThirds,
            skinConditions: analysis.skinConditions,
            recommendations: analysis.recommendations,
            colorPalette: analysis.colorPalette,
            analyzedImagePath: analysis.analyzedImagePath
          });

          res.json(savedAnalysis);
        } catch (parseError: any) {
          console.error('Result parsing error:', parseError);
          res.status(500).json({ 
            message: "Failed to process analysis results",
            details: parseError.message
          });
        }
      } catch (analysisError: any) {
        console.error('Analysis error:', analysisError);
        res.status(500).json({ 
          message: "Analysis failed",
          details: analysisError.message
        });
      }
    } catch (error: any) {
      console.error('Server error:', error);
      res.status(500).json({ 
        message: "Server error",
        details: error instanceof Error ? error.message : "Unknown error occurred"
      });
    }
  });

  app.get('/api/analysis/latest', async (_req, res) => {
    try {
      const latestAnalysis = await storage.getLatestAnalysis();
      if (!latestAnalysis) {
        return res.status(404).json({ 
          message: "No analysis found",
          details: "Complete an assessment first to see results"
        });
      }
      res.json(latestAnalysis);
    } catch (error: any) {
      console.error('Error fetching latest analysis:', error);
      res.status(500).json({ 
        message: "Failed to fetch analysis",
        details: error instanceof Error ? error.message : "Unknown error occurred"
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}