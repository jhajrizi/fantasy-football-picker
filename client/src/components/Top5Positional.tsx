import React, { useCallback } from 'react';
import './Top5Positional.css';
import { usePlayerContext } from '../hooks/PlayerContext';
import type { Player } from '../data/players';

interface Top5PositionalProps {
  position: Player['position'];
}

const Top5Positional: React.FC<Top5PositionalProps> = ({ position }) => {
  const { getTop5UndraftedByPosition } = usePlayerContext();
  const top5Players = getTop5UndraftedByPosition(position);

  const getTierColor = useCallback((tier: number) => {
    switch (tier) {
      case 1:
        return 'tier-1';
      case 2:
        return 'tier-2';
      default:
        return 'tier-default';
    }
  }, []); // Empty dependency array since the function logic doesn't depend on any props or state

  if (top5Players.length === 0) {
    return null; // Don't render anything if there are no undrafted players for this position
  }

  return (
    <div className="top5-container">
      <h2 className="title">Top 5 {position.toUpperCase()}</h2>
      <div className="top5-header">
        <h3 className="top5-header__text">Player name</h3>
        <h3 className="top5-header__text">Tier</h3>
      </div>
      <ul>
        {top5Players.map((player) => (
          <li key={player.overallRank}>
            <div className="top5-row">
              <p className="top5-row__name">{player.name}</p>
              <div className={`top5-row__tier ${getTierColor(player.tier)}`}>
                Tier {player.tier}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Top5Positional;
