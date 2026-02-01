// server.js
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const multer = require("multer"); // 1. Tambah ini
const fs = require("fs"); // 2. Tambah ini (untuk cek folder)

const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// --- KONEKSI DATABASE OPTIMIZED FOR VERCEL ---
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false, // Wajib false di serverless biar gak nunggu lama kalau putus
    };

    cached.promise = mongoose.connect(process.env.MONGODB_URI, opts).then((mongoose) => {
      console.log("✅ Terkoneksi ke MongoDB (Baru)");
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    console.error("❌ Gagal koneksi DB:", e);
    throw e;
  }

  return cached.conn;
}

// Panggil fungsi connect di setiap request agar aman
app.use(async (req, res, next) => {
    await connectDB();
    next();
});

// 1. UPDATE SCHEMA LENGKAP
const solutionSchema = new mongoose.Schema({
  targetNumber: Number,
  title: String,
  image: String,
  description: String,
  code: String,
  colors: [String], // <--- TAMBAHKAN INI (Array warna hex)
  likes: { type: Number, default: 0 },
  comments: [{
    username: String,
    text: String,
    date: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now }
});
const Solution = mongoose.model('Solution', solutionSchema);

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// 3. Konfigurasi Storage Multer (Ganti DiskStorage lama dengan ini)
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'sajak-kode', // Nama folder di dashboard Cloudinary nanti
        allowed_formats: ['jpg', 'png', 'jpeg', 'gif'], // Format yang dibolehkan
        // transformation: [{ width: 800, crop: "limit" }] // Opsional: Resize otomatis biar hemat kuota
    }
});

const upload = multer({ storage: storage });

// --- 🔐 ROUTE KEAMANAN ---

// 1. Endpoint Login
app.post("/api/login", (req, res) => {
  const { password } = req.body;
  if (password === process.env.ADMIN_PASSWORD) {
    // Jika benar, kita kirim "token" sederhana
    res.json({ success: true, token: "admin-token-rahasia" });
  } else {
    res.status(401).json({ success: false, message: "Password salah!" });
  }
});

// Middleware: Pengecekan Token sebelum Save
const requireAuth = (req, res, next) => {
  const token = req.headers["authorization"];
  if (token === "admin-token-rahasia") {
    next(); // Boleh lanjut
  } else {
    res.status(403).json({ message: "Akses ditolak! Silakan login." });
  }
};

// --- API UTAMA ---

// 3. KONFIGURASI PENYIMPANAN GAMBAR
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     const dir = "public/images/uploads";
//     // Buat folder jika belum ada
//     if (!fs.existsSync(dir)) {
//       fs.mkdirSync(dir, { recursive: true });
//     }
//     cb(null, dir);
//   },
//   filename: (req, file, cb) => {
//     // Nama file unik: timestamp-namaasli.png
//     cb(null, Date.now() + "-" + file.originalname.replace(/\s+/g, "-"));
//   },
// });

// const upload = multer({ storage: storage });

// 4. ROUTE KHUSUS UPLOAD GAMBAR
app.post('/api/upload', upload.single('imageFile'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'Tidak ada file yang diupload' });
    }
    
    // Cloudinary langsung memberikan URL gambar yang online (path)
    // Kita kirim balik URL tersebut ke frontend
    res.json({ url: req.file.path }); 
});

// 2. UPDATE ROUTE UNTUK MENYIMPAN DATA (POST)
app.post("/api/solutions", requireAuth, async (req, res) => {
  // Kita terima data sesuai inputan baru
  const solution = new Solution({
    targetNumber: req.body.targetNumber,
    title: req.body.title,
    image: req.body.image,
    description: req.body.description,
    code: req.body.code,
  });

  try {
    const newSolution = await solution.save();
    res.status(201).json(newSolution);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// A. UPDATE Data (Edit)
app.put('/api/solutions/:id', requireAuth, async (req, res) => {
  try {
    const updatedSolution = await Solution.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true } // Agar mengembalikan data yang sudah diedit
    );
    res.json(updatedSolution);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// B. DELETE Data (Hapus)
app.delete('/api/solutions/:id', requireAuth, async (req, res) => {
  try {
    await Solution.findByIdAndDelete(req.params.id);
    res.json({ message: 'Solusi berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// C. POST Komentar (Tanpa Login Admin)
app.post('/api/solutions/:id/comment', async (req, res) => {
  const { username, text } = req.body;
  try {
    const solution = await Solution.findById(req.params.id);
    solution.comments.push({ username, text }); // Masukkan komentar ke array
    await solution.save();
    res.json(solution);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// D. POST Like
app.post('/api/solutions/:id/like', async (req, res) => {
  try {
    // $inc adalah fungsi mongoDB untuk increment (tambah 1)
    const solution = await Solution.findByIdAndUpdate(
        req.params.id, 
        { $inc: { likes: 1 } }, 
        { new: true }
    );
    res.json(solution);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.get("/api/solutions", async (req, res) => {
  try {
    const solutions = await Solution.find().sort({ targetNumber: -1 });
    res.json(solutions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/pinturahasia', (req, res) => {
    // Kita kirim file login.html, tapi URL di browser tetap '/pinturahasia'
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/bebasbersajak', (req, res) => {
    // Kita kirim file login.html, tapi URL di browser tetap '/pinturahasia'
    res.sendFile(path.join(__dirname, 'public', 'playground.html'));
});

app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Cek: Apakah dijalankan manual di laptop? (node server.js)
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`🚀 Server berjalan di http://localhost:${PORT}`);
    });
}

// Wajib export 'app' agar Vercel bisa menjalankannya
module.exports = app;