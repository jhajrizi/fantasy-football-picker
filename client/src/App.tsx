import React from 'react';
import './App.css';
import Layout from './components/Layout';
import SuggestionBanner from './components/SuggestionBanner';
import { PlayerProvider } from './hooks/PlayerContext';
import Modal from 'react-modal';
import DraftSettings from './components/DraftSettings';

const customStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    background: '#F4F7FF',
    borderRadius: '12px',
  },
};

Modal.setAppElement('#root');

function App() {
  const [modalIsOpen, setIsOpen] = React.useState(true);

  function closeModal() {
    setIsOpen(false);
  }
  return (
    <PlayerProvider>
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="Draft Modal"
        style={customStyles}
      >
        <DraftSettings onClose={closeModal} />
      </Modal>

      <div className="container">
        <SuggestionBanner />
        <Layout />
      </div>
    </PlayerProvider>
  );
}

export default App;
