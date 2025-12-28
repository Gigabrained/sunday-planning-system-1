import { Router } from "express";
import { db } from "../db";
import { sql } from "drizzle-orm";
import fs from "fs";
import path from "path";

const router = Router();

/**
 * ONE-TIME MIGRATION ENDPOINT
 * Run this once to create quarterly review tables, then this file will be deleted
 * 
 * Usage: POST /api/run-migration-quarterly-review
 * Body: { "secret": "your-secret-key" }
 */
router.post("/run-migration-quarterly-review", async (req, res) => {
  try {
    // Security check - require secret key
    const { secret } = req.body;
    const expectedSecret = process.env.MIGRATION_SECRET || "quarterly-review-2025";
    
    if (secret !== expectedSecret) {
      return res.status(401).json({ 
        error: "Unauthorized",
        message: "Invalid secret key" 
      });
    }

    console.log("[Migration] Starting quarterly review migration...");

    // Read the SQL migration file
    const migrationPath = path.join(__dirname, "../../drizzle/0017_quarterly_review.sql");
    const migrationSQL = fs.readFileSync(migrationPath, "utf-8");

    // Split by semicolons and execute each statement
    const statements = migrationSQL
      .split(";")
      .map(s => s.trim())
      .filter(s => s.length > 0);

    console.log(`[Migration] Found ${statements.length} SQL statements to execute`);

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      console.log(`[Migration] Executing statement ${i + 1}/${statements.length}`);
      
      try {
        await db.execute(sql.raw(statement));
      } catch (error: any) {
        // Ignore "already exists" errors
        if (error.message && error.message.includes("already exists")) {
          console.log(`[Migration] Table already exists, skipping...`);
        } else {
          throw error;
        }
      }
    }

    console.log("[Migration] Migration completed successfully!");

    // Delete this migration file after successful execution
    const thisFilePath = __filename;
    setTimeout(() => {
      try {
        fs.unlinkSync(thisFilePath);
        console.log("[Migration] Migration endpoint file deleted");
      } catch (error) {
        console.error("[Migration] Failed to delete migration file:", error);
      }
    }, 5000); // Wait 5 seconds before deleting

    res.json({ 
      success: true,
      message: "Quarterly review migration completed successfully!",
      tablesCreated: [
        "quarterly_reviews",
        "emotional_alchemy",
        "life_inventory",
        "letters",
        "quarterly_vision_ratings",
        "manifestation_states_custom",
        "daily_affirmations",
        "audio_recordings",
        "action_highlights",
        "slack_automation_settings"
      ],
      note: "This migration endpoint will be automatically deleted in 5 seconds"
    });

  } catch (error) {
    console.error("[Migration] Error running migration:", error);
    res.status(500).json({ 
      error: "Migration failed",
      message: error instanceof Error ? error.message : String(error)
    });
  }
});

export default router;
