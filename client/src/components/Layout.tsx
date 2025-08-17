import React from 'react';
import './Layout.css';
import PlayerList from './PlayerList';
import Top5Positional from './Top5Positional';

const TwoColumnLayout: React.FC = () => {
  return (
    <div
      style={{
        display: 'flex',
        height: '100vh',
        width: '100%',
      }}
    >
      {/* Left Column */}
      <div className="column">
        <PlayerList />
      </div>

      {/* Gap between columns */}
      <div
        style={{
          width: '32px',
          flexShrink: 0,
        }}
      />

      {/* Right Column */}
      <div className="column">
        <Top5Positional position="qb" />
        <Top5Positional position="wr" />
        <Top5Positional position="rb" />
        <Top5Positional position="te" />
      </div>
    </div>
  );
};

export default TwoColumnLayout;
