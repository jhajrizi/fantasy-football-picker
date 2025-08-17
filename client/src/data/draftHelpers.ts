// Fantasy Football Draft Algorithm - Functional Approach

// Type definitions
interface Player {
  name: string;
  position: 'qb' | 'rb' | 'wr' | 'te';
  tier: number;
  overallRank: number;
  isDrafted: boolean;
}

interface UserRoster {
  qb: Player[];
  rb: Player[];
  wr: Player[];
  te: Player[];
  bench: Player[];
}

interface RosterNeeds {
  qb: number;
  rb: number;
  wr: number;
  te: number;
  flex: number;
}

interface PositionalScarcity {
  available: number;
  likelyTaken: number;
  remaining: number;
}

interface PlayerWithValue extends Player {
  valueScore: number;
  scarcity: PositionalScarcity;
}

interface DraftAdvice {
  isUserTurn: boolean;
  round?: number;
  pick?: number;
  recommendations?: PlayerWithValue[];
  strategy?: string[];
  needs?: RosterNeeds;
  picksUntilNext?: number;
  message?: string;
}

type Position = 'qb' | 'rb' | 'wr' | 'te';

// Position requirements
const ROSTER_REQUIREMENTS = {
  qb: 1,
  rb: 2,
  wr: 2,
  te: 1,
  flex: 1, // rb/wr/te
  bench: 6,
};

// Recommended minimums for depth (including bye week coverage)
const DEPTH_REQUIREMENTS = {
  qb: 1, // Can stream QB
  rb: 3, // Need 3rd RB for bye weeks (minimum Brian Robinson Jr. level)
  wr: 4, // Need depth at WR
  te: 1, // Can stream TE if needed
};

// Tier value mappings (converted to round numbers for easier comparison)
const TIER_VALUES: Record<Position, Record<number, number>> = {
  qb: {
    1: 3, // 3rd round
    2: 3.5, // Late 3rd to 4th
    3: 6.5, // 6th to 7th
    4: 8.5, // 8th to 9th
    5: 10.5, // 10th to 11th
    6: 13, // 12th to 14th
    7: 15, // 15th or later
  },
  rb: {
    1: 1, // Early 1st
    2: 1.5, // Mid to late 1st
    3: 2, // Late 1st to mid-2nd
    4: 2.5, // Mid-2nd to 3rd
    5: 3.5, // 3rd to 4th
    6: 5, // Late 4th to 6th
    7: 7, // 6th to 8th
    8: 9.5, // 9th to 10th
    9: 11.5, // 11th to 12th
    10: 14, // 13th to 15th
    11: 15, // 15th or later
  },
  wr: {
    1: 1, // Early 1st
    2: 1.25, // Early to mid-1st
    3: 1.75, // Mid-1st to early 2nd
    4: 2, // 2nd round
    5: 2.5, // Late 2nd to early 3rd
    6: 3.5, // 3rd to 4th
    7: 6, // 5th to 7th
    8: 8, // 7th to 9th
    9: 11, // 10th to 12th
    10: 13, // 13th or later
  },
  te: {
    1: 2.5, // 2nd to 3rd
    2: 6.5, // 6th to 7th
    3: 7.5, // 7th to 8th
    4: 8.5, // 8th to 9th
    5: 10, // 9th to 11th
    6: 13, // 12th to 14th
    7: 14, // 14th or later
  },
};

// Calculate current round and pick based on total picks made
const getRoundAndPick = (totalPicksMade: number, numTeams: number) => {
  // For the very first pick of the draft
  if (totalPicksMade === 0) {
    return { currentRound: 1, currentPick: 1 };
  }

  // For subsequent picks, we calculate which pick is currently happening
  // totalPicksMade tells us how many picks have been completed
  // So the current pick is totalPicksMade + 1
  const currentPickNumber = totalPicksMade + 1;
  const currentRound = Math.floor((currentPickNumber - 1) / numTeams) + 1;
  const currentPick = ((currentPickNumber - 1) % numTeams) + 1;

  return { currentRound, currentPick };
};

// Check if it's the user's turn
const isUserTurn = (
  currentRound: number,
  currentPick: number,
  userDraftPosition: number,
  numTeams: number
) => {
  if (currentRound % 2 === 1) {
    // Odd rounds: normal order
    return currentPick === userDraftPosition;
  } else {
    // Even rounds: snake order (reverse)
    return currentPick === numTeams - userDraftPosition + 1;
  }
};

// Calculate picks until user's next turn
const getPicksUntilNextTurn = (
  currentRound: number,
  currentPick: number,
  userDraftPosition: number,
  numTeams: number
) => {
  if (isUserTurn(currentRound, currentPick, userDraftPosition, numTeams))
    return 0;

  let picksUntilNext = 0;
  let tempRound = currentRound;
  let tempPick = currentPick;

  while (true) {
    tempPick++;
    picksUntilNext++;

    if (tempPick > numTeams) {
      tempRound++;
      tempPick = 1;
    }

    const isUserTurnNext =
      tempRound % 2 === 1
        ? tempPick === userDraftPosition
        : tempPick === numTeams - userDraftPosition + 1;

    if (isUserTurnNext) break;
  }

  return picksUntilNext;
};

// Get current roster needs
const getRosterNeeds = (userRoster: UserRoster): RosterNeeds => {
  const needs: RosterNeeds = {
    qb: 0,
    rb: 0,
    wr: 0,
    te: 0,
    flex: 0,
  };

  // Calculate remaining needs for each position
  needs.qb = Math.max(0, ROSTER_REQUIREMENTS.qb - userRoster.qb.length);
  needs.rb = Math.max(0, ROSTER_REQUIREMENTS.rb - userRoster.rb.length);
  needs.wr = Math.max(0, ROSTER_REQUIREMENTS.wr - userRoster.wr.length);
  needs.te = Math.max(0, ROSTER_REQUIREMENTS.te - userRoster.te.length);

  // Calculate flex needs (can be filled by RB/WR/TE)
  const flexEligible =
    userRoster.rb.length + userRoster.wr.length + userRoster.te.length;
  const totalRequired =
    ROSTER_REQUIREMENTS.rb +
    ROSTER_REQUIREMENTS.wr +
    ROSTER_REQUIREMENTS.te +
    ROSTER_REQUIREMENTS.flex;
  needs.flex = Math.max(0, totalRequired - flexEligible);

  return needs;
};

// Calculate positional scarcity
const getPositionalScarcity = (
  players: Player[],
  position: Position,
  tier: number,
  picksUntilNext: number
): PositionalScarcity => {
  const availablePlayers = players.filter(
    (p) => p.position === position && !p.isDrafted && p.tier <= tier
  );

  const likelyTaken = Math.min(picksUntilNext, availablePlayers.length);

  return {
    available: availablePlayers.length,
    likelyTaken,
    remaining: Math.max(0, availablePlayers.length - likelyTaken),
  };
};

// Calculate value score for a player
const calculatePlayerValue = (
  player: Player,
  currentRound: number,
  players: Player[],
  picksUntilNext: number,
  userRoster: UserRoster
): number => {
  const tierValue = TIER_VALUES[player.position as Position][player.tier] || 15;

  // Base value: how much better is this pick than expected for this round
  const valueScore = Math.max(0, currentRound - tierValue);

  // Positional scarcity bonus
  const scarcity = getPositionalScarcity(
    players,
    player.position,
    player.tier,
    picksUntilNext
  );
  const scarcityMultiplier =
    scarcity.remaining <= 2 ? 2.0 : scarcity.remaining <= 5 ? 1.5 : 1.0;

  // Team needs multiplier with depth considerations
  const needs = getRosterNeeds(userRoster);
  const currentCount = userRoster[player.position]?.length || 0;
  let needsMultiplier = 1.0;

  // Premium position multipliers (QB and TE have huge tier drop-offs)
  if (player.position === 'qb') {
    if (needs.qb > 0) {
      // Strong bonus for elite QBs (tier 1-2)
      needsMultiplier = player.tier <= 2 ? 1.6 : 1.3;
    }
  }

  if (player.position === 'te') {
    if (needs.te > 0) {
      // Strong bonus for elite TEs (tier 1-2) due to massive drop-off
      needsMultiplier = player.tier <= 1 ? 1.8 : 1.2;
    }
  }

  // RB depth logic - need 3rd RB for bye weeks
  if (player.position === 'rb') {
    if (needs.rb > 0 || needs.flex > 0) {
      needsMultiplier = 1.4;
    } else if (
      currentCount < DEPTH_REQUIREMENTS.rb &&
      player.overallRank <= 87
    ) {
      // Brian Robinson Jr. is rank 87 - need at least that level for 3rd RB
      needsMultiplier = 1.3; // Still valuable for depth
    }
  }

  // WR depth logic
  if (player.position === 'wr') {
    if (needs.wr > 0 || needs.flex > 0) {
      needsMultiplier = 1.4;
    } else if (currentCount < DEPTH_REQUIREMENTS.wr) {
      needsMultiplier = 1.1; // Moderate bonus for WR depth
    }
  }

  // Early round premium for top-tier players
  const earlyRoundBonus = currentRound <= 3 && player.tier <= 2 ? 1.2 : 1.0;

  // Overall rank factor (higher rank = lower number = better)
  const rankBonus = Math.max(0, (200 - player.overallRank) / 100);

  return (
    valueScore * scarcityMultiplier * needsMultiplier * earlyRoundBonus +
    rankBonus
  );
};

// Get draft recommendations
const getDraftRecommendations = (
  players: Player[],
  currentRound: number,
  picksUntilNext: number,
  userRoster: UserRoster,
  topN = 5
): PlayerWithValue[] => {
  const availablePlayers = players.filter((p) => !p.isDrafted);

  // Calculate value for each available player
  const playersWithValue: PlayerWithValue[] = availablePlayers.map(
    (player) => ({
      ...player,
      valueScore: calculatePlayerValue(
        player,
        currentRound,
        players,
        picksUntilNext,
        userRoster
      ),
      scarcity: getPositionalScarcity(
        players,
        player.position,
        player.tier,
        picksUntilNext
      ),
    })
  );

  // Sort by value score (descending)
  playersWithValue.sort((a, b) => b.valueScore - a.valueScore);

  return playersWithValue.slice(0, topN);
};

// Draft a player (returns updated players and roster)
const draftPlayer = (
  players: Player[],
  userRoster: UserRoster,
  playerName: string,
  isUserPick = false
): { updatedPlayers: Player[]; updatedRoster: UserRoster } => {
  const updatedPlayers = players.map((p) =>
    p.name === playerName ? { ...p, isDrafted: true } : p
  );

  let updatedRoster = userRoster;

  if (isUserPick) {
    const player = players.find((p) => p.name === playerName);
    if (player) {
      updatedRoster = { ...userRoster };

      // Add to appropriate roster slot
      if (
        userRoster[player.position].length <
        ROSTER_REQUIREMENTS[player.position as keyof typeof ROSTER_REQUIREMENTS]
      ) {
        updatedRoster[player.position] = [
          ...userRoster[player.position],
          player,
        ];
      } else {
        // Add to bench if position is full
        updatedRoster.bench = [...userRoster.bench, player];
      }
    }
  }

  return { updatedPlayers, updatedRoster };
};

// Get draft strategy advice
const getDraftStrategy = (
  currentRound: number,
  userRoster: UserRoster,
  totalRounds = 15 // Standard fantasy draft length
): string[] => {
  const needs = getRosterNeeds(userRoster);
  const round = currentRound;
  const rbCount = userRoster.rb.length;
  const wrCount = userRoster.wr.length;
  const qbDeadline = totalRounds - 2; // Must draft QB before final 2 rounds (DEF/K)

  const strategy: string[] = [];

  if (round <= 3) {
    strategy.push('Focus on top-tier RB/WR for reliable production');
  }

  if (round >= 3 && round <= 5 && needs.qb > 0) {
    strategy.push(
      'Consider drafting your QB if tier 1-2 available (huge drop-off after elite QBs)'
    );
  }

  if (round >= 2 && round <= 6 && needs.te > 0) {
    strategy.push(
      'Elite TEs (tier 1-2) have massive value due to position scarcity'
    );
  }

  // QB deadline warning
  if (needs.qb > 0 && round >= qbDeadline - 2) {
    strategy.push(
      `URGENT: Must draft QB soon! Final 2 rounds reserved for DEF/K`
    );
  }

  // RB depth strategy
  if (rbCount >= 2 && rbCount < 3 && round >= 4) {
    strategy.push(
      'Target 3rd RB for bye week coverage (minimum Brian Robinson Jr. level)'
    );
  }

  if (needs.flex > 0) {
    strategy.push('Look for RB/WR with upside for flex position');
  }

  // WR depth strategy
  if (wrCount >= 2 && wrCount < 4 && round >= 5) {
    strategy.push('Consider WR depth for bye weeks and potential breakouts');
  }

  if (round >= 10) {
    strategy.push('Focus on handcuffs and high-upside players');
  }

  return strategy;
};

// Get comprehensive draft advice
const getDraftAdvice = (
  players: Player[],
  userRoster: UserRoster,
  totalPicksMade: number,
  numTeams: number,
  userDraftPosition: number
): DraftAdvice => {
  const { currentRound, currentPick } = getRoundAndPick(
    totalPicksMade,
    numTeams
  );
  const userTurn = isUserTurn(
    currentRound,
    currentPick,
    userDraftPosition,
    numTeams
  );

  if (!userTurn) {
    const picksUntilNext = getPicksUntilNextTurn(
      currentRound,
      currentPick,
      userDraftPosition,
      numTeams
    );
    const strategy = getDraftStrategy(currentRound, userRoster);

    return {
      isUserTurn: false,
      round: currentRound,
      pick: currentPick,
      message: `Not your turn. Pick ${currentPick} of round ${currentRound}`,
      picksUntilNext,
      strategy,
    };
  }

  const picksUntilNext = getPicksUntilNextTurn(
    currentRound,
    currentPick,
    userDraftPosition,
    numTeams
  );
  const recommendations = getDraftRecommendations(
    players,
    currentRound,
    picksUntilNext,
    userRoster
  );
  const strategy = getDraftStrategy(currentRound, userRoster);
  const needs = getRosterNeeds(userRoster);

  return {
    isUserTurn: true,
    round: currentRound,
    pick: currentPick,
    recommendations,
    strategy,
    needs,
    picksUntilNext,
  };
};

// Initialize empty roster
const createEmptyRoster = (): UserRoster => ({
  qb: [],
  rb: [],
  wr: [],
  te: [],
  bench: [],
});

// Main draft state management functions
const draftHelpers = {
  getRoundAndPick,
  isUserTurn,
  getPicksUntilNextTurn,
  getRosterNeeds,
  getPositionalScarcity,
  calculatePlayerValue,
  getDraftRecommendations,
  draftPlayer,
  getDraftStrategy,
  getDraftAdvice,
  createEmptyRoster,
};

export {
  draftHelpers,
  ROSTER_REQUIREMENTS,
  DEPTH_REQUIREMENTS,
  TIER_VALUES,
  getRoundAndPick,
  isUserTurn,
  getPicksUntilNextTurn,
  getRosterNeeds,
  getPositionalScarcity,
  calculatePlayerValue,
  getDraftRecommendations,
  draftPlayer,
  getDraftStrategy,
  getDraftAdvice,
  createEmptyRoster,
};

export type {
  Player,
  UserRoster,
  RosterNeeds,
  PositionalScarcity,
  PlayerWithValue,
  DraftAdvice,
  Position,
};
