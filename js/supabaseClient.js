// Ganti dengan URL dan Kunci API Anda
const supabaseUrl = 'https://pueiihojzrxuloqqiakc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB1ZWlpaG9qenJ4dWxvcXFpYWtjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwODg1NzcsImV4cCI6MjA3NTY2NDU3N30.XvX3-BLnV_U507DGa8WhQ8y4Tz4aCmdJn0qmZBa45Ik';

// Buat koneksi ke Supabase
const supabase = supabase.createClient(supabaseUrl, supabaseKey);