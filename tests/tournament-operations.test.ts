import test from "node:test";
import assert from "node:assert/strict";
import { prisma } from "../src/lib/prisma";
import {
  validateBracket,
  assignTeamToSlot,
  lockBracket,
  emergencyOverrideBracket,
} from "../src/lib/services/bracket.service";
import {
  submitMatchResult,
  updateMatchStatus,
  getMatchById,
} from "../src/lib/services/match.service";
import { detectSchedulingConflicts } from "../src/lib/services/schedule.service";
import {
  canManageBracket,
  canSubmitMatchResult,
  canManageSettings,
} from "../src/lib/auth/session";
import { StaffRole, MatchStatus, TournamentStatus } from "@prisma/client";

test("Tournament Operations & Bracket Suite", async (t) => {
  const tournament = await prisma.tournament.findFirst({
    where: { slug: "mec-mlbb-2026" },
  });
  assert.ok(tournament, "Tournament should exist in test database");

  const actor = {
    id: "test-admin",
    name: "Admin Tester",
    role: "TOURNAMENT_ADMIN",
  };

  await t.test("1. RBAC Permissions Check", () => {
    assert.strictEqual(canManageBracket(StaffRole.TOURNAMENT_ADMIN), true);
    assert.strictEqual(canManageBracket(StaffRole.TOURNAMENT_DIRECTOR), true);
    assert.strictEqual(canManageBracket(StaffRole.REFEREE), false);
    assert.strictEqual(canManageBracket(StaffRole.PUBLIC), false);

    assert.strictEqual(canSubmitMatchResult(StaffRole.TOURNAMENT_ADMIN), true);
    assert.strictEqual(canSubmitMatchResult(StaffRole.REFEREE, "ref-1", "ref-1"), true);
    assert.strictEqual(canSubmitMatchResult(StaffRole.REFEREE, "ref-1", "ref-2"), false);
  });

  await t.test("2. Bracket Validation & Duplicate Rejection", async () => {
    // If slots are empty, validation should fail
    const valBefore = await validateBracket(tournament.id);
    assert.ok(valBefore.stats.totalSlots === 32, "Total slots must be 32");

    // Fetch two registered teams
    const teams = await prisma.team.findMany({
      where: { tournamentId: tournament.id },
      take: 2,
    });
    assert.strictEqual(teams.length, 2);

    // Assign team 0 to slot 1
    await assignTeamToSlot(tournament.id, 1, teams[0].id, actor);

    // Verify slot 1 has team 0
    const slot1 = await prisma.bracketSlot.findUnique({
      where: { tournamentId_slotNumber: { tournamentId: tournament.id, slotNumber: 1 } },
    });
    assert.strictEqual(slot1?.teamId, teams[0].id);

    // Re-assigning team 0 to slot 2 should clear slot 1 (uniqueness maintained)
    await assignTeamToSlot(tournament.id, 2, teams[0].id, actor);
    const slot1After = await prisma.bracketSlot.findUnique({
      where: { tournamentId_slotNumber: { tournamentId: tournament.id, slotNumber: 1 } },
    });
    const slot2After = await prisma.bracketSlot.findUnique({
      where: { tournamentId_slotNumber: { tournamentId: tournament.id, slotNumber: 2 } },
    });
    assert.strictEqual(slot1After?.teamId, null, "Old slot should be cleared to prevent duplicate");
    assert.strictEqual(slot2After?.teamId, teams[0].id, "New slot should receive team");
  });

  await t.test("3. Auto-Fill 32 Slots and Lock Bracket", async () => {
    const allTeams = await prisma.team.findMany({
      where: { tournamentId: tournament.id },
      take: 32,
    });
    assert.strictEqual(allTeams.length, 32, "Should have 32 teams");

    // Clear slots first so no team is lingering in another slot
    await prisma.bracketSlot.updateMany({
      where: { tournamentId: tournament.id },
      data: { teamId: null },
    });

    // Assign all 32 teams to slots 1..32
    for (let i = 0; i < 32; i++) {
      await prisma.bracketSlot.update({
        where: { tournamentId_slotNumber: { tournamentId: tournament.id, slotNumber: i + 1 } },
        data: { teamId: allTeams[i].id },
      });
    }

    // Now validation should succeed
    const validation = await validateBracket(tournament.id);
    assert.strictEqual(validation.isValid, true, "Bracket should be valid with 32 unique teams");
    assert.strictEqual(validation.stats.filledSlots, 32);
    assert.strictEqual(validation.stats.uniqueTeams, 32);

    // Lock bracket
    const locked = await lockBracket(tournament.id, actor);
    assert.strictEqual(locked.status, TournamentStatus.BRACKET_LOCKED);

    // Verify Round of 32 Matches (M01..M16) are populated with teams
    const m01 = await prisma.match.findUnique({
      where: { tournamentId_matchNumber: { tournamentId: tournament.id, matchNumber: 1 } },
      include: { teamA: true, teamB: true },
    });
    assert.ok(m01?.teamAId, "M01 Team A should be set from Slot 1");
    assert.ok(m01?.teamBId, "M01 Team B should be set from Slot 2");

    // Attempting to assign a slot while locked should throw error
    await assert.rejects(
      async () => {
        await assignTeamToSlot(tournament.id, 1, allTeams[1].id, actor);
      },
      /Cannot modify a locked bracket/,
      "Should reject editing a locked bracket"
    );
  });

  await t.test("4. Automated Progression (M01 Winner advances to M17 Team A)", async () => {
    const m01 = await prisma.match.findUnique({
      where: { tournamentId_matchNumber: { tournamentId: tournament.id, matchNumber: 1 } },
    });
    assert.ok(m01 && m01.teamAId && m01.teamBId);

    // Submit result for M01: Team A wins 2 - 1
    const result = await submitMatchResult(
      m01.id,
      {
        scoreA: 2,
        scoreB: 1,
        winnerId: m01.teamAId,
        notes: "Uji coba kemenangan M01",
        confirmedOfficial: true,
      },
      actor
    );

    assert.strictEqual(result.match.status, MatchStatus.COMPLETED);
    assert.strictEqual(result.match.winnerId, m01.teamAId);

    // Verify M17 has received the winner into Team A slot!
    const m17 = await prisma.match.findUnique({
      where: { tournamentId_matchNumber: { tournamentId: tournament.id, matchNumber: 17 } },
    });
    assert.strictEqual(
      m17?.teamAId,
      m01.teamAId,
      "M17 Team A should be automatically populated with M01 winner"
    );
  });

  await t.test("5. Conflict Detection Engine (Venue & Staff Overlaps)", async () => {
    const venue = await prisma.venue.findFirst({ where: { tournamentId: tournament.id } });
    const referee = await prisma.staff.findFirst({
      where: { tournamentId: tournament.id, role: StaffRole.REFEREE },
    });
    assert.ok(venue && referee);

    const testTime = new Date("2026-09-20T14:00:00+07:00");

    // Assign M02 to this venue and referee at testTime
    const m02 = await prisma.match.findUnique({
      where: { tournamentId_matchNumber: { tournamentId: tournament.id, matchNumber: 2 } },
    });
    assert.ok(m02);

    await prisma.match.update({
      where: { id: m02.id },
      data: {
        scheduledAt: testTime,
        venueId: venue.id,
        refereeId: referee.id,
        status: MatchStatus.SCHEDULED,
      },
    });

    // Check conflict for M03 at the same time and venue/referee
    const m03 = await prisma.match.findUnique({
      where: { tournamentId_matchNumber: { tournamentId: tournament.id, matchNumber: 3 } },
    });
    assert.ok(m03);

    const conflicts = await detectSchedulingConflicts({
      tournamentId: tournament.id,
      matchId: m03.id,
      scheduledAt: new Date("2026-09-20T14:15:00+07:00"), // 15 mins later (inside 45-min window)
      venueId: venue.id,
      refereeId: referee.id,
    });

    assert.ok(conflicts.length >= 2, "Should detect at least 2 conflicts (venue and referee)");
    const venueConflict = conflicts.find((c) => c.type === "VENUE");
    const refereeConflict = conflicts.find((c) => c.type === "REFEREE");
    assert.ok(venueConflict, "Venue conflict must be detected");
    assert.ok(refereeConflict, "Referee conflict must be detected");
  });

  await t.test("6. Audit Log Append-Only Integrity", async () => {
    const logs = await prisma.auditLog.findMany({
      where: { tournamentId: tournament.id },
      orderBy: { createdAt: "desc" },
    });
    assert.ok(logs.length > 0, "Audit logs should record all operations");

    const lockLog = logs.find((l) => l.action === "BRACKET_LOCKED");
    assert.ok(lockLog, "BRACKET_LOCKED action should be present in audit log");

    const resultLog = logs.find((l) => l.action === "RESULT_SUBMITTED");
    assert.ok(resultLog, "RESULT_SUBMITTED action should be present in audit log");
  });
});
