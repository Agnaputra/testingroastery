# Gmail API untuk email backend

Backend memakai Gmail API melalui HTTPS jika `CUSTOMER_GMAIL_REFRESH_TOKEN` terisi.
Ini mendahului SMTP dan tidak mengubah login Google pelanggan. Kredensial SMTP
bukan refresh token Gmail dan tidak dapat dipakai sebagai penggantinya.

## Otorisasi pengirim sekali

1. Di Google Cloud project milik OAuth client lokal, aktifkan **Gmail API**.
2. Pada OAuth client bertipe Web application, **tambahkan** Authorized redirect URI
   `http://127.0.0.1:8765/gmail/callback`. Pertahankan URI login pelanggan yang ada.
3. Jika OAuth consent masih Testing, tambahkan akun pengirim sebagai test user.
4. Dari root repository jalankan:

   ```powershell
   apps/ai-backend/.venv/Scripts/python.exe -B apps/ai-backend/scripts/authorize_gmail.py
   ```

5. Buka URL dalam `.private/gmail-authorization-url.txt`, pilih akun pengirim
   yang sama dengan `CUSTOMER_SMTP_USER`, dan setujui izin pengiriman Gmail.
   Callback hanya mendengarkan di loopback selama 10 menit; state, PKCE,
   granted scope, dan identitas pengirim diperiksa sebelum token disimpan.
6. Helper menyimpan empat nilai `CUSTOMER_GMAIL_*` di `.private/gmail-oauth.json`
   yang diabaikan Git. Pasang nilainya sebagai variables backend Railway
   production melalui stdin, lalu deploy backend yang memuat perubahan layanan
   email. Jangan tempel token ke chat, terminal output, atau commit.
7. Uji pengiriman ke pengirim sendiri terlebih dahulu. Konfirmasi ID pesan dari
   Gmail API dan penerimaan inbox sebelum menyatakan pengiriman berhasil.
   Jangan menyetujui ulang pembayaran atau membuat transaksi untuk uji email.

Google OAuth app dengan audience External dan status Testing biasanya menghasilkan
refresh token yang kedaluwarsa setelah 7 hari untuk scope Gmail. Selesaikan
pengaturan publishing/verification yang diwajibkan Google sebelum mengandalkan
ini untuk layanan berkelanjutan. Izin yang dicabut juga perlu diotorisasi ulang.
Gmail tetap memiliki batas pengiriman; penerimaan API tidak menjamin masuk inbox.

Referensi: [pengiriman Gmail API](https://developers.google.com/workspace/gmail/api/guides/sending),
[masa berlaku refresh token](https://developers.google.com/identity/protocols/oauth2#expiration).
