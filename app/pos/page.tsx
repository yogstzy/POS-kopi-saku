// app/pos/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "../../store/useCartStore";
import { 
  Search, Moon, LayoutDashboard, Utensils, Settings, BarChart2,  
  HelpCircle, LogOut, Plus, Minus, ReceiptText, User, X,
  CalculatorIcon, Menu, ShoppingCart,
  LucideCoffee,
  Coffee,
  CoffeeIcon
} from "lucide-react";
import StrukPrinter from "./StrukPrinter";

export default function PosPage() {
  const router = useRouter();
  
  // State Data
  const [menuKopi, setMenuKopi] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [settingsData, setSettingsData] = useState<any>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  
  // State Order & Filter
  const [customerName, setCustomerName] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [activeCategory, setActiveCategory] = useState("All Items");
  const [searchQuery, setSearchQuery] = useState(""); 
  
  // State Modal Asli
  const [showQrisModal, setShowQrisModal] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);

  // ================= STATE BARU UNTUK MOBILE =================
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showMobileCart, setShowMobileCart] = useState(false);
  // ===========================================================

  const { items: cartItems, tambahItem, kurangiItem, bersihkanKeranjang, hitungTotal } = useCartStore();

  useEffect(() => {
    const session = localStorage.getItem("userSession");
    if (!session) router.push("/login");
    else {
      setUser(JSON.parse(session));
      setIsAuthChecking(false);
    }
  }, [router]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const responseProd = await fetch("/api/products", { cache: "no-store" });
        const dataProd = await responseProd.json();
        setMenuKopi(dataProd);

        const uniqueCategories: any[] = [];
        dataProd.forEach((item: any) => {
          if (item.category && !uniqueCategories.find(c => c.id === item.category.id)) {
            uniqueCategories.push(item.category);
          }
        });
        setCategories(uniqueCategories);

        const responseSet = await fetch("/api/settings", { cache: "no-store" });
        const dataSet = await responseSet.json();
        setSettingsData(dataSet);

      } catch (error) { 
        console.error("Gagal load data", error); 
      } finally { 
        setIsLoading(false); 
      }
    };
    fetchData();
  }, []);

  const subtotal = hitungTotal();
  const isTaxActive = settingsData?.taxEnabled ?? false;
  const taxRate = isTaxActive ? (settingsData?.taxRate ?? 0) : 0;
  const pajak = subtotal * (taxRate / 100);

  const isServiceActive = settingsData?.serviceChargeEnabled ?? false;
  const serviceRate = isServiceActive ? (settingsData?.serviceChargeRate ?? 0) : 0;
  const serviceCharge = subtotal * (serviceRate / 100);

  const totalKeseluruhan = subtotal + pajak + serviceCharge;

  // Hitung total kuantitas item untuk notifikasi di keranjang
  const totalItemCount = cartItems.reduce((acc, item) => acc + item.qty, 0);

  const handleLogout = () => {
    localStorage.removeItem("userSession");
    router.push("/login");
  };

  const handleNewOrder = () => {
    if (cartItems.length > 0 && !confirm("Pesanan saat ini belum dibayar. Yakin ingin membuat pesanan baru?")) return;
    bersihkanKeranjang();
    setCustomerName("");
    setPaymentMethod("CASH");
    setShowMobileCart(false); // Tutup keranjang mobile jika ada
  };

  const filteredMenu = menuKopi.filter(item => {
    const matchCategory = activeCategory === "All Items" || item.category?.name === activeCategory;
    const matchSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  const handleKlikBayar = () => {
    if (cartItems.length === 0) return;
    if (paymentMethod === "QRIS") {
      setShowQrisModal(true); 
    } else {
      prosesPembayaran(); 
    }
  };

  const prosesPembayaran = async () => {
    try {
      const response = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          totalAmount: totalKeseluruhan, 
          paymentMethod: paymentMethod, 
          items: cartItems 
        }),
      });

      if (response.ok) {
        alert(`Sukses! Pembayaran berhasil.`);
        window.print();
        bersihkanKeranjang();
        setCustomerName("");
        setPaymentMethod("CASH");
        setShowQrisModal(false);
        setShowMobileCart(false); // Otomatis tutup cart di HP setelah bayar
      } else alert("Gagal menyimpan transaksi.");
    } catch (error) { alert("Kesalahan jaringan."); }
  };

  if (isAuthChecking) return <div className="h-screen bg-[#f8f7f5] flex items-center justify-center">Memeriksa akses...</div>;

  return (
    <div className="flex h-screen bg-[#f8f7f5] font-sans text-gray-800 overflow-hidden relative w-full">
      
      {/* ================= BACKDROP SIDEBAR MOBILE ================= */}
      {showMobileMenu && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm transition-opacity" 
          onClick={() => setShowMobileMenu(false)}
        ></div>
      )}

      {/* ================= 1. SIDEBAR (KIRI) ================= */}
      {/* DI HP: Tersembunyi (geser ke kiri) sampai tombol Hamburger ditekan */}
      {/* DI DESKTOP: Tetap terlihat wajar */}
      <div className={`fixed lg:relative inset-y-0 left-0 z-50 w-64 bg-[#f8f7f5] border-r border-gray-200 flex flex-col pt-8 pb-6 px-4 shrink-0 transform transition-transform duration-300 lg:translate-x-0 ${showMobileMenu ? "translate-x-0" : "-translate-x-full"}`}>
        
        {/* Tombol Tutup Khusus Mobile */}
        <button className="lg:hidden absolute top-4 right-4 p-2 bg-gray-200 text-gray-600 rounded-full" onClick={() => setShowMobileMenu(false)}>
          <X size={16} />
        </button>

        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-[#38220f] text-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-md overflow-hidden">
             {settingsData?.storeLogoUrl ? (
                <img src={`/${settingsData.storeLogoUrl}`} alt="Logo" className="w-full h-full object-cover" />
             ) : (
                <CoffeeIcon size={24} />
             )}
          </div>
          <h1 className="text-2xl font-black text-gray-900">{settingsData?.storeName || "Kopi Saku"}</h1>
          <p className="text-xs text-gray-500 font-medium tracking-wide">Web Online Kasir</p>
        </div>

        <button onClick={handleNewOrder} className="w-full bg-[#38220f] hover:bg-black text-white py-3.5 rounded-xl font-bold flex items-center justify-center space-x-2 shadow-lg mb-8 transition-transform active:scale-95">
          <Plus size={20} />
          <span>New Order</span>
        </button>

        <div className="flex-1 space-y-2">
          {user?.role === "ADMIN" && (
            <button onClick={() => router.push("/admin")} className="w-full flex items-center space-x-3 px-4 py-3 text-gray-600 font-semibold hover:bg-gray-100 rounded-xl transition">
              <LayoutDashboard size={20} /><span>Admin Dashboard</span>
            </button>
          )}
          <button className="w-full flex items-center space-x-3 px-4 py-3 bg-amber-100/50 text-amber-900 rounded-xl font-bold border-l-4 border-amber-700 transition">
            <CalculatorIcon size={20} /><span>POS/Cashier</span>
          </button>
        </div>

        <div className="border-t border-gray-200 pt-4 space-y-2">
          <button onClick={() => setShowAboutModal(true)} className="w-full flex items-center space-x-3 px-4 py-3 text-gray-500 font-semibold hover:bg-gray-100 rounded-xl transition">
            <HelpCircle size={20} /><span>About</span>
          </button>
          <button onClick={handleLogout} className="w-full flex items-center space-x-3 px-4 py-3 text-gray-500 font-semibold hover:bg-red-50 hover:text-red-600 rounded-xl transition">
            <LogOut size={20} /><span>Logout</span>
          </button>
        </div>
      </div>

      {/* ================= 2. MAIN CONTENT ================= */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative w-full">
        
        {/* ================= TOPBAR MOBILE ONLY ================= */}
        <div className="lg:hidden flex justify-between items-center px-4 py-4 bg-white shadow-sm z-10 border-b border-gray-100">
          <button onClick={() => setShowMobileMenu(true)} className="p-2 bg-gray-100 rounded-lg text-gray-600 hover:bg-gray-200 transition">
            <Menu size={20} />
          </button>
          
          <h1 className="text-lg font-black text-gray-900 truncate px-4">{settingsData?.storeName || "Kopi Saku"}</h1>
          
          <button onClick={() => setShowMobileCart(true)} className="p-2 bg-amber-100 text-amber-900 rounded-lg relative hover:bg-amber-200 transition">
            <ShoppingCart size={20} />
            {totalItemCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-sm">
                {totalItemCount}
              </span>
            )}
          </button>
        </div>

        {/* ================= TOPBAR DESKTOP (Search & Profile) ================= */}
        {/* Padding responsif: Di HP px-4, Di Desktop px-8 */}
        <div className="px-4 lg:px-8 py-4 lg:py-6 flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Search menu..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#38220f] shadow-sm text-sm" 
            />
          </div>
          
          {/* Sembunyikan Info Profil di HP, karena sudah terwakili di Topbar Mobile */}
          <div className="hidden lg:flex items-center space-x-6">
            <button className="p-2 text-gray-400 hover:text-gray-800 transition"><LucideCoffee size={24} /></button>
            <div className="flex items-center space-x-3 border-l border-gray-300 pl-6">
              <div className="text-right">
                <p className="text-sm font-bold text-gray-800">{user?.name}</p>
                <p className="text-xs text-gray-500">{user?.role}</p>
              </div>
              <div className="w-10 h-10 bg-amber-700 rounded-full flex items-center justify-center text-white font-bold border-2 border-white shadow-sm">
                <User size={20}/>
              </div>
            </div>
          </div>
        </div>

        {/* Categories Pills */}
        <div className="px-4 lg:px-8 pb-4 flex space-x-3 overflow-x-auto custom-scrollbar">
          <button 
            onClick={() => setActiveCategory("All Items")}
            className={`px-6 py-2 rounded-full text-sm font-bold whitespace-nowrap transition shadow-sm ${
              activeCategory === "All Items" ? "bg-[#38220f] text-white border border-[#38220f]" : "bg-white text-gray-600 border border-gray-200 hover:border-amber-700"
            }`}
          >
            All Items
          </button>
          
          {categories.map(cat => (
            <button 
              key={cat.id}
              onClick={() => setActiveCategory(cat.name)}
              className={`px-6 py-2 rounded-full text-sm font-bold whitespace-nowrap transition shadow-sm ${
                activeCategory === cat.name ? "bg-[#38220f] text-white border border-[#38220f]" : "bg-white text-gray-600 border border-gray-200 hover:border-amber-700"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        {/* Tambahkan padding bottom lebih besar di HP (pb-24) agar tidak tertutup tombol melayang */}
        <div className="flex-1 overflow-y-auto px-4 lg:px-8 pb-24 lg:pb-8 pt-2">
          {isLoading ? (
            <p className="text-gray-500">Memuat menu...</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
              {filteredMenu.map((item) => (
                <div key={item.id} className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between group hover:shadow-lg transition-all">
                  <div>
                    <div className="w-full h-24 lg:h-32 rounded-xl mb-4 overflow-hidden relative bg-stone-100 flex items-center justify-center">
                       {item.imageUrl ? (
                         <img src={item.imageUrl.startsWith("http") ? item.imageUrl : `/products/${item.imageUrl}`} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                       ) : (
                         <Utensils size={32} className="text-stone-300 group-hover:text-amber-200" />
                       )}
                    </div>
                    <h3 className="text-sm lg:text-lg font-bold text-gray-800 leading-tight">{item.name}</h3>
                    <p className="text-[10px] lg:text-xs text-gray-400 mt-1">{item.category?.name}</p>
                  </div>
                  <div className="flex justify-between items-end mt-4">
                    <p className="text-sm lg:text-base text-gray-800 font-semibold">Rp {item.price.toLocaleString("id-ID")}</p>
                    <button 
                      onClick={() => tambahItem({ id: item.id, nama: item.name, harga: item.price })}
                      className="w-7 h-7 lg:w-8 lg:h-8 rounded-full bg-[#8D6E63] hover:bg-[#5D4037] text-white flex items-center justify-center shadow-md transition-transform active:scale-90"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
              ))}
              {filteredMenu.length === 0 && (
                <div className="col-span-full text-center py-20 text-gray-400 font-bold">Produk tidak ditemukan.</div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ================= BACKDROP CART MOBILE ================= */}
      {showMobileCart && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm transition-opacity" 
          onClick={() => setShowMobileCart(false)}
        ></div>
      )}

      {/* ================= 3. CURRENT ORDER / CART (KANAN) ================= */}
      {/* DI HP: Fullscreen meluncur dari kanan. DI DESKTOP: Menempel di kanan (400px) */}
      <div className={`fixed lg:relative inset-y-0 right-0 z-50 w-full sm:w-[400px] h-full lg:p-4 lg:pl-0 shrink-0 transform transition-transform duration-300 lg:translate-x-0 ${showMobileCart ? "translate-x-0" : "translate-x-full"}`}>
        
        <div className="bg-white h-full lg:rounded-3xl shadow-2xl lg:shadow-sm lg:border border-gray-100 flex flex-col p-5 lg:p-6 relative overflow-hidden w-full">
          
          <div className="flex justify-between items-center mb-6 pt-2 lg:pt-0">
            <h2 className="text-xl lg:text-2xl font-black text-gray-800 flex items-center">
              <ReceiptText className="mr-2 text-gray-800" size={24} /> Current Order
            </h2>
            {/* Tombol Tutup Cart Mobile */}
            <button className="lg:hidden p-2 bg-gray-100 text-gray-600 rounded-full" onClick={() => setShowMobileCart(false)}>
              <X size={20} />
            </button>
          </div>

          <div className="mb-4 space-y-3">
            <input 
              type="text" placeholder="Masukkan nama pelanggan..." value={customerName} onChange={(e) => setCustomerName(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#38220f] text-gray-800"
            />
            <select
              value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#38220f] text-gray-800 appearance-none"
            >
              <option value="CASH">Tunai (Cash)</option>
              <option value="QRIS">QRIS</option>
            </select>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-4">
            {cartItems.length === 0 ? (
              <p className="text-center text-gray-400 mt-10 text-sm">Belum ada pesanan</p>
            ) : (
              cartItems.map((item) => (
                <div key={item.id} className="flex justify-between items-center p-3 border border-gray-100 rounded-xl">
                  <div className="flex flex-col">
                    <p className="font-bold text-gray-800 text-sm">{item.nama}</p>
                    <div className="flex items-center space-x-3 mt-2">
                       <button onClick={() => kurangiItem(item.id)} className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200"><Minus size={12}/></button>
                       <span className="text-sm font-bold">{item.qty}</span>
                       <button onClick={() => tambahItem(item)} className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200"><Plus size={12}/></button>
                    </div>
                  </div>
                  <p className="font-bold text-gray-800 text-sm">Rp {(item.harga * item.qty).toLocaleString("id-ID")}</p>
                </div>
              ))
            )}
          </div>

          <div className="pt-4 mt-2 border-t border-gray-100 pb-2 lg:pb-0">
            <div className="flex justify-between text-sm text-gray-500 mb-2 font-medium">
              <span>Subtotal</span><span>Rp {subtotal.toLocaleString("id-ID")}</span>
            </div>
            {isTaxActive && (
              <div className="flex justify-between text-sm text-gray-500 mb-2 font-medium">
                <span>Tax ({taxRate}%)</span><span>Rp {pajak.toLocaleString("id-ID")}</span>
              </div>
            )}
            {isServiceActive && (
              <div className="flex justify-between text-sm text-gray-500 mb-2 font-medium">
                <span>Service Charge ({serviceRate}%)</span><span>Rp {serviceCharge.toLocaleString("id-ID")}</span>
              </div>
            )}
            <div className="flex justify-between items-center mb-6 mt-4">
              <span className="text-xl font-bold text-gray-800">Total</span>
              <span className="text-2xl font-black text-gray-900">Rp {totalKeseluruhan.toLocaleString("id-ID")}</span>
            </div>
            
            <button 
              onClick={handleKlikBayar} disabled={cartItems.length === 0}
              className={`w-full py-4 rounded-2xl font-bold text-lg transition shadow-lg ${
                cartItems.length > 0 ? "bg-[#38220f] hover:bg-black text-white" : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
            >
              Bayar Sekarang →
            </button>
          </div>
        </div>
      </div>

      {/* ================= FLOATING CART BUTTON (MOBILE ONLY) ================= */}
      {!showMobileCart && cartItems.length > 0 && (
        <div 
          className="lg:hidden fixed bottom-6 left-4 right-4 bg-[#38220f] text-white p-4 rounded-2xl shadow-2xl flex justify-between items-center z-30 cursor-pointer animate-in slide-in-from-bottom-5"
          onClick={() => setShowMobileCart(true)}
        >
          <div className="flex flex-col">
             <span className="font-bold text-sm text-amber-200">{totalItemCount} Items</span>
             <span className="font-black text-xl">Rp {subtotal.toLocaleString("id-ID")}</span>
          </div>
          <span className="font-bold bg-white text-[#38220f] px-5 py-2.5 rounded-xl shadow-sm text-sm">
            Lihat Pesanan
          </span>
        </div>
      )}

      {/* ================= MODAL QRIS ================= */}
      {showQrisModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-white p-8 rounded-3xl w-full max-w-sm shadow-2xl relative flex flex-col items-center animate-in fade-in zoom-in duration-300">
            <button onClick={() => setShowQrisModal(false)} className="absolute top-4 right-4 p-2 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200 transition"><X size={20} /></button>
            <h2 className="text-2xl font-black text-gray-900 mb-2">Pembayaran QRIS</h2>
            <p className="text-sm font-medium text-gray-500 text-center mb-6">Minta pelanggan scan barcode di bawah ini menggunakan aplikasi e-Wallet atau m-Banking.</p>

            <div className="w-64 h-64 bg-gray-100 rounded-2xl flex items-center justify-center overflow-hidden mb-6 border-2 border-dashed border-gray-300">
              {settingsData?.qrisImageUrl ? (
                <img src={`/${settingsData.qrisImageUrl}`} alt="QRIS" className="w-full h-full object-contain" />
              ) : (
                <div className="text-center p-4">
                  <p className="text-sm font-bold text-gray-400">Gambar QRIS Belum Diset</p>
                  <p className="text-xs text-gray-400 mt-1">Harap upload via menu Settings Admin</p>
                </div>
              )}
            </div>

            <div className="w-full bg-[#fcfbf9] border border-gray-200 rounded-xl p-4 text-center mb-6">
              <p className="text-xs font-bold text-gray-500 mb-1">TOTAL TAGIHAN</p>
              <p className="text-3xl font-black text-amber-700">Rp {totalKeseluruhan.toLocaleString("id-ID")}</p>
            </div>
            <button onClick={prosesPembayaran} className="w-full py-4 bg-[#38220f] hover:bg-black text-white rounded-xl font-bold transition shadow-md flex items-center justify-center">Transaksi Berhasil</button>
          </div>
        </div>
      )}

      {/* ================= MODAL ABOUT ================= */}
      {showAboutModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-white p-8 rounded-3xl w-full max-w-md shadow-2xl relative animate-in fade-in zoom-in duration-300">
            <button 
              onClick={() => setShowAboutModal(false)}
              className="absolute top-4 right-4 p-2 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200 transition"
            >
              <X size={20} />
            </button>

            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-[#38220f] text-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
                <Coffee size={32} />
              </div>
              <h2 className="text-2xl font-black text-gray-900">Kopi Saku POS</h2>
              <p className="text-sm font-bold text-amber-700 mt-1">Versi 1.0.0</p>
            </div>

            <div className="space-y-4 text-sm text-gray-600 font-medium text-center px-4">
              <p>Aplikasi Point of Sale (POS) modern berbasis web yang dirancang khusus untuk mempermudah operasional kedai kopi.</p>
              <p>Terintegrasi dengan manajemen produk, pelacakan laporan penjualan real-time, pengaturan pajak dinamis, integrasi QRIS, dan pencetakan struk kasir thermal.</p>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-100 text-center">
              <p className="text-xs text-gray-400 font-bold mb-1">Built with Next.js, Tailwind CSS, Prisma & PostgreSQL</p>
              <p className="text-xs text-gray-400">© 2026 Kopi Saku. Developed by Yoga</p>
            </div>
          </div>
        </div>
      )}

      {/* Komponen Struk */}
      {cartItems.length > 0 && settingsData && (
        <StrukPrinter
          storeLogoUrl={settingsData.storeLogoUrl} 
          storeName={settingsData.storeName}
          storeAddress={settingsData.storeAddress}
          receiptFooter={settingsData.receiptFooter}
          kasirName={user?.name || "Kasir"}
          customerName={customerName} 
          items={cartItems}
          subtotal={subtotal}
          taxRate={taxRate}
          pajak={pajak}
          serviceRate={serviceRate}
          serviceCharge={serviceCharge}
          total={totalKeseluruhan}
          paymentMethod={paymentMethod}
        />
      )}
    </div>
  );
}