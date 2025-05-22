const { randomUUID } = require('crypto');

let pets = [];

module.exports = async (req, res) => {
  if (req.method === 'GET') {
    const { id, type, name } = req.query;
    let results = pets;
    if (id) {
      results = results.filter(p => p.id === id);
    }
    if (type) {
      results = results.filter(p => p.type === type);
    }
    if (name) {
      results = results.filter(p => p.name === name);
    }
    return res.status(200).json(results);
  } else if (req.method === 'POST') {
    let body = req.body;
    if (!body || typeof body === 'string') {
      try {
        body = JSON.parse(body || '{}');
      } catch (err) {
        return res.status(400).json({ error: 'Invalid JSON body' });
      }
    }
    const { name, type, images = [], address = '', contact = '' } = body;
    if (!name || !type) {
      return res.status(400).json({ error: 'Name and type are required' });
    }
    const pet = {
      id: randomUUID(),
      name,
      type,
      images,
      address,
      contact,
    };
    pets.push(pet);
    return res.status(201).json(pet);
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
};
