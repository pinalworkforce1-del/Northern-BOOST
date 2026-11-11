// Northern BOOST Ready2Work — read-only enrollment gate (staging v1).
// Separate endpoint. No writes, no Pinal table access, no enrollment inference from Module 1.
import { withSupabase } from "npm:@supabase/server@1";

type R2WStatus = {
  northernJourneyFound: boolean;
  enrollmentVerified: boolean;
  regionalSaveAdapterReady: false;
  launchEnabled: false;
  reason: string;
  checkedAt: string;
};

export default {
  fetch: withSupabase({ auth: "user" }, async (_req, ctx) => {
    const uid = ctx.userClaims?.id;
    if (!uid) return Response.json({ error: "Sign-in required" }, { status: 401 });
    // Server-owned identity only. Never accept a user ID, region, or enrollment
    // assertion from request parameters, client metadata, or browser storage.
    const { data: journeys, error: je } = await ctx.supabaseAdmin
      .from("boost_journeys")
      .select("id")
      .eq("user_id", uid)
      .eq("region", "Northern Arizona")
      .limit(20);
    if (je) return Response.json({ error: "Northern journey could not be verified" }, { status: 503 });
    const ids = (journeys || []).map((j: { id: string }) => j.id);
    let approved = false;
    if (ids.length) {
      // No broad matches: approval must be staff-recorded, Northern-sourced,
      // and linked to this authenticated user's Northern journey.
      const { data: rows, error: te } = await ctx.supabaseAdmin
        .from("talentsync_participants")
        .select("source_journey_id,enrollment_approved_at")
        .eq("source_user_id", uid)
        .in("source_area", ["northern", "northern_arizona", "northern az"])
        .in("source_journey_id", ids)
        .not("enrollment_approved_at", "is", null)
        .limit(1);
      if (te) return Response.json({ error: "Staff enrollment status could not be verified" }, { status: 503 });
      approved = !!rows?.length;
    }
    // Launch stays off even when an enrollment exists, until the Northern-only
    // progress and AI handoff is implemented and independently tested.
    const body: R2WStatus = {
      northernJourneyFound: ids.length > 0,
      enrollmentVerified: approved,
      regionalSaveAdapterReady: false,
      launchEnabled: false,
      reason: !ids.length
        ? "No authenticated Northern BOOST journey found."
        : approved
          ? "Northern enrollment verified. Regional Ready2Work save adapter remains in staging."
          : "A Northern staff-approved enrollment is not currently recorded in TalentSync.",
      checkedAt: new Date().toISOString()
    };
    return Response.json(body, {
      headers: { "Cache-Control": "no-store" }
    });
  })
};
