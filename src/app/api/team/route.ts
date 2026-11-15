import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import {
  hasAuthCredentialsHeader,
  readAuthenticatedJsonText,
  verifyNewsWriteAuth,
  withSecurityHeaders,
} from "@/lib/newsAuth";
import { getResolvedSiteTeamData, TEAM_TAG } from "@/lib/teamStore";
import { LOCALE_COOKIE_NAME, normalizeLocale } from "@/i18n/types";
import { isPlainObject } from "@/lib/newsValidator";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Webhook payload from Lunoris Wiki may carry snapshot metadata + inline base64 avatars
const MAX_TEAM_WEBHOOK_BYTES = 10 * 1024 * 1024;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const department =
      searchParams.get("department") || searchParams.get("dept");
    const team = searchParams.get("team");
    const platform =
      searchParams.get("platform") || searchParams.get("social");
    const q = searchParams.get("q") || searchParams.get("search");
    const langParam =
      searchParams.get("lang") ||
      searchParams.get("locale") ||
      req.cookies.get(LOCALE_COOKIE_NAME)?.value;
    const lang = normalizeLocale(langParam);

    const requestedPull =
      searchParams.get("refresh") === "1" ||
      searchParams.get("pull") === "1";

    // Only honor cache-busting forcePull if valid publishing credentials are supplied
    const forcePull =
      requestedPull &&
      hasAuthCredentialsHeader(req) &&
      verifyNewsWriteAuth(req, "", {
        allowLegacyHmac: true,
        recordAttempt: false,
      }).ok;

    const resolved = await getResolvedSiteTeamData({
      forcePull,
      department,
      team,
      platform,
      q,
      lang,
    });

    return withSecurityHeaders(
      NextResponse.json(
        {
          ok: true,
          lang,
          updated_at: resolved.updated_at,
          allowed_social_platforms: resolved.allowed_social_platforms,
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
 * Webhook endpoint receiving automatic Push signals from Lunoris Wiki
 * (`POST ${LUNORIS_SITE_URL}/api/team`). Preserves `allowLegacyHmac: true` so existing
 * Wiki webhook signatures (`sha256=HMAC(secret, "<timestamp>.<rawBody>")`) continue to work alongside HMAC v2.
 */
export async function POST(req: NextRequest) {
  const bodyResult = await readAuthenticatedJsonText(
    req,
    MAX_TEAM_WEBHOOK_BYTES,
    { allowLegacyHmac: true }
  );
  if (!bodyResult.ok) {
    return bodyResult.response;
  }

  let payload: Record<string, unknown>;
  try {
    const parsed: unknown = JSON.parse(bodyResult.rawBody);
    if (!isPlainObject(parsed)) {
      throw new Error("Expected a JSON object body.");
    }
    payload = parsed;
  } catch {
    return withSecurityHeaders(
      NextResponse.json({ error: "Invalid JSON body." }, { status: 400 })
    );
  }

  try {
    revalidateTag(TEAM_TAG, { expire: 0 });
    const resolved = await getResolvedSiteTeamData({ forcePull: true });

    revalidatePath("/");
    revalidatePath("/team");

    return withSecurityHeaders(
      NextResponse.json(
        {
          ok: true,
          event:
            typeof payload.event === "string" ? payload.event : "team.updated",
          updated_at: resolved.updated_at,
          allowed_social_platforms: resolved.allowed_social_platforms,
          leaders: resolved.leaders,
          total: resolved.rosterMembers.length,
          departments: resolved.rosterDepartments,
          members: resolved.rosterMembers,
        },
        { status: 200 }
      )
    );
  } catch {
    return withSecurityHeaders(
      NextResponse.json(
        { error: "Failed to refresh team snapshot." },
        { status: 500 }
      )
    );
  }
}
