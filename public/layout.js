// public/layout.js

// 1. Header Layout
const headerHTML = `
    <header class="sticky top-0 z-50 bg-sajak-dark/95 backdrop-blur border-b border-slate-700 shadow-lg">
        <div class="container mx-auto px-4 h-16 flex items-center justify-between">
            <a href="/" class="flex items-center gap-3 group">
                
                <div class="relative w-10 h-10 flex items-center justify-center bg-sajak-card rounded-lg border border-slate-600 group-hover:border-sajak-accent transition-colors overflow-hidden p-1">
                   <img src="/images/logo.png" alt="Logo Sajak Kode" class="w-full h-full object-contain">
                </div>
                <div>
                    <h1 class="font-serif text-xl font-bold text-white tracking-wide">Sajak<span class="text-sajak-accent font-mono">Kode</span></h1>
                </div>
            </a>
            
            <nav class="flex gap-6 text-sm font-medium text-slate-300">
                <a href="/" class="hover:text-sajak-accent transition-colors">Beranda</a>
            </nav>
        </div>
    </header>
    <main id="app" class="flex-grow container mx-auto px-4 py-8 min-h-screen">
`;

// 2. Footer Layout
const footerHTML = `
    </main>
    <footer class="bg-sajak-card border-t border-slate-700 mt-auto">
        <div class="container mx-auto px-4 py-8">
            <div class="flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
                <div>
                    <div class="flex items-center justify-center md:justify-start gap-2 mb-2">
                        <img src="/images/logo.png" alt="Logo Sajak Kode" class="w-8 h-8">
                        <span class="font-serif font-bold text-white text-lg">SajakKode</span>
                    </div>
                    <p class="text-sm text-slate-400">Tempat logika bertemu estetika.</p>
                </div>
                <div class="text-sm text-slate-500">
                    &copy; 2026 Sajak Kode. <span class="text-slate-400">Dari Logika menjadi Rangkaian Kata.</span>
                </div>
            </div>
        </div>
    </footer>
`;

// Inject ke DOM
document.body.insertAdjacentHTML("afterbegin", headerHTML);
document.body.insertAdjacentHTML("beforeend", footerHTML);

// Cek Login untuk ubah menu Admin
if (localStorage.getItem("adminToken")) {
  const adminLink = document.getElementById("admin-link");
  if (adminLink) {
    adminLink.innerText = "Dashboard";
    adminLink.href = "/admin.html";
    adminLink.classList.add("text-sajak-accent", "font-bold");
  }
}
