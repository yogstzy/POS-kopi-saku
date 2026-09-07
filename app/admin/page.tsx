// app/admin/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "../../store/useCartStore";
import { 
  Plus, Edit, Trash2, Search, Moon, User, X,
  Utensils, LayoutDashboard, Settings, BarChart2, HelpCircle, LogOut,
  Coffee, Droplet, LayoutGrid, List, ReceiptText,
  DollarSign, ShoppingBag, TrendingUp, TrendingDown, Download, Filter, ChevronDown,
  Store, CreditCard, Printer, Users, Shield, Image as ImageIcon, QrCode,
  Menu, // <--- TAMBAHAN ICON MENU
  HomeIcon,
  SunIcon,
  CoffeeIcon,
  BottleWineIcon
} from "lucide-react";
import { Just_Another_Hand } from "next/font/google";

export default function AdminPage() {
  const router = useRouter();
  
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  
  const [activeTab, setActiveTab] = useState<"MENU" | "SALES" | "SETTINGS">("MENU");
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");

  const [timeRange, setTimeRange] = useState<"DAILY" | "WEEKLY" | "MONTHLY">("WEEKLY");
  const [salesCategory, setSalesCategory] = useState<string>("All");
  const [isCatDropdownOpen, setIsCatDropdownOpen] = useState(false);

  const [activeSetting, setActiveSetting] = useState<string>("Store & Receipt");
  const [settingsData, setSettingsData] = useState({
    storeName: "", storePhone: "", storeAddress: "", receiptFooter: "",
    taxEnabled: false, taxRate: 11, serviceChargeEnabled: false, serviceChargeRate: 5, qrisImageUrl: "", storeLogoUrl: ""
  });
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ id: "", name: "", price: "", categoryId: "", imageUrl: "" });
  const [isEditMode, setIsEditMode] = useState(false);

  const [showAboutModal, setShowAboutModal] = useState(false);
  
  // ================= STATE BARU UNTUK MOBILE =================
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  // ===========================================================

  const { bersihkanKeranjang } = useCartStore();

  useEffect(() => {
    const session = localStorage.getItem("userSession");
    if (!session) router.push("/login");
    else {
      const userData = JSON.parse(session);
      if (userData.role !== "ADMIN") {
        alert("Akses Ditolak: Halaman ini khusus Admin.");
        router.push("/pos");
        return;
      }
      setUser(userData);
      fetchData();
    }
  }, [router]);

  const fetchData = async () => {
    try {
      const resProd = await fetch("/api/products");
      const dataProd = await resProd.json();
      setProducts(dataProd);

      const resCat = await fetch("/api/categories");
      if (resCat.ok) setCategories(await resCat.json());

      const resTrx = await fetch("/api/transactions");
      if (resTrx.ok) setTransactions(await resTrx.json());

      const resSet = await fetch("/api/settings");
      if (resSet.ok) {
        const dataSet = await resSet.json();
        if (dataSet) setSettingsData(dataSet);
      }
    } catch (error) { console.error("Gagal load data", error); } 
    finally { setIsLoading(false); }
  };

  const handleSaveSettings = async () => {
    setIsSavingSettings(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settingsData),
      });
      if (res.ok) alert("Pengaturan berhasil disimpan!");
      else alert("Gagal menyimpan pengaturan.");
    } catch (error) { alert("Terjadi kesalahan sistem saat menyimpan."); } 
    finally { setIsSavingSettings(false); }
  };

  const handleNewOrder = () => {
    bersihkanKeranjang();
    router.push("/pos"); 
  };

  const handleLogout = () => {
    localStorage.removeItem("userSession");
    router.push("/login");
  };

  const openModal = (product: any = null) => {
    if (product) {
      setIsEditMode(true);
      setFormData({ 
        id: product.id, name: product.name, price: product.price, 
        categoryId: product.categoryId, imageUrl: product.imageUrl || ""
      });
    } else {
      setIsEditMode(false);
      setFormData({ 
        id: "", name: "", price: "", 
        categoryId: categories.length > 0 ? categories[0].id : "", imageUrl: ""
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = isEditMode ? "PUT" : "POST";
    try {
      const res = await fetch("/api/products", {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setIsModalOpen(false);
        fetchData();
        alert(isEditMode ? "Produk diupdate!" : "Produk ditambahkan!");
      } else alert("Gagal menyimpan data.");
    } catch (error) { alert("Terjadi kesalahan jaringan."); }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Yakin ingin menghapus produk ${name}?`)) return;
    try {
      const res = await fetch(`/api/products?id=${id}`, { method: "DELETE" });
      if (res.ok) fetchData();
    } catch (error) { alert("Gagal menghapus produk"); }
  };

  const filteredProducts = products.filter(p => {
    const matchCategory = activeCategory === "All" ? true : p.category?.name === activeCategory;
    const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfWeek = new Date(startOfToday);
  startOfWeek.setDate(startOfToday.getDate() - (startOfToday.getDay() === 0 ? 6 : startOfToday.getDay() - 1));
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const filteredTrx = transactions.filter(t => {
    const tDate = new Date(t.createdAt);
    if (timeRange === "DAILY") return tDate >= startOfToday;
    if (timeRange === "WEEKLY") return tDate >= startOfWeek;
    if (timeRange === "MONTHLY") return tDate >= startOfMonth;
    return true;
  });

  let totalRevenue = 0;
  let totalOrders = 0;
  const productStats: Record<number, any> = {};
  const weeklyRev = [0, 0, 0, 0, 0, 0, 0]; 
  const hourBuckets = { 8: 0, 10: 0, 12: 0, 14: 0, 16: 0, 18: 0, 20: 0 };

  filteredTrx.forEach(t => {
    const tDate = new Date(t.createdAt);
    let dayIdx = tDate.getDay() - 1; if(dayIdx === -1) dayIdx = 6;
    const hour = tDate.getHours();
    let trxHasValidCategory = false;

    t.items?.forEach((item: any) => {
      const catName = item.product?.category?.name || "Uncategorized";
      if (salesCategory === "All" || catName === salesCategory) {
        totalRevenue += item.subtotal;
        trxHasValidCategory = true;
        const pid = item.productId;
        if (!productStats[pid]) {
          productStats[pid] = { name: item.product?.name, category: catName, units: 0, revenue: 0 };
        }
        productStats[pid].units += item.qty;
        productStats[pid].revenue += item.subtotal;
        if (tDate >= startOfWeek) weeklyRev[dayIdx] += item.subtotal;
      }
    });

    if (trxHasValidCategory) {
      totalOrders++;
      if (hour >= 6 && hour < 10) hourBuckets[8]++;
      else if (hour >= 10 && hour < 12) hourBuckets[10]++;
      else if (hour >= 12 && hour < 14) hourBuckets[12]++;
      else if (hour >= 14 && hour < 16) hourBuckets[14]++;
      else if (hour >= 16 && hour < 18) hourBuckets[16]++;
      else if (hour >= 18 && hour < 20) hourBuckets[18]++;
      else if (hour >= 20) hourBuckets[20]++;
    }
  });

  const avgTransaction = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;
  const topProducts = Object.values(productStats).sort((a, b) => b.revenue - a.revenue).slice(0, 4);
  const maxWeeklyRev = Math.max(...weeklyRev, 1);
  const maxHourBucket = Math.max(...Object.values(hourBuckets), 1);

  const exportToCSV = () => {
    let csv = "Order ID,Date,Items Summary,Total Amount\n";
    filteredTrx.forEach(t => {
      const dateStr = new Date(t.createdAt).toLocaleString("id-ID").replace(/,/g, '');
      const itemsSum = t.items?.map((i:any) => `${i.qty}x ${i.product?.name}`).join(" | ");
      csv += `#TRX-${t.id},${dateStr},${itemsSum},${t.totalAmount}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `KopiSaku_Report_${timeRange}_${salesCategory}.csv`; a.click();
    window.URL.revokeObjectURL(url);
  };

  if (isLoading) return <div className="h-screen bg-[#f8f7f5] flex items-center justify-center">Memuat Dashboard...</div>;

  return (
    <div className="flex h-screen bg-[#f8f7f5] font-sans text-gray-800 overflow-hidden relative w-full">
      
      {/* ================= BACKDROP SIDEBAR MOBILE ================= */}
      {showMobileMenu && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm transition-opacity" 
          onClick={() => setShowMobileMenu(false)}
        ></div>
      )}

      {/* ================= 1. SIDEBAR ================= */}
      {/* DI HP: Tersembunyi (geser ke kiri). DI DESKTOP: Tetap terlihat */}
      <div className={`fixed lg:relative inset-y-0 left-0 z-50 w-64 bg-[#f8f7f5] border-r border-gray-200 flex flex-col pt-8 pb-6 px-4 shrink-0 transform transition-transform duration-300 lg:translate-x-0 ${showMobileMenu ? "translate-x-0" : "-translate-x-full"}`}>
        
        {/* Tombol Tutup Khusus Mobile */}
        <button className="lg:hidden absolute top-4 right-4 p-2 bg-gray-200 text-gray-600 rounded-full" onClick={() => setShowMobileMenu(false)}>
          <X size={16} />
        </button>

        <div className="mb-8 px-4 text-center">
          <h1 className="text-2xl font-black text-gray-900">{settingsData?.storeName || "Kopi Saku"}</h1>
          <p className="text-xs text-gray-500 font-medium tracking-wide mt-1">Admin Dashboard</p>
        </div>

        <button onClick={handleNewOrder} className="w-full bg-[#38220f] hover:bg-black text-white py-3.5 rounded-xl font-bold flex items-center justify-center space-x-2 shadow-lg mb-8 transition-transform active:scale-95">
          <HomeIcon size={20} /><span>Kasir/POS</span>
        </button>

        <div className="flex-1 space-y-2">
          <button onClick={() => { setActiveTab("MENU"); setShowMobileMenu(false); }} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-bold transition ${activeTab === "MENU" ? "bg-[#fcd3a8] text-[#935a24] shadow-sm" : "text-gray-600 hover:bg-gray-100"}`}>
            <LayoutDashboard size={20} /><span>Menu Management</span>
          </button>
          
          <button onClick={() => { setActiveTab("SALES"); setShowMobileMenu(false); }} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-bold transition ${activeTab === "SALES" ? "bg-[#fcd3a8] text-[#935a24] shadow-sm" : "text-gray-600 hover:bg-gray-100"}`}>
            <BarChart2 size={20} /><span>Sales Reports</span>
          </button>
          
          <button onClick={() => { setActiveTab("SETTINGS"); setShowMobileMenu(false); }} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-bold transition ${activeTab === "SETTINGS" ? "bg-[#fcd3a8] text-[#935a24] shadow-sm" : "text-gray-600 hover:bg-gray-100"}`}>
            <Settings size={20} /><span>Settings</span>
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

      {/* ================= 2. MAIN CONTENT AREA ================= */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative w-full">
        
        {/* ================= TOPBAR MOBILE ONLY ================= */}
        <div className="lg:hidden flex justify-between items-center px-4 py-4 bg-white shadow-sm z-10 border-b border-gray-100">
          <button onClick={() => setShowMobileMenu(true)} className="p-2 bg-gray-100 rounded-lg text-gray-600 hover:bg-gray-200 transition">
            <Menu size={20} />
          </button>
          <h1 className="text-lg font-black text-gray-900 truncate px-4">Admin Panel</h1>
          <div className="w-10 h-10 bg-amber-700 rounded-full flex items-center justify-center text-white font-bold border-2 border-white shadow-sm">
            <User size={18}/>
          </div>
        </div>

        {/* ================= TOPBAR DESKTOP (Search & Profile) ================= */}
        {/* Padding responsif px-4 md:px-10 */}
        <div className="px-4 md:px-10 py-4 lg:py-6 flex flex-col md:flex-row gap-4 justify-between items-center bg-[#f8f7f5]">
          {activeTab === "SALES" || activeTab === "SETTINGS" ? (
            <div className="w-full md:w-96"></div> 
          ) : (
            <div className="relative w-full md:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input 
                type="text" 
                placeholder="Search menu..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-full border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#38220f] shadow-sm text-sm" 
              />
            </div>
          )}

          {/* Profil Desktop */}
          <div className="hidden lg:flex items-center space-x-6">
            <button className="p-2 text-gray-400 hover:text-gray-800 transition"><CoffeeIcon size={24} /></button>
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

        <div className="flex-1 overflow-y-auto px-4 md:px-10 pb-10 custom-scrollbar">
          
          {/* ================= TAB 1: MENU MANAGEMENT ================= */}
          {activeTab === "MENU" && (
            <div className="animate-in fade-in duration-500">
              <div className="flex flex-col md:flex-row justify-between md:items-end mb-6 md:mb-8 space-y-4 md:space-y-0">
                <div>
                  <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-2">Menu Management</h1>
                  <p className="text-sm md:text-base text-gray-500 font-medium">Manage your products and categories.</p>
                </div>
                <button onClick={() => openModal()} className="bg-[#38220f] hover:bg-black text-white px-6 py-3.5 rounded-xl font-bold flex items-center justify-center shadow-lg transition hover:-translate-y-0.5">
                  <Plus size={20} className="mr-2" /> Add Product
                </button>
              </div>

              <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">Categories</h2>
              
              {/* Kategori Grid: 2 kolom di HP, 4 di Desktop */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                <div onClick={() => setActiveCategory("All")} className={`p-4 md:p-6 rounded-2xl cursor-pointer transition-all text-center border shadow-sm ${activeCategory === "All" ? "bg-[#fcd3a8] border-[#fcd3a8] shadow-md -translate-y-1" : "bg-white border-gray-100 hover:border-[#fcd3a8]"}`}>
                   <Coffee size={28} className={`mx-auto mb-2 md:mb-3 ${activeCategory === "All" ? "text-[#935a24]" : "text-gray-400"}`} />
                   <h3 className="font-bold text-base md:text-lg text-gray-800">All Items</h3>
                   <p className="text-xs md:text-sm text-gray-500 font-medium">{products.length} items</p>
                </div>
                
                {categories.map((cat) => (
                  <div key={cat.id} onClick={() => setActiveCategory(cat.name)} className={`p-4 md:p-6 rounded-2xl cursor-pointer transition-all text-center border shadow-sm ${activeCategory === cat.name ? "bg-[#fcd3a8] border-[#fcd3a8] shadow-md -translate-y-1" : "bg-white border-gray-100 hover:border-[#fcd3a8]"}`}>
                     <Coffee size={28} className={`mx-auto mb-2 md:mb-3 ${activeCategory === cat.name ? "text-[#935a24]" : "text-gray-400"}`} />
                     <h3 className="font-bold text-base md:text-lg text-gray-800">{cat.name}</h3>
                     <p className="text-xs md:text-sm text-gray-500 font-medium">{products.filter(p=>p.category?.id === cat.id).length} items</p>
                  </div>
                ))}
              </div>

              {/* Produk Grid: 2 kolom di HP, 4 di Desktop */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                {filteredProducts.map((item) => (
                  <div key={item.id} className="bg-white rounded-3xl shadow-sm border border-gray-100 flex flex-col overflow-hidden group relative">
                    <div className="relative w-full h-32 md:h-48 bg-stone-100 flex items-center justify-center">
                       <span className="absolute top-2 right-2 md:top-3 md:right-3 bg-white px-2 py-1 md:px-3 md:py-1 text-[10px] md:text-xs font-bold text-gray-700 rounded-full shadow-sm z-10">
                         {item.category?.name || "Kategori"}
                       </span>
                       {item.imageUrl ? (
                         <img src={item.imageUrl.startsWith("http") ? item.imageUrl : `/products/${item.imageUrl}`} alt={item.name} className="w-full h-full object-cover" />
                       ) : (
                         <CoffeeIcon size={32} className="text-stone-300 md:w-10 md:h-10" />
                       )}
                       {/* Tombol Edit/Delete muncul di Mobile & Desktop saat hover */}
                       <div className="absolute inset-0 bg-black/40 flex items-center justify-center space-x-2 md:space-x-4 opacity-0 group-hover:opacity-100 lg:opacity-0 lg:group-hover:opacity-100 hover:opacity-100 focus-within:opacity-100 transition-opacity duration-300 backdrop-blur-sm">
                          <button onClick={() => openModal(item)} className="p-2 md:p-3 bg-white text-blue-600 rounded-full hover:scale-110 shadow-lg transition"><Edit size={16} className="md:w-5 md:h-5" /></button>
                          <button onClick={() => handleDelete(item.id, item.name)} className="p-2 md:p-3 bg-white text-red-600 rounded-full hover:scale-110 shadow-lg transition"><Trash2 size={16} className="md:w-5 md:h-5" /></button>
                       </div>
                    </div>
                    <div className="p-4 md:p-5 text-center">
                      <h3 className="text-sm md:text-xl font-bold text-gray-900 mb-1 md:mb-2 truncate">{item.name}</h3>
                      <p className="text-sm md:text-xl font-black text-amber-700">Rp {item.price.toLocaleString("id-ID")}</p>
                    </div>
                  </div>
                ))}
                
                {filteredProducts.length === 0 && (
                  <div className="col-span-full text-center py-10 text-gray-400 font-medium">
                    Menu tidak ditemukan.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ================= TAB 2: SALES REPORTS ================= */}
          {activeTab === "SALES" && (
            <div className="animate-in fade-in duration-500">
              
              <div className="flex flex-col lg:flex-row justify-between lg:items-end mb-8 space-y-4 lg:space-y-0">
                <div>
                  <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-2">Sales Reports</h1>
                  <p className="text-sm md:text-base text-gray-500 font-medium">Data analytics and recapitulation.</p>
                </div>
                {/* Filter & Export: Bisa di-scroll menyamping di HP */}
                <div className="flex space-x-2 md:space-x-4 overflow-x-auto pb-2 custom-scrollbar">
                  <div className="flex bg-white rounded-xl shadow-sm border border-gray-200 p-1 shrink-0">
                    <button onClick={()=>setTimeRange("DAILY")} className={`px-3 md:px-5 py-2 rounded-lg text-xs md:text-sm font-bold transition ${timeRange === "DAILY" ? "bg-[#fcd3a8] text-[#935a24] shadow-sm" : "text-gray-500 hover:text-gray-800"}`}>Daily</button>
                    <button onClick={()=>setTimeRange("WEEKLY")} className={`px-3 md:px-5 py-2 rounded-lg text-xs md:text-sm font-bold transition ${timeRange === "WEEKLY" ? "bg-[#fcd3a8] text-[#935a24] shadow-sm" : "text-gray-500 hover:text-gray-800"}`}>Weekly</button>
                    <button onClick={()=>setTimeRange("MONTHLY")} className={`px-3 md:px-5 py-2 rounded-lg text-xs md:text-sm font-bold transition ${timeRange === "MONTHLY" ? "bg-[#fcd3a8] text-[#935a24] shadow-sm" : "text-gray-500 hover:text-gray-800"}`}>Monthly</button>
                  </div>
                  <div className="relative shrink-0">
                    <button onClick={() => setIsCatDropdownOpen(!isCatDropdownOpen)} className="h-full bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-xl text-xs md:text-sm font-bold flex items-center shadow-sm transition">
                      <Filter size={16} className="mr-2" /> {salesCategory === "All" ? "All Cat." : salesCategory} <ChevronDown size={16} className="ml-2"/>
                    </button>
                    {isCatDropdownOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 shadow-xl rounded-xl overflow-hidden z-50">
                        <button onClick={()=>{setSalesCategory("All"); setIsCatDropdownOpen(false)}} className="w-full text-left px-4 py-3 text-sm font-bold text-gray-700 hover:bg-gray-50">All Category</button>
                        {categories.map(c => (
                          <button key={c.id} onClick={()=>{setSalesCategory(c.name); setIsCatDropdownOpen(false)}} className="w-full text-left px-4 py-3 text-sm font-bold text-gray-700 hover:bg-gray-50">{c.name}</button>
                        ))}
                      </div>
                    )}
                  </div>
                  <button onClick={exportToCSV} className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-xl text-xs md:text-sm font-bold flex items-center shadow-sm transition shrink-0">
                    <Download size={16} className="mr-2" /> Export
                  </button>
                </div>
              </div>

              {/* KPI Cards: 1 kolom di HP, 3 di Desktop */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8">
                <div className="bg-white p-5 md:p-6 rounded-3xl shadow-sm border border-gray-100">
                  <div className="flex items-center space-x-2 text-gray-500 font-bold mb-2 md:mb-4">
                    <ReceiptText size={18} /><span>Total Revenue</span>
                  </div>
                  <div className="flex items-end space-x-4">
                    <h3 className="text-2xl md:text-3xl font-black text-gray-900">Rp {totalRevenue.toLocaleString("id-ID")}</h3>
                    {timeRange !== "DAILY" && <span className="bg-green-100 text-green-700 px-2 py-1 rounded-md text-[10px] md:text-xs font-bold mb-1">↑ Active</span>}
                  </div>
                </div>
                <div className="bg-white p-5 md:p-6 rounded-3xl shadow-sm border border-gray-100">
                  <div className="flex items-center space-x-2 text-gray-500 font-bold mb-2 md:mb-4">
                    <ReceiptText size={18} /><span>Avg. Transaction</span>
                  </div>
                  <div className="flex items-end space-x-4">
                    <h3 className="text-2xl md:text-3xl font-black text-gray-900">Rp {avgTransaction.toLocaleString("id-ID")}</h3>
                  </div>
                </div>
                <div className="bg-white p-5 md:p-6 rounded-3xl shadow-sm border border-gray-100">
                  <div className="flex items-center space-x-2 text-gray-500 font-bold mb-2 md:mb-4">
                    <ShoppingBag size={18} /><span>Total Orders</span>
                  </div>
                  <div className="flex items-end space-x-4">
                    <h3 className="text-2xl md:text-3xl font-black text-gray-900">{totalOrders}</h3>
                  </div>
                </div>
              </div>

              {/* Charts Section: 1 kolom ditumpuk di HP */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 mb-8">
                <div className="col-span-1 lg:col-span-2 bg-white p-5 md:p-8 rounded-3xl shadow-sm border border-gray-100">
                  <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 md:mb-8 space-y-2 md:space-y-0">
                    <h3 className="text-lg md:text-xl font-bold text-gray-900">Revenue Overview</h3>
                    <div className="flex items-center text-xs md:text-sm font-bold text-gray-500">
                      <span className="w-2 h-2 md:w-3 md:h-3 bg-[#8b5e34] rounded-full mr-2"></span>This Week ({startOfWeek.toLocaleDateString("id-ID", {month:'short', day:'numeric'})} - Now)
                    </div>
                  </div>
                  <div className="h-40 md:h-48 flex items-end justify-between space-x-2 md:space-x-3 bg-gray-50/50 rounded-xl p-2 md:p-4">
                    {weeklyRev.map((rev, idx) => {
                      const heightPercent = maxWeeklyRev > 1 ? (rev / maxWeeklyRev) * 100 : 10; 
                      const isPeak = rev === maxWeeklyRev && rev > 0;
                      return (
                        <div key={idx} className={`w-full rounded-t-sm md:rounded-t-md transition-all duration-500 relative group cursor-pointer ${isPeak ? 'bg-[#8b5e34]' : 'bg-[#fcdab7] hover:opacity-80'}`} style={{ height: `${heightPercent}%`, minHeight: '10%' }}>
                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] md:text-xs font-bold py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap z-10 pointer-events-none">
                              Rp {rev.toLocaleString('id-ID')}
                            </div>
                            {isPeak && <span className="absolute -top-5 md:-top-6 left-1/2 -translate-x-1/2 text-[8px] md:text-[10px] font-bold text-gray-500">Peak</span>}
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex justify-between text-[10px] md:text-xs font-bold text-gray-400 mt-2 md:mt-3 px-1 md:px-3">
                    <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                  </div>
                </div>

                <div className="bg-white p-5 md:p-8 rounded-3xl shadow-sm border border-gray-100">
                  <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-4 md:mb-6">Peak Hours</h3>
                  <div className="space-y-3 md:space-y-4">
                    {[
                      { time: "08:00", val: hourBuckets[8] },
                      { time: "10:00", val: hourBuckets[10] },
                      { time: "12:00", val: hourBuckets[12] },
                      { time: "14:00", val: hourBuckets[14] },
                      { time: "16:00", val: hourBuckets[16] },
                      { time: "18:00", val: hourBuckets[18] },
                      { time: "20:00", val: hourBuckets[20] },
                    ].map((bar, i) => {
                      const widthPercent = maxHourBucket > 1 ? (bar.val / maxHourBucket) * 100 : 5;
                      const isPeak = bar.val === maxHourBucket && bar.val > 0;
                      return (
                        <div key={i} className="flex items-center space-x-2 md:space-x-3 group relative">
                          <span className="text-[10px] md:text-xs font-bold text-gray-500 w-8 md:w-10">{bar.time}</span>
                          <div className="flex-1 bg-gray-50 rounded-md h-4 md:h-5 flex items-center">
                            <div className={`h-full rounded-md flex items-center justify-center shadow-sm transition-all duration-500 ${isPeak ? 'bg-[#8b5e34]' : 'bg-[#fcdab7]'}`} style={{ width: `${widthPercent}%`, minWidth: '5%' }}>
                               {isPeak && <span className="text-[8px] md:text-[9px] text-white font-bold tracking-wider px-1 hidden md:block">Peak</span>}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* Tabel Top Products: Beri overflow-x-auto agar bisa geser menyamping di HP */}
              <div className="bg-white p-5 md:p-8 rounded-3xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-4 md:mb-6">
                  <h3 className="text-lg md:text-xl font-bold text-gray-900">Top Products</h3>
                  <p className="text-xs md:text-sm font-bold text-gray-400">{timeRange}</p>
                </div>
                <div className="overflow-x-auto custom-scrollbar">
                  <table className="w-full text-left min-w-[600px]">
                    <thead>
                      <tr className="text-[10px] md:text-xs font-bold text-gray-400 border-b border-gray-100">
                        <th className="pb-3 md:pb-4 w-10">#</th>
                        <th className="pb-3 md:pb-4">PRODUCT NAME</th>
                        <th className="pb-3 md:pb-4 text-center">UNITS SOLD</th>
                        <th className="pb-3 md:pb-4 text-right">REVENUE</th>
                        <th className="pb-3 md:pb-4 text-right pr-4">PROFIT METRIC</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topProducts.length === 0 ? (
                        <tr><td colSpan={5} className="py-8 text-center text-gray-400 text-sm">Belum ada data penjualan.</td></tr>
                      ) : (
                        topProducts.map((product, index) => {
                          const marginWidth = Math.max(30, 85 - (index * 15)); 
                          return (
                            <tr key={index} className="border-b border-gray-50 hover:bg-gray-50 transition group">
                              <td className="py-3 md:py-4 font-bold text-gray-500 text-sm">{index + 1}</td>
                              <td className="py-3 md:py-4 flex items-center space-x-3 md:space-x-4">
                                <div className="w-10 h-10 md:w-12 md:h-12 bg-[#f5f0eb] rounded-xl flex items-center justify-center text-[#8b5e34] group-hover:scale-105 transition">
                                   <Coffee size={18} className="md:w-5 md:h-5" />
                                </div>
                                <div>
                                  <p className="font-bold text-gray-900 text-sm">{product.name}</p>
                                  <p className="text-[10px] md:text-xs font-medium text-gray-500">{product.category}</p>
                                </div>
                              </td>
                              <td className="py-3 md:py-4 text-center font-bold text-gray-700 text-sm">{product.units}</td>
                              <td className="py-3 md:py-4 text-right font-bold text-gray-900 text-sm">Rp {product.revenue.toLocaleString("id-ID")}</td>
                              <td className="py-3 md:py-4 text-right">
                                <div className="flex items-center justify-end space-x-2 md:space-x-3">
                                  <div className="w-12 md:w-16 h-1.5 md:h-2 bg-gray-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-[#8b5e34]" style={{ width: `${marginWidth}%` }}></div>
                                  </div>
                                  <span className="text-[10px] md:text-xs font-bold text-gray-500 w-6 md:w-8">{marginWidth}%</span>
                                </div>
                              </td>
                            </tr>
                          )
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 3: SETTINGS ================= */}
          {activeTab === "SETTINGS" && (
            <div className="animate-in fade-in duration-500">
              
              <div className="mb-6 md:mb-8">
                <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-2">Settings</h1>
                <p className="text-sm md:text-base text-gray-500 font-medium">Configure your store profile, system preferences, and payments.</p>
              </div>

              {/* Flex direction responsif: Di HP atas-bawah, Di Desktop kiri-kanan */}
              <div className="flex flex-col lg:flex-row gap-4 lg:gap-8 items-start">
                
                {/* MENU SETTINGS KIRI */}
                <div className="w-full lg:w-1/3 lg:max-w-[280px] bg-white rounded-3xl p-3 md:p-4 shadow-sm border border-gray-100 flex flex-row lg:flex-col overflow-x-auto custom-scrollbar shrink-0 gap-2 lg:gap-2">
                  {[
                    { name: "Store & Receipt", icon: <Store size={18} /> },
                    { name: "Tax & Fees", icon: <ReceiptText size={18} /> },
                    { name: "Payment (QRIS)", icon: <QrCode size={18} /> },
                  ].map((setting) => (
                    <button 
                      key={setting.name}
                      onClick={() => setActiveSetting(setting.name)}
                      className={`whitespace-nowrap lg:w-full flex items-center space-x-2 md:space-x-4 px-4 py-3 md:px-5 md:py-4 rounded-xl text-sm md:text-base font-bold transition ${activeSetting === setting.name ? "bg-[#38220f] text-white shadow-md" : "text-gray-600 hover:bg-gray-50"}`}
                    >
                      {setting.icon} <span>{setting.name}</span>
                    </button>
                  ))}
                </div>

                {/* AREA KONTEN SETTINGS KANAN */}
                <div className="flex-1 w-full bg-white rounded-3xl p-5 md:p-8 shadow-sm border border-gray-100">
                  
                  {/* STORE PROFILE SETTING */}
                  {activeSetting === "Store & Receipt" && (
                    <div className="animate-in fade-in duration-300">
                      <div className="flex items-center space-x-3 mb-4 md:mb-6 pb-4 md:pb-6 border-b border-gray-100">
                        <Store className="text-[#8b5e34] w-6 h-6 md:w-7 md:h-7" />
                        <h2 className="text-xl md:text-2xl font-bold text-gray-900">Store Profile</h2>
                      </div>
                      
                      <div className="space-y-6 md:space-y-8">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
                          <div className="w-20 h-20 md:w-24 md:h-24 bg-[#f5f3f0] rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-400 overflow-hidden shrink-0">
                            {settingsData.storeLogoUrl ? (
                              <img src={`/${settingsData.storeLogoUrl}`} alt="Store Logo" className="w-full h-full object-contain p-2" />
                            ) : (
                              <ImageIcon size={28} className="md:w-8 md:h-8" />
                            )}
                          </div>
                          <div className="flex-1">
                            <label className="block text-xs md:text-sm font-bold text-gray-900 mb-1 md:mb-2">Logo Filename / URL</label>
                            <input 
                              type="text" 
                              value={settingsData.storeLogoUrl || ""} 
                              onChange={(e) => setSettingsData({...settingsData, storeLogoUrl: e.target.value})} 
                              placeholder="e.g. logo-toko.png" 
                              className="w-full px-3 py-2.5 md:px-4 md:py-3 text-sm md:text-base bg-[#fcfbf9] border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#8b5e34] outline-none text-gray-800 font-medium transition" 
                            />
                            <p className="text-[10px] md:text-xs text-gray-400 mt-1 md:mt-2">Taruh file gambar di dalam folder /public/</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                          <div>
                            <label className="block text-xs md:text-sm font-bold text-gray-900 mb-1 md:mb-2">Store Name</label>
                            <input type="text" value={settingsData.storeName} onChange={(e) => setSettingsData({...settingsData, storeName: e.target.value})} className="w-full px-3 py-2.5 md:px-4 md:py-3.5 text-sm md:text-base bg-[#fcfbf9] border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#8b5e34] outline-none text-gray-800 font-medium transition" />
                          </div>
                          <div>
                            <label className="block text-xs md:text-sm font-bold text-gray-900 mb-1 md:mb-2">Phone Number</label>
                            <input type="text" value={settingsData.storePhone} onChange={(e) => setSettingsData({...settingsData, storePhone: e.target.value})} className="w-full px-3 py-2.5 md:px-4 md:py-3.5 text-sm md:text-base bg-[#fcfbf9] border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#8b5e34] outline-none text-gray-800 font-medium transition" />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs md:text-sm font-bold text-gray-900 mb-1 md:mb-2">Store Address</label>
                          <textarea rows={3} value={settingsData.storeAddress} onChange={(e) => setSettingsData({...settingsData, storeAddress: e.target.value})} className="w-full px-3 py-2.5 md:px-4 md:py-3.5 text-sm md:text-base bg-[#fcfbf9] border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#8b5e34] outline-none text-gray-800 font-medium transition resize-none"></textarea>
                        </div>
                        
                        <div>
                          <label className="block text-xs md:text-sm font-bold text-gray-900 mb-1 md:mb-2">Receipt Footer Message</label>
                          <input type="text" value={settingsData.receiptFooter} onChange={(e) => setSettingsData({...settingsData, receiptFooter: e.target.value})} placeholder="e.g. Terima kasih sudah mampir!" className="w-full px-3 py-2.5 md:px-4 md:py-3.5 text-sm md:text-base bg-[#fcfbf9] border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#8b5e34] outline-none text-gray-800 font-medium transition" />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAX & FEES SETTING */}
                  {activeSetting === "Tax & Fees" && (
                    <div className="animate-in fade-in duration-300">
                      <div className="flex items-center space-x-3 mb-4 md:mb-6 pb-4 md:pb-6 border-b border-gray-100">
                        <ReceiptText className="text-[#8b5e34] w-6 h-6 md:w-7 md:h-7" />
                        <h2 className="text-xl md:text-2xl font-bold text-gray-900">Tax & Service Charge</h2>
                      </div>
                      <div className="space-y-4 md:space-y-8">
                        
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 md:p-5 border border-gray-200 rounded-2xl bg-[#fcfbf9] gap-4">
                          <div>
                            <h3 className="font-bold text-gray-900 text-base md:text-lg">Enable Tax (PB1 / PPN)</h3>
                            <p className="text-xs md:text-sm text-gray-500 font-medium mt-1">Otomatis dan tambahkan pajak ke tagihan.</p>
                          </div>
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                               <input type="number" disabled={!settingsData.taxEnabled} value={settingsData.taxRate} onChange={(e) => setSettingsData({...settingsData, taxRate: Number(e.target.value)})} className="w-14 md:w-16 px-2 md:px-3 py-1.5 md:py-2 border border-gray-300 rounded-lg text-center font-bold text-sm md:text-base" />
                               <span className="font-bold text-gray-500">%</span>
                            </div>
                            <button onClick={() => setSettingsData({...settingsData, taxEnabled: !settingsData.taxEnabled})} className={`w-12 h-7 md:w-14 md:h-8 flex items-center rounded-full p-1 transition-colors duration-300 ${settingsData.taxEnabled ? 'bg-green-500' : 'bg-gray-300'}`}>
                              <div className={`bg-white w-5 h-5 md:w-6 md:h-6 rounded-full shadow-md transform transition-transform duration-300 ${settingsData.taxEnabled ? 'translate-x-5 md:translate-x-6' : ''}`}></div>
                            </button>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 md:p-5 border border-gray-200 rounded-2xl bg-[#fcfbf9] gap-4">
                          <div>
                            <h3 className="font-bold text-gray-900 text-base md:text-lg">Enable Service Charge</h3>
                            <p className="text-xs md:text-sm text-gray-500 font-medium mt-1">Biaya pelayanan tambahan pesanan Dine-in.</p>
                          </div>
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                               <input type="number" disabled={!settingsData.serviceChargeEnabled} value={settingsData.serviceChargeRate} onChange={(e) => setSettingsData({...settingsData, serviceChargeRate: Number(e.target.value)})} className="w-14 md:w-16 px-2 md:px-3 py-1.5 md:py-2 border border-gray-300 rounded-lg text-center font-bold text-sm md:text-base" />
                               <span className="font-bold text-gray-500">%</span>
                            </div>
                            <button onClick={() => setSettingsData({...settingsData, serviceChargeEnabled: !settingsData.serviceChargeEnabled})} className={`w-12 h-7 md:w-14 md:h-8 flex items-center rounded-full p-1 transition-colors duration-300 ${settingsData.serviceChargeEnabled ? 'bg-green-500' : 'bg-gray-300'}`}>
                              <div className={`bg-white w-5 h-5 md:w-6 md:h-6 rounded-full shadow-md transform transition-transform duration-300 ${settingsData.serviceChargeEnabled ? 'translate-x-5 md:translate-x-6' : ''}`}></div>
                            </button>
                          </div>
                        </div>

                      </div>
                    </div>
                  )}

                  {/* QRIS SETTING */}
                  {activeSetting === "Payment (QRIS)" && (
                    <div className="animate-in fade-in duration-300">
                      <div className="flex items-center space-x-3 mb-4 md:mb-6 pb-4 md:pb-6 border-b border-gray-100">
                        <QrCode className="text-[#8b5e34] w-6 h-6 md:w-7 md:h-7" />
                        <h2 className="text-xl md:text-2xl font-bold text-gray-900">QRIS Payment Settings</h2>
                      </div>
                      <div className="space-y-4 md:space-y-6">
                        <p className="text-xs md:text-sm font-medium text-gray-500">Masukkan nama file gambar QRIS toko Anda. Gambar ini akan muncul di pop-up layar POS saat metode pembayaran QRIS dipilih kasir.</p>
                        <div>
                          <label className="block text-xs md:text-sm font-bold text-gray-900 mb-1 md:mb-2">QRIS Filename / URL</label>
                          <input type="text" value={settingsData.qrisImageUrl || ""} onChange={(e) => setSettingsData({...settingsData, qrisImageUrl: e.target.value})} placeholder="e.g. qris-toko.png" className="w-full px-3 py-2.5 md:px-4 md:py-3.5 text-sm md:text-base bg-[#fcfbf9] border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#8b5e34] outline-none text-gray-800 font-medium transition" />
                          <p className="text-[10px] md:text-xs text-gray-400 mt-1 md:mt-2">Place image inside /public/ folder.</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end pt-6 md:pt-8 mt-4 border-t border-gray-100">
                    <button 
                      onClick={handleSaveSettings}
                      disabled={isSavingSettings}
                      className="w-full sm:w-auto px-6 md:px-8 py-3 md:py-3.5 text-sm md:text-base bg-[#38220f] hover:bg-black disabled:bg-gray-400 text-white font-bold rounded-xl shadow-md transition transform hover:-translate-y-0.5 flex items-center justify-center"
                    >
                      {isSavingSettings ? "Saving..." : "Save All Changes"}
                    </button>
                  </div>

                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* ================= MODAL CRUD ================= */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-white p-6 md:p-8 rounded-3xl w-full max-w-md shadow-2xl overflow-y-auto max-h-screen">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 md:mb-6">{isEditMode ? "Edit Product" : "Add New Product"}</h2>
            <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4">
              <div>
                <label className="block text-xs md:text-sm font-bold text-gray-700 mb-1">Product Name</label>
                <input 
                  type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3 py-2.5 md:px-4 md:py-3 text-sm md:text-base border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#38220f] outline-none text-gray-800 bg-gray-50" 
                  placeholder="e.g. Iced Latte"
                />
              </div>
              <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-3 sm:space-y-0">
                <div className="w-full sm:w-1/2">
                  <label className="block text-xs md:text-sm font-bold text-gray-700 mb-1">Price (Rp)</label>
                  <input 
                    type="number" required value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})}
                    className="w-full px-3 py-2.5 md:px-4 md:py-3 text-sm md:text-base border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#38220f] outline-none text-gray-800 bg-gray-50" 
                    placeholder="e.g. 35000"
                  />
                </div>
                <div className="w-full sm:w-1/2">
                  <label className="block text-xs md:text-sm font-bold text-gray-700 mb-1">Category</label>
                  <select 
                    value={formData.categoryId} onChange={(e) => setFormData({...formData, categoryId: e.target.value})}
                    className="w-full px-3 py-2.5 md:px-4 md:py-3 text-sm md:text-base border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#38220f] outline-none text-gray-800 bg-gray-50"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs md:text-sm font-bold text-gray-700 mb-1">Image Filename</label>
                <input 
                  type="text" value={formData.imageUrl || ""} onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                  className="w-full px-3 py-2.5 md:px-4 md:py-3 text-sm md:text-base border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#38220f] outline-none text-gray-800 bg-gray-50" 
                  placeholder="e.g. latte.jpg"
                />
                <p className="text-[10px] md:text-xs text-gray-400 mt-1 md:mt-2">Place image inside /public/products/ folder</p>
              </div>
              <div className="flex space-x-3 pt-4 md:pt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="w-1/2 py-3 md:py-3.5 bg-gray-100 text-gray-600 text-sm md:text-base font-bold rounded-xl hover:bg-gray-200 transition">Cancel</button>
                <button type="submit" className="w-1/2 py-3 md:py-3.5 bg-[#38220f] text-white text-sm md:text-base font-bold rounded-xl hover:bg-black transition shadow-md">
                  {isEditMode ? "Save" : "Add"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL ABOUT ================= */}
      {showAboutModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-white p-6 md:p-8 rounded-3xl w-full max-w-md shadow-2xl relative animate-in fade-in zoom-in duration-300">
            <button 
              onClick={() => setShowAboutModal(false)}
              className="absolute top-3 right-3 md:top-4 md:right-4 p-2 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200 transition"
            >
              <X size={18} className="md:w-5 md:h-5" />
            </button>

            <div className="text-center mb-4 md:mb-6 mt-2">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-[#38220f] text-white rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4 shadow-md">
                <Utensils size={24} className="md:w-8 md:h-8" />
              </div>
              <h2 className="text-xl md:text-2xl font-black text-gray-900">Kopi Saku POS</h2>
              <p className="text-xs md:text-sm font-bold text-amber-700 mt-1">Versi 1.0.0</p>
            </div>

            <div className="space-y-3 md:space-y-4 text-xs md:text-sm text-gray-600 font-medium text-center px-2 md:px-4">
              <p>Aplikasi Point of Sale (POS) modern berbasis web yang dirancang khusus untuk mempermudah operasional kedai kopi.</p>
              <p>Terintegrasi dengan manajemen produk, pelacakan laporan penjualan real-time, pengaturan pajak dinamis, integrasi QRIS, dan pencetakan struk kasir thermal.</p>
            </div>

            <div className="mt-6 md:mt-8 pt-4 md:pt-6 border-t border-gray-100 text-center">
              <p className="text-[10px] md:text-xs text-gray-400 font-bold mb-1">Built with Next.js, Tailwind CSS, Prisma & PostgreSQL</p>
              <p className="text-[10px] md:text-xs text-gray-400">© 2026 Kopi Saku. Developed by Yoga</p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}