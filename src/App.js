import { useState } from 'react';
import './App.css';
import Pets from './Pets';
import Register from './Register';

const logoUrl = '/cat_head_only.svg';

function App() {
  const [page, setPage] = useState('home');

  return (
    <div className="App">
      <header className="App-header">
        <div
          className="branding"
          onClick={() => {
            window.location.href = '/';
          }}
        >
          <img className="logo" src={logoUrl} alt="Pets of Huntfield" />
          <h1>Pets of Huntfield</h1>
        </div>
        <button onClick={() => setPage('register')}>Register</button>
      </header>
      {page === 'home' && <Pets />}
      {page === 'register' && (
        <Register onCancel={() => setPage('home')} onCreated={() => setPage('home')} />
      )}
    </div>
  );
}

export default App;
