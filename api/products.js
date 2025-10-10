const { createClient } = require('@supabase/supabase-js');

// Inisialisasi Supabase (akan menggunakan Environment Variables)
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

export default async function handler(req, res) {
  const { category, q } = req.query;
  let query = supabase.from('products').select('*');

  if (category) {
    query = query.eq('kategori', category);
  }
  if (q) {
    query = query.ilike('nama', `%${q}%`);
  }
  
  const { data, error } = await query;

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  // Penting: Atur header CORS secara manual untuk Vercel
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  
  res.status(200).json(data);
}