const supabase = require('../supabase');

module.exports = async (req, res) => {
  if (req.method === 'GET') {
    const { id, type, name } = req.query;
    let query = supabase.from('pets').select('*');
    if (id) query = query.eq('id', id);
    if (type) query = query.eq('type', type);
    if (name) query = query.ilike('name', `%${name}%`);
    const { data, error } = await query;
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    return res.status(200).json(data);
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
    const { data, error } = await supabase
      .from('pets')
      .insert({ name, type, images, address, contact })
      .select()
      .single();
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    return res.status(201).json(data);
  } else if (req.method === 'DELETE') {
    const { id } = req.query;
    if (!id) {
      return res.status(400).json({ error: 'id is required' });
    }
    const { error } = await supabase.from('pets').delete().eq('id', id);
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    return res.status(204).end();
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
};
