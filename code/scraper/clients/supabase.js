import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const DEFAULT_SCHEMA = "fakeout";

// Cache clients per schema to avoid recreating them
const clientCache = new Map();

/**
 * Gets (or creates) a Supabase client for the given schema
 * @param {string} schema - The database schema to use
 * @returns {import("@supabase/supabase-js").SupabaseClient|null}
 */
function getClient(schema = DEFAULT_SCHEMA) {
  if (!supabaseUrl || !supabaseKey) {
    console.warn(
      "Supabase credentials missing. Supabase integration will be disabled."
    );
    return null;
  }

  if (!clientCache.has(schema)) {
    clientCache.set(
      schema,
      createClient(supabaseUrl, supabaseKey, {
        db: { schema },
      })
    );
  }

  return clientCache.get(schema);
}

/**
 * Gets a prompt that hasn't been used yet for the specific mode (or the one used longest ago)
 * @param {string} mode - "video" or "image"
 * @param {string} schema - The database schema to use
 * @returns {Promise<string|null>} The prompt text or null if failed/empty
 */
export async function getNextPrompt(mode = "video", schema = DEFAULT_SCHEMA) {
  const supabase = getClient(schema);
  if (!supabase) return null;

  const column = mode === "image" ? "last_used_image_at" : "last_used_video_at";

  try {
    // 1. Try to find a prompt that has NEVER been used for this mode
    let { data, error } = await supabase
      .from("search_prompts")
      .select("prompt")
      .is(column, null)
      .limit(1)
      .single();

    if (!error && data) {
      return data.prompt;
    }

    // 2. If all have been used, pick the one used least recently for this mode
    const { data: recycledData, error: recycledError } = await supabase
      .from("search_prompts")
      .select("prompt")
      .order(column, { ascending: true }) // Oldest timestamp first
      .limit(1)
      .single();

    if (recycledError) {
      console.error(
        `Error fetching recycled prompt for ${mode} from Supabase:`,
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
 * Marks a prompt as used with the current timestamp for the specific mode
 * @param {string} prompt - The prompt to update
 * @param {string} mode - "video" or "image"
 * @param {string} schema - The database schema to use
 */
export async function markPromptAsUsed(prompt, mode = "video", schema = DEFAULT_SCHEMA) {
  const supabase = getClient(schema);
  if (!supabase || !prompt) return;

  const column = mode === "image" ? "last_used_image_at" : "last_used_video_at";

  try {
    const { error } = await supabase
      .from("search_prompts")
      .update({ [column]: new Date().toISOString() })
      .eq("prompt", prompt);

    if (error) {
      console.error(
        `Error marking prompt '${prompt}' as used for ${mode}:`,
        error
      );
    } else {
      console.log(
        `Successfully marked prompt '${prompt}' as used for ${mode}.`
      );
    }
  } catch (err) {
    console.error("Unexpected error in markPromptAsUsed:", err);
  }
}
