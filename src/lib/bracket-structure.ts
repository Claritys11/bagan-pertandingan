import { MatchRound, BracketSide, NextMatchSlot } from "@prisma/client";

export interface BracketMatchDefinition {
  matchNumber: number;
  matchCode: string;
  round: MatchRound;
  roundPosition: number;
  bracketSide: BracketSide;
  nextMatchNumber: number | null;
  nextMatchSlot: NextMatchSlot | null;
  previousMatchANumber: number | null;
  previousMatchBNumber: number | null;
  slotANumber?: number;
  slotBNumber?: number;
}

export const BRACKET_STRUCTURE: BracketMatchDefinition[] = [
  // Round of 32 (Matches 1 to 16)
  // Left Side (M01 - M08)
  { matchNumber: 1, matchCode: "M01", round: MatchRound.ROUND_OF_32, roundPosition: 1, bracketSide: BracketSide.LEFT, nextMatchNumber: 17, nextMatchSlot: NextMatchSlot.TEAM_A, previousMatchANumber: null, previousMatchBNumber: null, slotANumber: 1, slotBNumber: 2 },
  { matchNumber: 2, matchCode: "M02", round: MatchRound.ROUND_OF_32, roundPosition: 2, bracketSide: BracketSide.LEFT, nextMatchNumber: 17, nextMatchSlot: NextMatchSlot.TEAM_B, previousMatchANumber: null, previousMatchBNumber: null, slotANumber: 3, slotBNumber: 4 },
  { matchNumber: 3, matchCode: "M03", round: MatchRound.ROUND_OF_32, roundPosition: 3, bracketSide: BracketSide.LEFT, nextMatchNumber: 18, nextMatchSlot: NextMatchSlot.TEAM_A, previousMatchANumber: null, previousMatchBNumber: null, slotANumber: 5, slotBNumber: 6 },
  { matchNumber: 4, matchCode: "M04", round: MatchRound.ROUND_OF_32, roundPosition: 4, bracketSide: BracketSide.LEFT, nextMatchNumber: 18, nextMatchSlot: NextMatchSlot.TEAM_B, previousMatchANumber: null, previousMatchBNumber: null, slotANumber: 7, slotBNumber: 8 },
  { matchNumber: 5, matchCode: "M05", round: MatchRound.ROUND_OF_32, roundPosition: 5, bracketSide: BracketSide.LEFT, nextMatchNumber: 19, nextMatchSlot: NextMatchSlot.TEAM_A, previousMatchANumber: null, previousMatchBNumber: null, slotANumber: 9, slotBNumber: 10 },
  { matchNumber: 6, matchCode: "M06", round: MatchRound.ROUND_OF_32, roundPosition: 6, bracketSide: BracketSide.LEFT, nextMatchNumber: 19, nextMatchSlot: NextMatchSlot.TEAM_B, previousMatchANumber: null, previousMatchBNumber: null, slotANumber: 11, slotBNumber: 12 },
  { matchNumber: 7, matchCode: "M07", round: MatchRound.ROUND_OF_32, roundPosition: 7, bracketSide: BracketSide.LEFT, nextMatchNumber: 20, nextMatchSlot: NextMatchSlot.TEAM_A, previousMatchANumber: null, previousMatchBNumber: null, slotANumber: 13, slotBNumber: 14 },
  { matchNumber: 8, matchCode: "M08", round: MatchRound.ROUND_OF_32, roundPosition: 8, bracketSide: BracketSide.LEFT, nextMatchNumber: 20, nextMatchSlot: NextMatchSlot.TEAM_B, previousMatchANumber: null, previousMatchBNumber: null, slotANumber: 15, slotBNumber: 16 },

  // Right Side (M09 - M16)
  { matchNumber: 9, matchCode: "M09", round: MatchRound.ROUND_OF_32, roundPosition: 9, bracketSide: BracketSide.RIGHT, nextMatchNumber: 21, nextMatchSlot: NextMatchSlot.TEAM_A, previousMatchANumber: null, previousMatchBNumber: null, slotANumber: 17, slotBNumber: 18 },
  { matchNumber: 10, matchCode: "M10", round: MatchRound.ROUND_OF_32, roundPosition: 10, bracketSide: BracketSide.RIGHT, nextMatchNumber: 21, nextMatchSlot: NextMatchSlot.TEAM_B, previousMatchANumber: null, previousMatchBNumber: null, slotANumber: 19, slotBNumber: 20 },
  { matchNumber: 11, matchCode: "M11", round: MatchRound.ROUND_OF_32, roundPosition: 11, bracketSide: BracketSide.RIGHT, nextMatchNumber: 22, nextMatchSlot: NextMatchSlot.TEAM_A, previousMatchANumber: null, previousMatchBNumber: null, slotANumber: 21, slotBNumber: 22 },
  { matchNumber: 12, matchCode: "M12", round: MatchRound.ROUND_OF_32, roundPosition: 12, bracketSide: BracketSide.RIGHT, nextMatchNumber: 22, nextMatchSlot: NextMatchSlot.TEAM_B, previousMatchANumber: null, previousMatchBNumber: null, slotANumber: 23, slotBNumber: 24 },
  { matchNumber: 13, matchCode: "M13", round: MatchRound.ROUND_OF_32, roundPosition: 13, bracketSide: BracketSide.RIGHT, nextMatchNumber: 23, nextMatchSlot: NextMatchSlot.TEAM_A, previousMatchANumber: null, previousMatchBNumber: null, slotANumber: 25, slotBNumber: 26 },
  { matchNumber: 14, matchCode: "M14", round: MatchRound.ROUND_OF_32, roundPosition: 14, bracketSide: BracketSide.RIGHT, nextMatchNumber: 23, nextMatchSlot: NextMatchSlot.TEAM_B, previousMatchANumber: null, previousMatchBNumber: null, slotANumber: 27, slotBNumber: 28 },
  { matchNumber: 15, matchCode: "M15", round: MatchRound.ROUND_OF_32, roundPosition: 15, bracketSide: BracketSide.RIGHT, nextMatchNumber: 24, nextMatchSlot: NextMatchSlot.TEAM_A, previousMatchANumber: null, previousMatchBNumber: null, slotANumber: 29, slotBNumber: 30 },
  { matchNumber: 16, matchCode: "M16", round: MatchRound.ROUND_OF_32, roundPosition: 16, bracketSide: BracketSide.RIGHT, nextMatchNumber: 24, nextMatchSlot: NextMatchSlot.TEAM_B, previousMatchANumber: null, previousMatchBNumber: null, slotANumber: 31, slotBNumber: 32 },

  // Round of 16 (Matches 17 to 24)
  // Left Side (M17 - M20)
  { matchNumber: 17, matchCode: "M17", round: MatchRound.ROUND_OF_16, roundPosition: 1, bracketSide: BracketSide.LEFT, nextMatchNumber: 25, nextMatchSlot: NextMatchSlot.TEAM_A, previousMatchANumber: 1, previousMatchBNumber: 2 },
  { matchNumber: 18, matchCode: "M18", round: MatchRound.ROUND_OF_16, roundPosition: 2, bracketSide: BracketSide.LEFT, nextMatchNumber: 25, nextMatchSlot: NextMatchSlot.TEAM_B, previousMatchANumber: 3, previousMatchBNumber: 4 },
  { matchNumber: 19, matchCode: "M19", round: MatchRound.ROUND_OF_16, roundPosition: 3, bracketSide: BracketSide.LEFT, nextMatchNumber: 26, nextMatchSlot: NextMatchSlot.TEAM_A, previousMatchANumber: 5, previousMatchBNumber: 6 },
  { matchNumber: 20, matchCode: "M20", round: MatchRound.ROUND_OF_16, roundPosition: 4, bracketSide: BracketSide.LEFT, nextMatchNumber: 26, nextMatchSlot: NextMatchSlot.TEAM_B, previousMatchANumber: 7, previousMatchBNumber: 8 },

  // Right Side (M21 - M24)
  { matchNumber: 21, matchCode: "M21", round: MatchRound.ROUND_OF_16, roundPosition: 5, bracketSide: BracketSide.RIGHT, nextMatchNumber: 27, nextMatchSlot: NextMatchSlot.TEAM_A, previousMatchANumber: 9, previousMatchBNumber: 10 },
  { matchNumber: 22, matchCode: "M22", round: MatchRound.ROUND_OF_16, roundPosition: 6, bracketSide: BracketSide.RIGHT, nextMatchNumber: 27, nextMatchSlot: NextMatchSlot.TEAM_B, previousMatchANumber: 11, previousMatchBNumber: 12 },
  { matchNumber: 23, matchCode: "M23", round: MatchRound.ROUND_OF_16, roundPosition: 7, bracketSide: BracketSide.RIGHT, nextMatchNumber: 28, nextMatchSlot: NextMatchSlot.TEAM_A, previousMatchANumber: 13, previousMatchBNumber: 14 },
  { matchNumber: 24, matchCode: "M24", round: MatchRound.ROUND_OF_16, roundPosition: 8, bracketSide: BracketSide.RIGHT, nextMatchNumber: 28, nextMatchSlot: NextMatchSlot.TEAM_B, previousMatchANumber: 15, previousMatchBNumber: 16 },

  // Quarter Finals (Matches 25 to 28)
  // Left Side (M25, M26)
  { matchNumber: 25, matchCode: "M25", round: MatchRound.QUARTER_FINAL, roundPosition: 1, bracketSide: BracketSide.LEFT, nextMatchNumber: 29, nextMatchSlot: NextMatchSlot.TEAM_A, previousMatchANumber: 17, previousMatchBNumber: 18 },
  { matchNumber: 26, matchCode: "M26", round: MatchRound.QUARTER_FINAL, roundPosition: 2, bracketSide: BracketSide.LEFT, nextMatchNumber: 29, nextMatchSlot: NextMatchSlot.TEAM_B, previousMatchANumber: 19, previousMatchBNumber: 20 },
  // Right Side (M27, M28)
  { matchNumber: 27, matchCode: "M27", round: MatchRound.QUARTER_FINAL, roundPosition: 3, bracketSide: BracketSide.RIGHT, nextMatchNumber: 30, nextMatchSlot: NextMatchSlot.TEAM_A, previousMatchANumber: 21, previousMatchBNumber: 22 },
  { matchNumber: 28, matchCode: "M28", round: MatchRound.QUARTER_FINAL, roundPosition: 4, bracketSide: BracketSide.RIGHT, nextMatchNumber: 30, nextMatchSlot: NextMatchSlot.TEAM_B, previousMatchANumber: 23, previousMatchBNumber: 24 },

  // Semi Finals (Matches 29 to 30)
  { matchNumber: 29, matchCode: "M29", round: MatchRound.SEMI_FINAL, roundPosition: 1, bracketSide: BracketSide.LEFT, nextMatchNumber: 31, nextMatchSlot: NextMatchSlot.TEAM_A, previousMatchANumber: 25, previousMatchBNumber: 26 },
  { matchNumber: 30, matchCode: "M30", round: MatchRound.SEMI_FINAL, roundPosition: 2, bracketSide: BracketSide.RIGHT, nextMatchNumber: 31, nextMatchSlot: NextMatchSlot.TEAM_B, previousMatchANumber: 27, previousMatchBNumber: 28 },

  // Grand Final (Match 31)
  { matchNumber: 31, matchCode: "M31", round: MatchRound.FINAL, roundPosition: 1, bracketSide: BracketSide.FINAL, nextMatchNumber: null, nextMatchSlot: null, previousMatchANumber: 29, previousMatchBNumber: 30 }
];

export function getMatchDefinition(matchNumber: number): BracketMatchDefinition | undefined {
  return BRACKET_STRUCTURE.find((m) => m.matchNumber === matchNumber);
}

export function getRoundLabel(round: MatchRound): string {
  switch (round) {
    case MatchRound.ROUND_OF_32:
      return "Round of 32";
    case MatchRound.ROUND_OF_16:
      return "Round of 16";
    case MatchRound.QUARTER_FINAL:
      return "Quarter Final";
    case MatchRound.SEMI_FINAL:
      return "Semi Final";
    case MatchRound.FINAL:
      return "Grand Final";
  }
}
