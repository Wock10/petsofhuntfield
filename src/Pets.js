import { useEffect, useState } from 'react';
import './Pets.css';

export default function Pets() {
  const [pets, setPets] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    fetch('/api/pets')
      .then(res => res.json())
      .then(data => setPets(data))
      .catch(() => {
        // fallback to sample data if API fails
        setPets([
          {
            id: '1',
            name: 'Fido',
            type: 'Dog',
            images: [],
            address: 'Huntfield',
            contact: 'owner@example.com',
          },
        ]);
      });
  }, []);

  if (selected) {
    return (
      <div className="pet-profile" onClick={() => setSelected(null)}>
        <div className="profile-image">
          <img src={selected.images[0] || 'https://via.placeholder.com/600x400'} alt={selected.name} />
        </div>
        <div className="profile-details">
          <h2>{selected.name}</h2>
          <p className="type">{selected.type}</p>
          {selected.address && <p className="address">{selected.address}</p>}
          {selected.contact && <p className="contact">{selected.contact}</p>}
        </div>
      </div>
    );
  }

  return (
    <ul className="pet-list">
      {pets.map(pet => (
        <li
          key={pet.id}
          className="pet-card"
          onClick={() => setSelected(pet)}
        >
          <div className="card-image">
            <img
              src={pet.images[0] || 'https://via.placeholder.com/300x200'}
              alt={pet.name}
            />
          </div>
          <div className="card-details">
            <h3>{pet.name}</h3>
            <p className="type">{pet.type}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}
