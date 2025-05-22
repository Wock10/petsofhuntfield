import { useState } from 'react';
import './Register.css';
import { COMMON_PETS } from './petTypes';
import imageCompression from 'browser-image-compression';

export default function Register({ onCancel, onCreated }) {
  const [name, setName] = useState('');
  const [type, setType] = useState('');
  const [address, setAddress] = useState('');
  const [contact, setContact] = useState('');
  const [files, setFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [error, setError] = useState('');

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
    setError('');

    let uploadedUrls = [];
    if (files.length) {
      try {
        const compressedFiles = await Promise.all(files.map(file => imageCompression(file, { maxSizeMB: 1, maxWidthOrHeight: 1280, useWebWorker: true })));
        const base64Images = await Promise.all(compressedFiles.map(fileToDataUrl));
        const uploadRes = await fetch('/api/uploadImages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ images: base64Images }),
        });
        if (uploadRes.ok) {
          const data = await uploadRes.json();
          uploadedUrls = data.urls || [];
        } else {
          const data = await uploadRes.json().catch(() => ({}));
          throw new Error(data.error || 'Failed to upload images');
        }
      } catch (err) {
        console.error(err);
        setError(err.message || 'Failed to upload images');
        return;
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
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || 'Failed to register pet');
      }
      if (onCreated) onCreated();
      if (onCancel) onCancel();
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to register pet');
    }
  };

  return (
    <form className="register-form" onSubmit={handleSubmit}>
      <h2>Register Your Pet</h2>
      {error && <p className="error">{error}</p>}
      <input
        type="text"
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <select
        value={type}
        onChange={(e) => setType(e.target.value)}
        required
      >
        <option value="">Select Type</option>
        {COMMON_PETS.map((petType) => (
          <option key={petType} value={petType}>
            {petType}
          </option>
        ))}
      </select>
      <input
        type="file"
        multiple
        accept="image/*"
        onChange={(e) => {
          const selected = Array.from(e.target.files);
          setFiles(selected);
          setPreviewUrls(selected.map((f) => URL.createObjectURL(f)));
        }}
      />
      {previewUrls.length > 0 && (
        <div className="image-previews">
          {previewUrls.map((url, idx) => (
            <img key={idx} src={url} alt="preview" />
          ))}
        </div>
      )}
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
