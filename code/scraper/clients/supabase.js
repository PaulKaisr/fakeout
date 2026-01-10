import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Only create client if credentials exist (avoids crash during build/test if missing)
let supabase = null;
if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey, {
    db: { schema: "fakeout" },
  });
} else {
  console.warn(
    "Supabase credentials missing. Supabase integration will be disabled."
  );
}

/**
 * Gets a prompt that hasn't been used yet (or the one used longest ago)
 * @returns {Promise<string|null>} The prompt text or null if failed/empty
 */
export async function getNextPrompt() {
  if (!supabase) return null;

  try {
    // 1. Try to find a prompt that has NEVER been used
    let { data, error } = await supabase
      .from("search_prompts")
      .select("prompt")
      .is("last_used_at", null)
      .limit(1)
      .single();

    if (!error && data) {
      return data.prompt;
    }

    // 2. If all have been used, pick the one used least recently
    const { data: recycledData, error: recycledError } = await supabase
      .from("search_prompts")
      .select("prompt")
      .order("last_used_at", { ascending: true }) // Oldest timestamp first
      .limit(1)
      .single();

    if (recycledError) {
      console.error(
        "Error fetching recycled prompt from Supabase:",
        recycledError
      );
      return null;
    }

    return recycledData?.prompt || null;
  } catch (err) {
    console.error("Unexpected error in getNextPrompt:", err);
    return null;
  }
}

/**
 * Marks a prompt as used with the current timestamp
 * @param {string} prompt - The prompt to update
 */
export async function markPromptAsUsed(prompt) {
  if (!supabase || !prompt) return;

  try {
    const { error } = await supabase
      .from("search_prompts")
      .update({ last_used_at: new Date().toISOString() })
      .eq("prompt", prompt);

    if (error) {
      console.error(`Error marking prompt '${prompt}' as used:`, error);
    } else {
      console.log(`Successfully marked prompt '${prompt}' as used.`);
    }
  } catch (err) {
    console.error("Unexpected error in markPromptAsUsed:", err);
  }
}
