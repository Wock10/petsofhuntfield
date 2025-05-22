import { useState } from 'react';
import './Register.css';

export default function Register({ onCancel, onCreated }) {
  const [name, setName] = useState('');
  const [type, setType] = useState('');
  const [address, setAddress] = useState('');
  const [contact, setContact] = useState('');
  const [files, setFiles] = useState([]);

  const fileToDataUrl = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let uploadedUrls = [];
    if (files.length) {
      try {
        const base64Images = await Promise.all(files.map(fileToDataUrl));
        const uploadRes = await fetch('/api/uploadImages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ images: base64Images }),
        });
        if (uploadRes.ok) {
          const data = await uploadRes.json();
          uploadedUrls = data.urls || [];
        }
      } catch (err) {
        console.error(err);
      }
    }

    const payload = {
      name,
      type,
      images: uploadedUrls,
      address,
      contact,
    };

    try {
      const res = await fetch('/api/pets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        if (onCreated) onCreated();
      }
    } catch (err) {
      console.error(err);
    } finally {
      if (onCancel) onCancel();
    }
  };

  return (
    <form className="register-form" onSubmit={handleSubmit}>
      <h2>Register Your Pet</h2>
      <input
        type="text"
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <input
        type="text"
        placeholder="Type"
        value={type}
        onChange={(e) => setType(e.target.value)}
        required
      />
      <input
        type="file"
        multiple
        accept="image/*"
        onChange={(e) => setFiles(Array.from(e.target.files))}
      />
      <input
        type="text"
        placeholder="Address"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
      />
      <input
        type="text"
        placeholder="Contact"
        value={contact}
        onChange={(e) => setContact(e.target.value)}
      />
      <div className="form-actions">
        <button type="submit">Submit</button>
        <button type="button" className="secondary" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}
