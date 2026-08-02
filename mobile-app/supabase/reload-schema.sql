-- Schema sudah lengkap. Jalankan ini untuk refresh cache API, lalu coba simpan lagi.
notify pgrst, 'reload schema';
notify pgrst, 'reload config';

select 'schema reloaded — tunggu 15 detik lalu refresh app' as status;
