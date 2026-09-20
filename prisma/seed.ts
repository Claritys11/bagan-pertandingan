import { PrismaClient, TournamentStatus, BracketSide, MatchRound, NextMatchSlot, MatchStatus, PlayerRole, StaffRole, StaffStatus, VenueStatus, AnnouncementSeverity } from "@prisma/client";
import { BRACKET_STRUCTURE } from "../src/lib/bracket-structure";

const prisma = new PrismaClient();

const TEAMS_DATA = [
  { name: "Garuda Pride", shortName: "GP", tag: "GARUDA", captain: "Reza 'Lynx' Pratama" },
  { name: "Nusantara Titans", shortName: "NST", tag: "TITANS", captain: "Arif 'Valky' Wibowo" },
  { name: "Apex Phoenix", shortName: "APX", tag: "PHOENIX", captain: "Kevin 'Pyro' Tan" },
  { name: "Viper Strike", shortName: "VPS", tag: "VIPER", captain: "Bima 'Venom' Yudha" },
  { name: "Dragon King", shortName: "DKG", tag: "DRAGON", captain: "Hendra 'Draco' Kusuma" },
  { name: "Royal Vanguard", shortName: "RVG", tag: "VANGUARD", captain: "Alvin 'Shield' Prasetyo" },
  { name: "Shadow Legion", shortName: "SLG", tag: "SHADOW", captain: "Dian 'Shade' Saputra" },
  { name: "Celestial Storm", shortName: "CLS", tag: "STORM", captain: "Taufik 'Zeus' Hidayat" },
  { name: "Arctic Wolves", shortName: "AWF", tag: "WOLVES", captain: "Adit 'Frost' Nugraha" },
  { name: "Cyber Ronin", shortName: "CRN", tag: "RONIN", captain: "Kenji 'Blade' Wijaya" },
  { name: "Solar Flares", shortName: "SFL", tag: "SOLAR", captain: "Ferry 'Sun' Setiawan" },
  { name: "Nebula Genesis", shortName: "NBG", tag: "NEBULA", captain: "Ilham 'Aura' Ramadhan" },
  { name: "Titan Knights", shortName: "TNK", tag: "KNIGHTS", captain: "Rian 'Aegis' Firmansyah" },
  { name: "Phantom Mirage", shortName: "PMR", tag: "PHANTOM", captain: "Eko 'Ghost' Santoso" },
  { name: "Thunder Bolts", shortName: "TBT", tag: "THUNDER", captain: "Bayu 'Spark' Anggoro" },
  { name: "Eclipse Echo", shortName: "ECE", tag: "ECLIPSE", captain: "Fauzan 'Dark' Malik" },
  { name: "Iron Fortress", shortName: "IRF", tag: "FORTRESS", captain: "Bagas 'Golem' Prakoso" },
  { name: "Crimson Blades", shortName: "CRB", tag: "BLADES", captain: "Rendi 'Slash' Ananda" },
  { name: "Zenith Apex", shortName: "ZNA", tag: "ZENITH", captain: "Rio 'Summit' Pamungkas" },
  { name: "Kraken Hunters", shortName: "KKH", tag: "KRAKEN", captain: "Dedi 'Triton' Utama" },
  { name: "Frost Giants", shortName: "FSG", tag: "GIANTS", captain: "Wahyu 'Blizzard' Haryanto" },
  { name: "Wild Raptors", shortName: "WRP", tag: "RAPTORS", captain: "Sony 'Talon' Kurniawan" },
  { name: "Mystic Dragons", shortName: "MYD", tag: "MYSTIC", captain: "Galih 'Sorcerer' Putera" },
  { name: "Obsidian Guardians", shortName: "OBG", tag: "OBSIDIAN", captain: "Toni 'Onyx' Haryadi" },
  { name: "Nova Crusaders", shortName: "NVC", tag: "CRUSADERS", captain: "Farhan 'Templar' Akbar" },
  { name: "Silver Falcons", shortName: "SVF", tag: "FALCONS", captain: "Zidan 'Hawk' Alamsyah" },
  { name: "Aurora Strikers", shortName: "ARS", tag: "AURORA", captain: "Dimas 'Borealis' Surya" },
  { name: "Valkyrie Wings", shortName: "VKW", tag: "VALKYRIE", captain: "Gideon 'Spear' Hutapea" },
  { name: "Ghost Walkers", shortName: "GKW", tag: "GHOST", captain: "Lukman 'Spook' Arifin" },
  { name: "Blitzkrieg Legends", shortName: "BKL", tag: "BLITZ", captain: "Doni 'Panzer' Siregar" },
  { name: "Vortex Surge", shortName: "VTS", tag: "VORTEX", captain: "Yoga 'Cyclone' Pratama" },
  { name: "Eternal Champions", shortName: "ETC", tag: "ETERNAL", captain: "Satria 'Crown' Mahardika" }
];

const VENUES_DATA = [
  { name: "Arena Utama (Stage A)", location: "Main Hall Lt. 1", capacity: 50 },
  { name: "Arena Garuda (Room 01)", location: "Esports Lab 101", capacity: 20 },
  { name: "Arena Phoenix (Room 02)", location: "Esports Lab 102", capacity: 20 },
  { name: "Arena Nusantara (Room 03)", location: "Esports Lab 103", capacity: 20 },
];

const STAFF_DATA = [
  { name: "Budi Santoso", displayName: "Budi S. (Admin)", role: StaffRole.TOURNAMENT_ADMIN, phone: "+628123456701", email: "admin@baganmec.local" },
  { name: "Ahmad Fauzi", displayName: "Ahmad (Director)", role: StaffRole.TOURNAMENT_DIRECTOR, phone: "+628123456702", email: "director@baganmec.local" },
  { name: "Rizky Pratama", displayName: "Ref. Rizky", role: StaffRole.REFEREE, phone: "+628123456703", email: "ref.rizky@baganmec.local" },
  { name: "Gilang Ramadhan", displayName: "Ref. Gilang", role: StaffRole.REFEREE, phone: "+628123456704", email: "ref.gilang@baganmec.local" },
  { name: "Dimas Anggara", displayName: "Ref. Dimas", role: StaffRole.REFEREE, phone: "+628123456705", email: "ref.dimas@baganmec.local" },
  { name: "Citra Lestari", displayName: "PJ Citra", role: StaffRole.PJ, phone: "+628123456706", email: "pj.citra@baganmec.local" },
  { name: "Maya Indah", displayName: "PJ Maya", role: StaffRole.PJ, phone: "+628123456707", email: "pj.maya@baganmec.local" },
  { name: "Fajar Nugroho", displayName: "Obs. Fajar", role: StaffRole.OBSERVER, phone: "+628123456708", email: "obs.fajar@baganmec.local" },
  { name: "Hendra Gunawan", displayName: "Stream Hendra", role: StaffRole.STREAM_OPERATOR, phone: "+628123456709", email: "stream@baganmec.local" },
];

const ROLES_ORDER: PlayerRole[] = [
  PlayerRole.EXP_LANE,
  PlayerRole.JUNGLE,
  PlayerRole.MID_LANE,
  PlayerRole.GOLD_LANE,
  PlayerRole.ROAM
];

async function main() {
  console.log("Seeding MLBB Tournament Platform database...");

  // Clean old data
  await prisma.auditLog.deleteMany();
  await prisma.announcement.deleteMany();
  await prisma.match.deleteMany();
  await prisma.bracketSlot.deleteMany();
  await prisma.player.deleteMany();
  await prisma.team.deleteMany();
  await prisma.user.deleteMany();
  await prisma.staff.deleteMany();
  await prisma.venue.deleteMany();
  await prisma.tournament.deleteMany();

  // 1. Create Tournament
  const tournament = await prisma.tournament.create({
    data: {
      name: "MEC MLBB Championship 2026",
      slug: "mec-mlbb-2026",
      description: "Official Mobile Legends: Bang Bang Single-Elimination 32-Team Tournament.",
      status: TournamentStatus.SETUP,
      format: "SINGLE_ELIMINATION_32",
      teamCount: 32,
      startDate: new Date("2026-09-20T08:00:00+07:00"),
      endDate: new Date("2026-09-21T21:00:00+07:00"),
      timezone: "Asia/Jakarta",
    },
  });

  console.log(`Created Tournament: ${tournament.name} (${tournament.id})`);

  // 2. Create Venues
  const createdVenues = [];
  for (const v of VENUES_DATA) {
    const venue = await prisma.venue.create({
      data: {
        tournamentId: tournament.id,
        name: v.name,
        location: v.location,
        capacity: v.capacity,
        status: VenueStatus.AVAILABLE,
      },
    });
    createdVenues.push(venue);
  }

  // 3. Create Staff
  const createdStaff = [];
  for (const s of STAFF_DATA) {
    const staff = await prisma.staff.create({
      data: {
        tournamentId: tournament.id,
        name: s.name,
        displayName: s.displayName,
        role: s.role,
        phone: s.phone,
        email: s.email,
        status: StaffStatus.ACTIVE,
      },
    });
    createdStaff.push(staff);

    // Create admin user login for Tournament Admin
    if (s.role === StaffRole.TOURNAMENT_ADMIN) {
      await prisma.user.create({
        data: {
          username: "admin",
          passwordHash: "admin123", // In production hashed, for development seed
          role: StaffRole.TOURNAMENT_ADMIN,
          staffId: staff.id,
        },
      });
    }
  }

  // 4. Create 32 Teams with 5 Players each
  const createdTeams = [];
  for (let i = 0; i < TEAMS_DATA.length; i++) {
    const t = TEAMS_DATA[i];
    const team = await prisma.team.create({
      data: {
        tournamentId: tournament.id,
        name: t.name,
        shortName: t.shortName,
        tag: t.tag,
        captainName: t.captain,
        registrationNumber: `REG-2026-${String(i + 1).padStart(3, "0")}`,
        players: {
          create: ROLES_ORDER.map((role, rIdx) => ({
            nickname: `${t.shortName}.${["Ace", "King", "Echo", "Swift", "Nova"][rIdx]}`,
            realName: `Player ${i + 1}-${rIdx + 1}`,
            role: role,
            inGameId: `ID-${100000 + i * 10 + rIdx}`,
            jerseyNumber: `${(rIdx + 1) * 7}`,
          })),
        },
      },
      include: {
        players: true,
      },
    });
    createdTeams.push(team);
  }
  console.log(`Created 32 Teams with full player rosters.`);

  // 5. Create 32 Bracket Slots (Draft, ready for physical draw entry)
  for (let slot = 1; slot <= 32; slot++) {
    await prisma.bracketSlot.create({
      data: {
        tournamentId: tournament.id,
        slotNumber: slot,
        side: slot <= 16 ? BracketSide.LEFT : BracketSide.RIGHT,
        teamId: null, // Initially null until physical draw results entered
      },
    });
  }
  console.log("Created 32 empty Bracket Slots (DRAFT state).");

  // 6. Create 31 Matches structurally (linked according to BRACKET_STRUCTURE)
  // First pass: Create all 31 matches
  const matchMap = new Map<number, string>();
  for (const def of BRACKET_STRUCTURE) {
    const match = await prisma.match.create({
      data: {
        tournamentId: tournament.id,
        matchNumber: def.matchNumber,
        matchCode: def.matchCode,
        round: def.round,
        roundPosition: def.roundPosition,
        bracketSide: def.bracketSide,
        status: MatchStatus.DRAFT,
      },
    });
    matchMap.set(def.matchNumber, match.id);
  }

  // Second pass: Link nextMatchId
  for (const def of BRACKET_STRUCTURE) {
    if (def.nextMatchNumber) {
      const matchId = matchMap.get(def.matchNumber);
      const nextMatchId = matchMap.get(def.nextMatchNumber);
      if (matchId && nextMatchId) {
        await prisma.match.update({
          where: { id: matchId },
          data: {
            nextMatchId: nextMatchId,
            nextMatchSlot: def.nextMatchSlot,
          },
        });
      }
    }
  }
  console.log("Created and linked 31 single-elimination Matches (M01 to M31).");

  // 7. Create Announcements
  await prisma.announcement.createMany({
    data: [
      {
        tournamentId: tournament.id,
        title: "Selamat Datang di MEC MLBB Championship 2026!",
        content: "Turnamen resmi menggunakan sistem Single Elimination 32 Tim. Seluruh peserta dimohon mengikuti jadwal technical meeting dan mempersiapkan roster resmi.",
        severity: AnnouncementSeverity.INFO,
        isPinned: true,
        isPublished: true,
        authorName: "Tournament Committee",
      },
      {
        tournamentId: tournament.id,
        title: "Technical Meeting & Bracket Draw Fisik",
        content: "Drawing bagan resmi akan dilakukan secara fisik di Ruang Media Center. Hasil drawing resmi akan diinput langsung ke sistem oleh Tournament Admin.",
        severity: AnnouncementSeverity.INFO,
        isPinned: false,
        isPublished: true,
        authorName: "Tournament Admin",
      },
    ],
  });

  // 8. Create Initial Audit Log
  await prisma.auditLog.create({
    data: {
      tournamentId: tournament.id,
      actorName: "System",
      actorRole: "SYSTEM",
      action: "TOURNAMENT_INITIALIZED",
      entityType: "TOURNAMENT",
      entityId: tournament.id,
      details: {
        event: "Tournament created with 32 teams and 31 match slots ready for physical draw.",
      },
      isPublic: true,
    },
  });

  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
