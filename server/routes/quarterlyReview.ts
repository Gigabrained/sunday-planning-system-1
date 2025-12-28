import { Router } from "express";
import { db } from "../db";
import { requireAuth } from "../_core/authMiddleware";
import { 
  quarterlyReviews, 
  emotionalAlchemy, 
  lifeInventory, 
  letters,
  quarterlyVisionRatings,
  manifestationStatesCustom,
  dailyAffirmations,
  audioRecordings,
  actionHighlights,
  slackAutomationSettings
} from "../../drizzle/schema";
import { eq, and, desc } from "drizzle-orm";

const router = Router();

// All routes require authentication
router.use(requireAuth);

/**
 * Get or create a quarterly review for a specific quarter
 */
router.get("/:quarter/:year", async (req, res) => {
  try {
    const { quarter, year } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const quarterStr = `${quarter} ${year}`;
    const quarterNumber = parseInt(quarter.replace('Q', ''));

    // Try to find existing review
    let review = await db.select()
      .from(quarterlyReviews)
      .where(and(
        eq(quarterlyReviews.userId, userId),
        eq(quarterlyReviews.quarter, quarterStr)
      ))
      .limit(1);

    // Create if doesn't exist
    if (review.length === 0) {
      review = await db.insert(quarterlyReviews)
        .values({
          userId,
          quarter: quarterStr,
          year: parseInt(year),
          quarterNumber,
        })
        .returning();
    }

    res.json(review[0]);
  } catch (error) {
    console.error("Error getting quarterly review:", error);
    res.status(500).json({ error: "Failed to get quarterly review" });
  }
});

/**
 * Emotional Alchemy - Get all sessions for a review
 */
router.get("/:reviewId/emotional-alchemy", async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const sessions = await db.select()
      .from(emotionalAlchemy)
      .where(and(
        eq(emotionalAlchemy.reviewId, parseInt(reviewId)),
        eq(emotionalAlchemy.userId, userId)
      ))
      .orderBy(desc(emotionalAlchemy.createdAt));

    res.json(sessions);
  } catch (error) {
    console.error("Error getting emotional alchemy:", error);
    res.status(500).json({ error: "Failed to get emotional alchemy sessions" });
  }
});

/**
 * Emotional Alchemy - Create new session
 */
router.post("/:reviewId/emotional-alchemy", async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user?.id;
    const { emotion, bodySensation, thoughtPattern, transformation } = req.body;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const session = await db.insert(emotionalAlchemy)
      .values({
        reviewId: parseInt(reviewId),
        userId,
        emotion,
        bodySensation,
        thoughtPattern,
        transformation,
      })
      .returning();

    res.json(session[0]);
  } catch (error) {
    console.error("Error creating emotional alchemy:", error);
    res.status(500).json({ error: "Failed to create emotional alchemy session" });
  }
});

/**
 * Emotional Alchemy - Delete session
 */
router.delete("/emotional-alchemy/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    await db.delete(emotionalAlchemy)
      .where(and(
        eq(emotionalAlchemy.id, parseInt(id)),
        eq(emotionalAlchemy.userId, userId)
      ));

    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting emotional alchemy:", error);
    res.status(500).json({ error: "Failed to delete emotional alchemy session" });
  }
});

/**
 * Life Inventory - Get all periods for a review
 */
router.get("/:reviewId/life-inventory", async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const inventory = await db.select()
      .from(lifeInventory)
      .where(and(
        eq(lifeInventory.reviewId, parseInt(reviewId)),
        eq(lifeInventory.userId, userId)
      ))
      .orderBy(lifeInventory.createdAt);

    res.json(inventory);
  } catch (error) {
    console.error("Error getting life inventory:", error);
    res.status(500).json({ error: "Failed to get life inventory" });
  }
});

/**
 * Life Inventory - Save or update period
 */
router.post("/:reviewId/life-inventory", async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user?.id;
    const { id, lifePeriod, resentments, fears, harms, patterns, amendsNeeded } = req.body;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (id) {
      // Update existing
      const updated = await db.update(lifeInventory)
        .set({ resentments, fears, harms, patterns, amendsNeeded, updatedAt: new Date() })
        .where(and(
          eq(lifeInventory.id, id),
          eq(lifeInventory.userId, userId)
        ))
        .returning();
      
      res.json(updated[0]);
    } else {
      // Create new
      const created = await db.insert(lifeInventory)
        .values({
          reviewId: parseInt(reviewId),
          userId,
          lifePeriod,
          resentments,
          fears,
          harms,
          patterns,
          amendsNeeded,
        })
        .returning();
      
      res.json(created[0]);
    }
  } catch (error) {
    console.error("Error saving life inventory:", error);
    res.status(500).json({ error: "Failed to save life inventory" });
  }
});

/**
 * Letters - Get all letters for a review
 */
router.get("/:reviewId/letters", async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const allLetters = await db.select()
      .from(letters)
      .where(and(
        eq(letters.reviewId, parseInt(reviewId)),
        eq(letters.userId, userId)
      ))
      .orderBy(desc(letters.createdAt));

    res.json(allLetters);
  } catch (error) {
    console.error("Error getting letters:", error);
    res.status(500).json({ error: "Failed to get letters" });
  }
});

/**
 * Letters - Create new letter
 */
router.post("/:reviewId/letters", async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user?.id;
    const { letterType, recipientName, content } = req.body;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const letter = await db.insert(letters)
      .values({
        reviewId: parseInt(reviewId),
        userId,
        letterType,
        recipientName,
        content,
        status: "pending",
      })
      .returning();

    res.json(letter[0]);
  } catch (error) {
    console.error("Error creating letter:", error);
    res.status(500).json({ error: "Failed to create letter" });
  }
});

/**
 * Letters - Update letter
 */
router.put("/letters/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const { content, recipientName } = req.body;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const updated = await db.update(letters)
      .set({ content, recipientName, updatedAt: new Date() })
      .where(and(
        eq(letters.id, parseInt(id)),
        eq(letters.userId, userId)
      ))
      .returning();

    res.json(updated[0]);
  } catch (error) {
    console.error("Error updating letter:", error);
    res.status(500).json({ error: "Failed to update letter" });
  }
});

/**
 * Letters - Update status
 */
router.patch("/letters/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const { status } = req.body;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const updated = await db.update(letters)
      .set({ status, updatedAt: new Date() })
      .where(and(
        eq(letters.id, parseInt(id)),
        eq(letters.userId, userId)
      ))
      .returning();

    res.json(updated[0]);
  } catch (error) {
    console.error("Error updating letter status:", error);
    res.status(500).json({ error: "Failed to update letter status" });
  }
});

/**
 * Letters - Delete letter
 */
router.delete("/letters/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    await db.delete(letters)
      .where(and(
        eq(letters.id, parseInt(id)),
        eq(letters.userId, userId)
      ));

    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting letter:", error);
    res.status(500).json({ error: "Failed to delete letter" });
  }
});

/**
 * Vision Ratings - Get ratings for a review
 */
router.get("/:reviewId/vision-ratings", async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const ratings = await db.select()
      .from(quarterlyVisionRatings)
      .where(and(
        eq(quarterlyVisionRatings.reviewId, parseInt(reviewId)),
        eq(quarterlyVisionRatings.userId, userId)
      ))
      .limit(1);

    res.json(ratings.length > 0 ? ratings[0] : null);
  } catch (error) {
    console.error("Error getting vision ratings:", error);
    res.status(500).json({ error: "Failed to get vision ratings" });
  }
});

/**
 * Vision Ratings - Save ratings
 */
router.post("/:reviewId/vision-ratings", async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user?.id;
    const ratingsData = req.body;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Check if ratings exist
    const existing = await db.select()
      .from(quarterlyVisionRatings)
      .where(and(
        eq(quarterlyVisionRatings.reviewId, parseInt(reviewId)),
        eq(quarterlyVisionRatings.userId, userId)
      ))
      .limit(1);

    if (existing.length > 0) {
      // Update
      const updated = await db.update(quarterlyVisionRatings)
        .set({ ...ratingsData, updatedAt: new Date() })
        .where(eq(quarterlyVisionRatings.id, existing[0].id))
        .returning();
      
      res.json(updated[0]);
    } else {
      // Create
      const created = await db.insert(quarterlyVisionRatings)
        .values({
          reviewId: parseInt(reviewId),
          userId,
          ...ratingsData,
        })
        .returning();
      
      res.json(created[0]);
    }
  } catch (error) {
    console.error("Error saving vision ratings:", error);
    res.status(500).json({ error: "Failed to save vision ratings" });
  }
});

/**
 * Daily Affirmations - Get all
 */
router.get("/affirmations", async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const affirmations = await db.select()
      .from(dailyAffirmations)
      .where(eq(dailyAffirmations.userId, userId))
      .orderBy(dailyAffirmations.sortOrder);

    res.json(affirmations);
  } catch (error) {
    console.error("Error getting affirmations:", error);
    res.status(500).json({ error: "Failed to get affirmations" });
  }
});

/**
 * Daily Affirmations - Add
 */
router.post("/affirmations", async (req, res) => {
  try {
    const userId = req.user?.id;
    const { affirmationText, sortOrder } = req.body;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const affirmation = await db.insert(dailyAffirmations)
      .values({
        userId,
        affirmationText,
        sortOrder: sortOrder || 0,
      })
      .returning();

    res.json(affirmation[0]);
  } catch (error) {
    console.error("Error creating affirmation:", error);
    res.status(500).json({ error: "Failed to create affirmation" });
  }
});

/**
 * Daily Affirmations - Update
 */
router.put("/affirmations/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const { affirmationText, sortOrder } = req.body;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const updated = await db.update(dailyAffirmations)
      .set({ affirmationText, sortOrder, updatedAt: new Date() })
      .where(and(
        eq(dailyAffirmations.id, parseInt(id)),
        eq(dailyAffirmations.userId, userId)
      ))
      .returning();

    res.json(updated[0]);
  } catch (error) {
    console.error("Error updating affirmation:", error);
    res.status(500).json({ error: "Failed to update affirmation" });
  }
});

/**
 * Daily Affirmations - Delete
 */
router.delete("/affirmations/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    await db.delete(dailyAffirmations)
      .where(and(
        eq(dailyAffirmations.id, parseInt(id)),
        eq(dailyAffirmations.userId, userId)
      ));

    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting affirmation:", error);
    res.status(500).json({ error: "Failed to delete affirmation" });
  }
});

/**
 * Action Highlights - Get all for a review
 */
router.get("/:reviewId/action-highlights", async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const highlights = await db.select()
      .from(actionHighlights)
      .where(and(
        eq(actionHighlights.reviewId, parseInt(reviewId)),
        eq(actionHighlights.userId, userId)
      ))
      .orderBy(actionHighlights.highlightNumber);

    res.json(highlights);
  } catch (error) {
    console.error("Error getting action highlights:", error);
    res.status(500).json({ error: "Failed to get action highlights" });
  }
});

/**
 * Action Highlights - Save all highlights
 */
router.post("/:reviewId/action-highlights", async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user?.id;
    const { highlights } = req.body;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Delete existing highlights for this review
    await db.delete(actionHighlights)
      .where(and(
        eq(actionHighlights.reviewId, parseInt(reviewId)),
        eq(actionHighlights.userId, userId)
      ));

    // Insert new highlights
    if (highlights && highlights.length > 0) {
      const values = highlights.map((h: any) => ({
        reviewId: parseInt(reviewId),
        userId,
        highlightNumber: h.highlightNumber,
        whatHappened: h.whatHappened,
        whyHow: h.whyHow,
        nextStep: h.nextStep,
      }));

      const created = await db.insert(actionHighlights)
        .values(values)
        .returning();

      res.json(created);
    } else {
      res.json([]);
    }
  } catch (error) {
    console.error("Error saving action highlights:", error);
    res.status(500).json({ error: "Failed to save action highlights" });
  }
});

/**
 * Audio - Get latest recording by type
 */
router.get("/audio/latest/:recordingType", async (req, res) => {
  try {
    const { recordingType } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const recording = await db.select()
      .from(audioRecordings)
      .where(and(
        eq(audioRecordings.userId, userId),
        eq(audioRecordings.recordingType, recordingType),
        eq(audioRecordings.isLatest, true)
      ))
      .limit(1);

    if (recording.length > 0) {
      res.json(recording[0]);
    } else {
      res.status(404).json({ error: "No recording found" });
    }
  } catch (error) {
    console.error("Error getting latest recording:", error);
    res.status(500).json({ error: "Failed to get latest recording" });
  }
});

/**
 * Audio - Get all recordings
 */
router.get("/audio/recordings", async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const recordings = await db.select()
      .from(audioRecordings)
      .where(eq(audioRecordings.userId, userId))
      .orderBy(desc(audioRecordings.createdAt));

    res.json(recordings);
  } catch (error) {
    console.error("Error getting recordings:", error);
    res.status(500).json({ error: "Failed to get recordings" });
  }
});

/**
 * Audio - Delete recording
 */
router.delete("/audio/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // TODO: Also delete from S3
    await db.delete(audioRecordings)
      .where(and(
        eq(audioRecordings.id, parseInt(id)),
        eq(audioRecordings.userId, userId)
      ));

    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting recording:", error);
    res.status(500).json({ error: "Failed to delete recording" });
  }
});

/**
 * Slack Settings - Get
 */
router.get("/slack/settings", async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const settings = await db.select()
      .from(slackAutomationSettings)
      .where(eq(slackAutomationSettings.userId, userId))
      .limit(1);

    res.json(settings.length > 0 ? settings[0] : null);
  } catch (error) {
    console.error("Error getting slack settings:", error);
    res.status(500).json({ error: "Failed to get slack settings" });
  }
});

/**
 * Slack Settings - Save
 */
router.post("/slack/settings", async (req, res) => {
  try {
    const userId = req.user?.id;
    const { webhookUrl, sendTime, isEnabled } = req.body;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Check if settings exist
    const existing = await db.select()
      .from(slackAutomationSettings)
      .where(eq(slackAutomationSettings.userId, userId))
      .limit(1);

    if (existing.length > 0) {
      // Update
      const updated = await db.update(slackAutomationSettings)
        .set({ webhookUrl, sendTime, isEnabled, updatedAt: new Date() })
        .where(eq(slackAutomationSettings.id, existing[0].id))
        .returning();
      
      res.json(updated[0]);
    } else {
      // Create
      const created = await db.insert(slackAutomationSettings)
        .values({
          userId,
          webhookUrl,
          sendTime,
          isEnabled,
        })
        .returning();
      
      res.json(created[0]);
    }
  } catch (error) {
    console.error("Error saving slack settings:", error);
    res.status(500).json({ error: "Failed to save slack settings" });
  }
});

export default router;
