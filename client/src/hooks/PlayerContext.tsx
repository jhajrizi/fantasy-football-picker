import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import { players as initialPlayers, type Player } from '../data/players';

interface PlayerContextType {
  players: Player[];
  toggleDraftPlayer: (overallRank: number) => void;
  getPlayersByPosition: (position: Player['position']) => Player[];
  getTop5UndraftedByPosition: (position: Player['position']) => Player[];
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

  const toggleDraftPlayer = useCallback((overallRank: number) => {
    setPlayers((prev) =>
      prev.map((player) =>
        player.overallRank === overallRank
          ? { ...player, isDrafted: !player.isDrafted }
          : player
      )
    );
  }, []);

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

  const value: PlayerContextType = {
    players,
    toggleDraftPlayer,
    getPlayersByPosition,
    getTop5UndraftedByPosition,
  };

  return (
    <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>
  );
};
