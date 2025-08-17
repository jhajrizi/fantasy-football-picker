import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react';
import { players as initialPlayers, type Player } from '../data/players';
import {
  getDraftAdvice,
  createEmptyRoster,
  draftPlayer,
  type DraftAdvice,
  type UserRoster,
} from '../data/draftHelpers';

interface DraftSettings {
  numberOfTeams: number;
  userDraftPosition: number;
}

interface PlayerContextType {
  players: Player[];
  draftSettings: DraftSettings;
  userRoster: UserRoster;
  draftAdvice: DraftAdvice;
  toggleDraftPlayer: (overallRank: number) => void;
  getPlayersByPosition: (position: Player['position']) => Player[];
  getTop5UndraftedByPosition: (position: Player['position']) => Player[];
  updateDraftSettings: (settings: DraftSettings) => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export const usePlayerContext = () => {
  const context = useContext(PlayerContext);
  if (context === undefined) {
    throw new Error('usePlayerContext must be used within a PlayerProvider');
  }
  return context;
};

interface PlayerProviderProps {
  children: ReactNode;
}

export const PlayerProvider: React.FC<PlayerProviderProps> = ({ children }) => {
  const [players, setPlayers] = useState<Player[]>(initialPlayers);
  const [draftSettings, setDraftSettings] = useState<DraftSettings>({
    numberOfTeams: 10,
    userDraftPosition: 1,
  });
  const [userRoster, setUserRoster] = useState<UserRoster>(createEmptyRoster());

  const updateDraftSettings = useCallback((settings: DraftSettings) => {
    setDraftSettings(settings);
  }, []);

  const toggleDraftPlayer = useCallback(
    (overallRank: number) => {
      setPlayers((prev) => {
        const updatedPlayers = prev.map((player) =>
          player.overallRank === overallRank
            ? { ...player, isDrafted: !player.isDrafted }
            : player
        );

        // Update user roster if the player was drafted
        const player = prev.find((p) => p.overallRank === overallRank);
        if (player && !player.isDrafted) {
          // Player is being drafted
          const { updatedRoster } = draftPlayer(
            updatedPlayers,
            userRoster,
            player.name,
            true
          );
          setUserRoster(updatedRoster);
        } else if (player && player.isDrafted) {
          // Player is being undrafted - remove from roster
          setUserRoster((prev) => ({
            qb: prev.qb.filter((p) => p.overallRank !== overallRank),
            rb: prev.rb.filter((p) => p.overallRank !== overallRank),
            wr: prev.wr.filter((p) => p.overallRank !== overallRank),
            te: prev.te.filter((p) => p.overallRank !== overallRank),
            bench: prev.bench.filter((p) => p.overallRank !== overallRank),
          }));
        }

        return updatedPlayers;
      });
    },
    [userRoster]
  );

  const getPlayersByPosition = useCallback(
    (position: Player['position']) => {
      return players.filter((player) => player.position === position);
    },
    [players]
  );

  const getTop5UndraftedByPosition = useCallback(
    (position: Player['position']) => {
      return players
        .filter((player) => player.position === position && !player.isDrafted)
        .sort((a, b) => a.overallRank - b.overallRank)
        .slice(0, 5);
    },
    [players]
  );

  // Calculate draft advice based on current state
  const draftAdvice = useMemo(() => {
    const totalPicksMade = players.filter((p) => p.isDrafted).length;
    return getDraftAdvice(
      players,
      userRoster,
      totalPicksMade,
      draftSettings.numberOfTeams,
      draftSettings.userDraftPosition
    );
  }, [players, userRoster, draftSettings]);

  const value: PlayerContextType = {
    players,
    draftSettings,
    userRoster,
    draftAdvice,
    toggleDraftPlayer,
    getPlayersByPosition,
    getTop5UndraftedByPosition,
    updateDraftSettings,
  };

  return (
    <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>
  );
};
