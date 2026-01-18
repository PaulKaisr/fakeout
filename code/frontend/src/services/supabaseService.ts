import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;

export const supabase =
  supabaseUrl && supabaseKey
    ? createClient(supabaseUrl, supabaseKey, { db: { schema: "fakeout" } })
    : null;

export const supabaseService = {
  async trackVisitor() {
    if (!supabase) return;

    // Check session storage to avoid duplicate hits on refresh
    const sessionKey = "fakeout_visitor_tracked";
    if (sessionStorage.getItem(sessionKey)) return;

    try {
      const { error } = await supabase.from("analytics_visitors").insert({});
      if (!error) {
        sessionStorage.setItem(sessionKey, "true");
        console.debug("Visitor tracked");
      } else {
        console.warn("Error tracking visitor:", error);
      }
    } catch (e) {
      console.warn("Exception tracking visitor:", e);
    }
  },

  async trackGameStart(mode: "image" | "video", date: string) {
    if (!supabase) return;
    try {
      const { error } = await supabase
        .from("analytics_game_starts")
        .insert({ mode, game_date: date });

      if (error) console.warn("Error tracking game start:", error);
    } catch (e) {
      console.warn("Exception tracking game start:", e);
    }
  },

  async trackGuess(
    pairId: string,
    mode: "image" | "video",
    isCorrect: boolean,
  ) {
    if (!supabase) return;
    try {
      const { error } = await supabase.from("analytics_guesses").insert({
        pair_id: pairId,
        mode,
        is_correct: isCorrect,
      });

      if (error) console.warn("Error tracking guess:", error);
    } catch (e) {
      console.warn("Exception tracking guess:", e);
    }
  },

  async getGuessPercentage(pairId: string): Promise<number | null> {
    if (!supabase) return null;
    try {
      // Get total guesses
      const { count: total, error: totalError } = await supabase
        .from("analytics_guesses")
        .select("*", { count: "exact", head: true })
        .eq("pair_id", pairId);

      if (totalError || total === null || total === 0) return null;

      // Get correct guesses
      const { count: correct, error: correctError } = await supabase
        .from("analytics_guesses")
        .select("*", { count: "exact", head: true })
        .eq("pair_id", pairId)
        .eq("is_correct", true);

      if (correctError || correct === null) return null;

      return Math.round((correct / total) * 100);
    } catch (e) {
      console.warn("Exception fetching guess stats:", e);
      return null;
    }
  },
  async getGamePlayCount(
    mode: "image" | "video",
    date: string,
  ): Promise<number> {
    if (!supabase) return 0;
    try {
      const { count, error } = await supabase
        .from("analytics_game_starts")
        .select("*", { count: "exact", head: true })
        .eq("mode", mode)
        .eq("game_date", date);

      if (error) {
        console.warn("Error fetching game play count:", error);
        return 0;
      }

      return count || 0;
    } catch (e) {
      console.warn("Exception fetching game play count:", e);
      return 0;
    }
  },
};
