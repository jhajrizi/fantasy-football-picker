import './App.css';
import Layout from './components/Layout';
import { PlayerProvider } from './hooks/PlayerContext';

function App() {
  return (
    <PlayerProvider>
      <div className="container">
        <Layout />
      </div>
    </PlayerProvider>
  );
}

export default App;
