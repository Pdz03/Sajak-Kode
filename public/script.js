// public/script.js

// Variabel Global untuk menyimpan data agar tidak perlu fetch ulang saat navigasi
let allSolutions = [];

const app = document.getElementById("app");

// 1. Ambil Data dari Backend
async function fetchSolutions() {
  try {
    app.innerHTML =
      '<div class="text-center text-sajak-accent mt-20"><i class="fa-solid fa-circle-notch fa-spin text-4xl"></i><p class="mt-4">Memetik sajak...</p></div>';

    const response = await fetch("/api/solutions");
    allSolutions = await response.json();

    // Setelah data dapat, render halaman HOME
    renderHome();
  } catch (error) {
    app.innerHTML =
      '<p class="text-red-400 text-center mt-10">Gagal memuat data sajak.</p>';
    console.error("Error:", error);
  }
}

// 2. Tampilan Home (Grid List)
function renderHome() {
  window.scrollTo(0, 0);

  let html = `
        <div class="text-center py-12 mb-10 fade-in">
            <h2 class="text-4xl md:text-5xl font-serif font-bold text-white mb-4">
                Dari Logika menjadi <span class="text-transparent bg-clip-text bg-gradient-to-r from-sajak-accent to-blue-500 italic">Rangkaian Kata</span>
            </h2>
            <p class="text-slate-400 text-lg max-w-2xl mx-auto">
                Kumpulan solusi CSSBattle harian.
            </p>
        </div>

        <div class="flex justify-between items-center mb-8 border-b border-slate-700 pb-4">
            <h3 class="text-xl font-bold text-white"><i class="fa-solid fa-list-check mr-2"></i>Daily Targets</h3>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    `;

  if (allSolutions.length === 0) {
    html += `<p class="text-slate-500 col-span-full text-center">Belum ada sajak yang ditulis.</p>`;
  }

  allSolutions.forEach((item) => {
    html += `
            <div onclick="renderDetail('${item._id}')" class="bg-sajak-card border border-slate-700 rounded-xl overflow-hidden hover:shadow-[0_0_20px_rgba(45,212,191,0.2)] hover:border-sajak-accent transition-all cursor-pointer group">
                <div class="relative overflow-hidden h-48 bg-slate-900 flex items-center justify-center">
                    
                    <img src="${item.image}" alt="${item.title}" class="object-cover w-full h-full opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-transform duration-500">
                    
                    <div class="absolute top-3 left-3 bg-black/60 backdrop-blur px-2 py-1 rounded text-xs font-mono text-sajak-accent border border-sajak-accent/30">
                        Target #${item.targetNumber}
                    </div>
                </div>
                
                <div class="p-5">
                    <h4 class="text-white font-bold text-lg mb-2 group-hover:text-sajak-accent transition-colors line-clamp-1">${item.title}</h4>
                    <p class="text-slate-400 text-sm line-clamp-2 mb-4">${item.description}</p>
                    
                    <div class="flex items-center justify-between mt-auto pt-4 border-t border-slate-700/50">
                        <span class="text-xs text-slate-500 font-mono"><i class="fa-solid fa-code mr-1"></i>${item.code.length} chars</span>
                        <span class="text-sajak-accent text-sm font-semibold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                            Lihat Kode <i class="fa-solid fa-arrow-right text-xs"></i>
                        </span>
                    </div>
                </div>
            </div>
        `;
  });

  html += `</div>`;
  app.innerHTML = html;
}

// 3. Tampilan Detail (Halaman Satuan)
function renderDetail(id) {
  window.scrollTo(0, 0);
  const item = allSolutions.find((t) => t._id === id);
  if (!item) return;

  // Escape HTML untuk keamanan
  const escape = (str) =>
    str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");

  const detailHtml = `
        <button onclick="renderHome()" class="flex items-center text-slate-400 hover:text-white mb-6 transition-colors group">
            <div class="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center mr-2 group-hover:bg-sajak-accent group-hover:text-sajak-dark">
                <i class="fa-solid fa-arrow-left"></i>
            </div>
            <span class="font-medium">Kembali ke Daftar</span>
        </button>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 fade-in">
            <div class="space-y-6">
                <div>
                    <div class="flex items-center gap-3 mb-2">
                        <span class="text-sajak-accent font-mono text-sm border border-sajak-accent/30 px-2 py-0.5 rounded">Target #${
                          item.targetNumber
                        }</span>
                    </div>
                    <h1 class="text-3xl font-serif font-bold text-white mb-4">${
                      item.title
                    }</h1>
                    <p class="text-slate-400 leading-relaxed">${
                      item.description
                    }</p>
                </div>

                 <div class="bg-sajak-card p-2 rounded-xl border border-slate-700 shadow-xl">
                    <img src="${
                      item.image
                    }" class="w-full h-auto rounded-lg" alt="Target Preview">
                </div>
            </div>

            <div class="flex flex-col h-full">
                <div class="flex items-center justify-between mb-2 px-1">
                    <span class="text-slate-300 font-mono text-sm"><i class="fa-solid fa-code mr-2 text-blue-500"></i>Source Code</span>
                    <button onclick="copyToClipboard('${escape(
                      item.code
                    )}', this)" class="text-xs bg-slate-700 hover:bg-sajak-accent hover:text-sajak-dark text-white px-3 py-1.5 rounded transition-colors flex items-center gap-2">
                        <i class="fa-regular fa-copy"></i> Copy
                    </button>
                </div>
                
                <div class="relative group flex-grow">
                    <div class="w-full h-full min-h-[400px] bg-[#0f172a] p-4 rounded-xl border border-slate-700 font-mono text-sm overflow-auto text-emerald-400 shadow-inner">
                        <pre><code>${escape(item.code)}</code></pre>
                    </div>
                </div>
            </div>
        </div>
        <div class="mt-8 bg-sajak-card p-6 rounded-xl border border-slate-700">
    <div class="flex justify-between items-center mb-4">
        <h3 class="text-white font-bold flex items-center gap-2">
            <i class="fa-regular fa-comments"></i> Diskusi (${
              item.comments ? item.comments.length : 0
            })
        </h3>
        
        <button onclick="likeSolution('${
          item._id
        }')" class="text-slate-400 hover:text-red-500 transition flex items-center gap-2 group">
            <i class="fa-solid fa-heart group-hover:scale-110 transition-transform ${
              hasLiked(item._id) ? "text-red-500" : ""
            }"></i>
            <span id="likeCount-${item._id}">${item.likes || 0}</span> Likes
        </button>
    </div>
    
    <div class="max-h-60 overflow-y-auto mb-4 pr-2 space-y-3 custom-scrollbar">
        ${
          item.comments && item.comments.length > 0
            ? item.comments
                .map(
                  (c) => `
            <div class="flex gap-3">
                <div class="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-white shrink-0">
                    ${c.username.charAt(0).toUpperCase()}
                </div>
                <div class="bg-slate-900/50 p-3 rounded-lg border border-slate-700 w-full">
                    <div class="flex justify-between">
                        <span class="text-xs text-sajak-accent font-bold">${
                          c.username
                        }</span>
                        <span class="text-[10px] text-slate-500">${new Date(
                          c.date
                        ).toLocaleDateString()}</span>
                    </div>
                    <p class="text-sm text-slate-300 mt-1">${c.text}</p>
                </div>
            </div>
        `
                )
                .join("")
            : '<p class="text-slate-500 text-sm italic">Jadilah yang pertama berkomentar.</p>'
        }
    </div>

    <form onsubmit="postComment(event, '${
      item._id
    }')" class="relative flex gap-2">
        <input type="text" id="usernameInput" placeholder="Nama..." class="w-1/4 bg-slate-900 border border-slate-600 rounded-lg py-2 px-3 text-sm text-white focus:border-sajak-accent" required>
        <input type="text" name="commentText" placeholder="Tulis komentar..." class="w-3/4 bg-slate-900 border border-slate-600 rounded-lg py-2 px-3 text-sm text-white focus:border-sajak-accent" required>
        <button type="submit" class="bg-sajak-accent text-sajak-dark px-4 rounded-lg hover:bg-teal-300"><i class="fa-solid fa-paper-plane"></i></button>
    </form>
    </div>
    `;
  app.innerHTML = detailHtml;

  setTimeout(() => {
    const savedName = localStorage.getItem("comment_username");
    if (savedName && document.getElementById("usernameInput")) {
      document.getElementById("usernameInput").value = savedName;
    }
  }, 100);
}

// 1. Cek apakah user sudah pernah like (simpan di localStorage)
function hasLiked(id) {
  const likedPosts = JSON.parse(localStorage.getItem("liked_posts") || "[]");
  return likedPosts.includes(id);
}

// 2. Kirim Like
async function likeSolution(id) {
  if (hasLiked(id)) return; // Cegah like 2 kali

  await fetch(`/api/solutions/${id}/like`, { method: "POST" });

  // Update tampilan angka tanpa refresh
  const counter = document.getElementById(`likeCount-${id}`);
  counter.innerText = parseInt(counter.innerText) + 1;
  counter.previousElementSibling.classList.add("text-red-500"); // Merahkan hati

  // Simpan history like
  const likedPosts = JSON.parse(localStorage.getItem("liked_posts") || "[]");
  likedPosts.push(id);
  localStorage.setItem("liked_posts", JSON.stringify(likedPosts));
}

// 3. Kirim Komentar
async function postComment(e, id) {
  e.preventDefault();
  const username = document.getElementById("usernameInput").value;
  const text = e.target.commentText.value;

  await fetch(`/api/solutions/${id}/comment`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, text }),
  });

  // Simpan username biar next time auto-fill
  localStorage.setItem("comment_username", username);

  // Refresh detail page untuk melihat komentar baru
  fetchSolutions().then(() => renderDetail(id));
}

// Helper Copy Code
function copyToClipboard(text, btn) {
  // Kita perlu decode dulu karena tadi di-escape
  const textArea = document.createElement("textarea");
  textArea.value = text
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
  document.body.appendChild(textArea);
  textArea.select();
  document.execCommand("Copy");
  textArea.remove();

  const originalHTML = btn.innerHTML;
  btn.innerHTML = `<i class="fa-solid fa-check"></i> Copied!`;
  btn.classList.add("bg-green-600", "text-white");
  setTimeout(() => {
    btn.innerHTML = originalHTML;
    btn.classList.remove("bg-green-600");
  }, 2000);
}

// Mulai Aplikasi
fetchSolutions();
