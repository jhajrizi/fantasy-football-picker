import './PlayerList.css';
import { usePlayerContext } from '../hooks/PlayerContext';
import { useState } from 'react';

const PlayerList: React.FC = () => {
  const { players, toggleDraftPlayer } = usePlayerContext();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPlayers = players.filter((player) =>
    player.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <h2 className="title">Top {players.length} Players</h2>
      <div className="search-container">
        <label htmlFor="search" className="search-label">
          Find player
        </label>
        <input
          type="text"
          placeholder="Search players"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>
      {filteredPlayers.map((player) => (
        <div key={player.overallRank} className="player-card">
          <p
            className={
              player.isDrafted
                ? 'player-card-name__drafted'
                : 'player-card-name'
            }
          >
            {player.name}
          </p>
          <button
            className={
              player.isDrafted
                ? 'player-card-button player-card-button__drafted'
                : 'player-card-button player-card-button__undrafted'
            }
            onClick={() => toggleDraftPlayer(player.overallRank)}
          >
            {player.isDrafted ? 'Undraft' : 'Drafted'}
          </button>
        </div>
      ))}
    </div>
  );
};

export default PlayerList;
