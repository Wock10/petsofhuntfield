import { useEffect, useState } from 'react';
import './Pets.css';
import { COMMON_PETS } from './petTypes';

export default function Pets() {
  const [pets, setPets] = useState([]);
  const [selected, setSelected] = useState(null);
  const [typeFilter, setTypeFilter] = useState('');
  const [nameFilter, setNameFilter] = useState('');

  const handleDelete = async (pet) => {
    const confirmation = window.prompt("Type 'delete this pet' to confirm");
    if (confirmation !== 'delete this pet') return;
    try {
      await fetch(`/api/pets?id=${pet.id}`, { method: 'DELETE' });
      setPets(pets.filter((p) => p.id !== pet.id));
      setSelected(null);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams();
    if (typeFilter) params.append('type', typeFilter);
    if (nameFilter) params.append('name', nameFilter);
    fetch(`/api/pets?${params.toString()}`)
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
  }, [typeFilter, nameFilter]);

  if (selected) {
    return (
      <div className="pet-profile" onClick={() => setSelected(null)}>
        <div className="profile-gallery">
          {selected.images && selected.images.length > 0 ? (
            selected.images.map((url, idx) => (
              <img key={idx} src={url} alt={`${selected.name}-${idx}`} />
            ))
          ) : (
            <img src="https://via.placeholder.com/600x400" alt={selected.name} />
          )}
        </div>
        <div className="profile-details">
          <h2>{selected.name}</h2>
          <p className="type">{selected.type}</p>
          {selected.address && <p className="address">{selected.address}</p>}
          {selected.contact && <p className="contact">{selected.contact}</p>}
          <button
            className="remove-button"
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(selected);
            }}
          >
            Remove
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="filters">
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
          <option value="">All Types</option>
          {COMMON_PETS.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Name"
          value={nameFilter}
          onChange={(e) => setNameFilter(e.target.value)}
        />
      </div>
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
              {pet.address && <p className="address">{pet.address}</p>}
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
