import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import {
  readAuthenticatedJsonText,
  withSecurityHeaders,
} from "@/lib/newsAuth";
import {
  getResolvedSiteTeamData,
  saveTeamSnapshot,
} from "@/lib/teamStore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// 10 MB limit to accommodate inline base64 avatar fallbacks when pushed from local dev
const MAX_TEAM_WEBHOOK_BYTES = 10 * 1024 * 1024;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const department = searchParams.get("department");
    const q = searchParams.get("q");
    const forcePull =
      searchParams.get("refresh") === "1" ||
      searchParams.get("pull") === "1";

    const resolved = await getResolvedSiteTeamData({
      forcePull,
      department,
      q,
    });

    return withSecurityHeaders(
      NextResponse.json(
        {
          ok: true,
          updated_at: resolved.updated_at,
          leaders: resolved.leaders,
          total: resolved.rosterMembers.length,
          departments: resolved.rosterDepartments,
          members: resolved.rosterMembers,
          allPublicMembers: resolved.allPublicMembers,
        },
        {
          status: 200,
          headers: { "Cache-Control": "no-store" },
        }
      )
    );
  } catch {
    return withSecurityHeaders(
      NextResponse.json(
        { error: "Failed to load team roster." },
        { status: 500 }
      )
    );
  }
}

/**
 * Webhook endpoint receiving automatic Push updates from Lunoris Wiki
 * (`POST ${LUNORIS_SITE_URL}/api/team`) whenever a team member toggles `public`,
 * uploads a new `avatar_url`, or updates their `bio` / `title`.
 */
export async function POST(req: NextRequest) {
  const bodyResult = await readAuthenticatedJsonText(
    req,
    MAX_TEAM_WEBHOOK_BYTES
  );
  if (!bodyResult.ok) {
    return bodyResult.response;
  }

  let payload: Record<string, unknown>;
  try {
    const parsed = JSON.parse(bodyResult.rawBody);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      throw new Error("Expected a JSON object body.");
    }
    payload = parsed as Record<string, unknown>;
  } catch {
    return withSecurityHeaders(
      NextResponse.json({ error: "Invalid JSON body." }, { status: 400 })
    );
  }

  try {
    await saveTeamSnapshot(payload);
    const resolved = await getResolvedSiteTeamData();

    // Immediately revalidate both the Main Landing Page (/#team) and /team
    revalidatePath("/");
    revalidatePath("/team");

    return withSecurityHeaders(
      NextResponse.json(
        {
          ok: true,
          event: payload.event || "team.updated",
          updated_at: resolved.updated_at,
          leaders: resolved.leaders,
          total: resolved.rosterMembers.length,
          departments: resolved.rosterDepartments,
          members: resolved.rosterMembers,
        },
        { status: 200 }
      )
    );
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to save team snapshot.";
    return withSecurityHeaders(
      NextResponse.json({ error: message }, { status: 400 })
    );
  }
}
