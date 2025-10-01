import React from 'react';
import './App.css';
import GameScene from './components/GameScene.jsx';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h2>Gnarled Helix Coding Challenge</h2>
        <GameScene/>
        <p>
          <strong>Training Room</strong>
        </p>
      </header>
    </div>
  );
}

export default App;
