require('dotenv').config();
const midtransClient = require('midtrans-client');

const isProduction = process.env.MIDTRANS_IS_PRODUCTION === 'true';

// Snap -> dipakai untuk membuat transaksi yang mendukung SEMUA metode
// pembayaran yang aktif di dashboard Midtrans (QRIS, GoPay, ShopeePay,
// Virtual Account semua bank, Kartu Kredit/Debit, Indomaret/Alfamart, dll)
// tanpa perlu membatasi enabled_payments.
const snap = new midtransClient.Snap({
  isProduction,
  serverKey: process.env.MIDTRANS_SERVER_KEY,
  clientKey: process.env.MIDTRANS_CLIENT_KEY,
});

// CoreApi -> dipakai untuk cek status transaksi & verifikasi notifikasi
const core = new midtransClient.CoreApi({
  isProduction,
  serverKey: process.env.MIDTRANS_SERVER_KEY,
  clientKey: process.env.MIDTRANS_CLIENT_KEY,
});

module.exports = { snap, core };
