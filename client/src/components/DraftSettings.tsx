import React, { useState } from 'react';
import './DraftSettings.css';
import { usePlayerContext } from '../hooks/PlayerContext';

interface DraftSettingsProps {
  onClose: () => void;
}

const DraftSettings: React.FC<DraftSettingsProps> = ({ onClose }) => {
  const { draftSettings, updateDraftSettings } = usePlayerContext();
  const [numberOfTeams, setNumberOfTeams] = useState(
    draftSettings.numberOfTeams
  );
  const [userDraftPosition, setUserDraftPosition] = useState(
    draftSettings.userDraftPosition
  );

  const handleSave = () => {
    updateDraftSettings({
      numberOfTeams,
      userDraftPosition,
    });
    onClose();
  };

  return (
    <div className="modal-container">
      <h2 className="title">Draft Settings</h2>
      <div className="draft-settings__select-container">
        <label className="draft-settings__label">Number of teams</label>
        <select
          className="draft-settings__select"
          value={numberOfTeams}
          onChange={(e) => {
            const teams = parseInt(e.target.value);
            setNumberOfTeams(teams);
            // Reset draft position if it exceeds new team count
            if (userDraftPosition > teams) {
              setUserDraftPosition(1);
            }
          }}
        >
          {Array.from({ length: 14 }, (_, i) => i + 1).map((num) => (
            <option key={num} value={num}>
              {num}
            </option>
          ))}
        </select>
      </div>
      <div className="draft-settings__select-container">
        <label className="draft-settings__label">User Draft Position:</label>
        <select
          className="draft-settings__select"
          value={userDraftPosition}
          onChange={(e) => setUserDraftPosition(parseInt(e.target.value))}
        >
          {Array.from({ length: numberOfTeams }, (_, i) => i + 1).map((num) => (
            <option key={num} value={num}>
              {num}
            </option>
          ))}
        </select>
      </div>
      <button onClick={handleSave} className="draft-settings__save-button">
        Save
      </button>
    </div>
  );
};

export default DraftSettings;
