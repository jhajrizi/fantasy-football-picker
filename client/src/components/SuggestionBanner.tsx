import React from 'react';
import './SuggestionBanner.css';
import { usePlayerContext } from '../hooks/PlayerContext';

const SuggestionBanner: React.FC = () => {
  const { draftAdvice, draftSettings } = usePlayerContext();

  return (
    <div className="suggestion-banner">
      <div className="suggestion-banner__header">
        <h2 className="suggestion-banner__title">Draft assistant</h2>
        <div className="suggestion-banner__info">
          <span>Teams: {draftSettings.numberOfTeams}</span>
          <span>Your position: {draftSettings.userDraftPosition}</span>
          {draftAdvice.round && draftAdvice.pick && (
            <span>
              Round {draftAdvice.round}, Pick {draftAdvice.pick}
            </span>
          )}
        </div>
      </div>

      {draftAdvice.isUserTurn ? (
        <div className="suggestion-banner__content">
          <div className="suggestion-banner__status">
            It's your turn to draft!
          </div>

          {draftAdvice.recommendations &&
            draftAdvice.recommendations.length > 0 && (
              <div className="suggestion-banner__recommendations">
                <h3>Top Recommendations:</h3>
                <div className="suggestion-banner__player-list">
                  {draftAdvice.recommendations.slice(0, 3).map((player) => (
                    <div
                      key={player.overallRank}
                      className="suggestion-banner__player"
                    >
                      <span className="player-name">{player.name}</span>
                      <span className="player-position">
                        {player.position.toUpperCase()}
                      </span>
                      <span className="player-tier">Tier {player.tier}</span>
                      <span className="player-value">
                        Value: {player.valueScore.toFixed(1)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
        </div>
      ) : (
        <div className="suggestion-banner__content">
          <div className="suggestion-banner__status">
            {`Waiting for your turn... ${draftAdvice.picksUntilNext || 0} ${
              draftAdvice.picksUntilNext === 1 ? 'pick' : 'picks'
            } until you're up`}
          </div>
        </div>
      )}
    </div>
  );
};

export default SuggestionBanner;
