// app/reports/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "../../store/useCartStore";
import { 
  LayoutDashboard, Settings, BarChart2, HelpCircle, LogOut, Plus, 
  ReceiptText, Download, TrendingUp, TrendingDown, DollarSign, 
  ShoppingBag, Calendar, Utensils
} from "lucide-react";

export default function ReportsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
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
      fetchTransactions();
    }
  }, [router]);

  const fetchTransactions = async () => {
    try {
      const res = await fetch("/api/transactions");
      const data = await res.json();
      setTransactions(data);
    } catch (error) {
      console.error("Gagal load data transaksi", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewOrder = () => {
    bersihkanKeranjang();
    router.push("/pos");
  };

  const handleLogout = () => {
    localStorage.removeItem("userSession");
    router.push("/login");
  };

  // --- LOGIKA KALKULASI DATA RIIL DARI DATABASE ---
  const totalRevenue = transactions.reduce((sum, t) => sum + t.totalAmount, 0);
  const totalOrders = transactions.length;
  const avgTransaction = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

  // Mencari Produk Terlaris (Top Products)
  const productStats: Record<number, any> = {};
  transactions.forEach(t => {
    t.items.forEach((item: any) => {
      const pid = item.productId;
      if (!productStats[pid]) {
        productStats[pid] = {
          name: item.product?.name || "Unknown",
          category: item.product?.category?.name || "Uncategorized",
          units: 0,
          revenue: 0
        };
      }
      productStats[pid].units += item.qty;
      productStats[pid].revenue += item.subtotal;
    });
  });

  // Urutkan berdasarkan pendapatan terbanyak, ambil 3 teratas
  const topProducts = Object.values(productStats)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 3);

  if (isLoading) return <div className="h-screen bg-[#f8f7f5] flex items-center justify-center">Memuat Laporan...</div>;

  return (
    <div className="flex h-screen bg-[#f8f7f5] font-sans text-gray-800 overflow-hidden">
      
      {/* ================= 1. SIDEBAR ================= */}
      <div className="w-64 bg-[#f8f7f5] border-r border-gray-200 flex flex-col pt-8 pb-6 px-4">
        <div className="mb-8 px-4">
          <h1 className="text-2xl font-black text-gray-900">Kopi Saku</h1>
          <p className="text-xs text-gray-500 font-medium tracking-wide mt-1">Modern Barista POS</p>
        </div>

        <button onClick={handleNewOrder} className="w-full bg-[#38220f] hover:bg-black text-white py-3.5 rounded-xl font-bold flex items-center justify-center space-x-2 shadow-lg mb-8 transition-transform active:scale-95">
          <Plus size={20} /><span>New Order/POS</span>
        </button>

        <div className="flex-1 space-y-2">
          <button onClick={() => router.push("/admin")} className="w-full flex items-center space-x-3 px-4 py-3 text-gray-600 font-semibold hover:bg-gray-100 rounded-xl transition">
            <LayoutDashboard size={20} /><span>Menu Management</span>
          </button>
          {/* Tombol Sales Reports Aktif */}
          <button className="w-full flex items-center space-x-3 px-4 py-3 bg-[#fcd3a8] text-[#935a24] rounded-xl font-bold transition shadow-sm">
            <BarChart2 size={20} /><span>Sales Reports</span>
          </button>
          <button className="w-full flex items-center space-x-3 px-4 py-3 text-gray-600 font-semibold hover:bg-gray-100 rounded-xl transition">
            <Settings size={20} /><span>Settings</span>
          </button>
        </div>

        <div className="border-t border-gray-200 pt-4 space-y-2">
          <button className="w-full flex items-center space-x-3 px-4 py-3 text-gray-500 font-semibold hover:bg-gray-100 rounded-xl transition">
            <HelpCircle size={20} /><span>About</span>
          </button>
          <button onClick={handleLogout} className="w-full flex items-center space-x-3 px-4 py-3 text-gray-500 font-semibold hover:bg-red-50 hover:text-red-600 rounded-xl transition">
            <LogOut size={20} /><span>Logout</span>
          </button>
        </div>
      </div>

      {/* ================= 2. MAIN CONTENT ================= */}
      <div className="flex-1 flex flex-col h-full overflow-y-auto custom-scrollbar p-10">
        
        {/* Header Dashboard */}
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-4xl font-black text-gray-900 mb-2">Sales Reports</h2>
            <p className="text-gray-500 font-medium">Analytics and performance tracking.</p>
          </div>
          <div className="flex space-x-4">
            <div className="flex bg-white rounded-xl shadow-sm border border-gray-200 p-1">
              <button className="px-5 py-2 bg-[#fcd3a8] text-[#935a24] rounded-lg text-sm font-bold shadow-sm">Daily</button>
              <button className="px-5 py-2 text-gray-500 hover:text-gray-800 rounded-lg text-sm font-bold transition">Weekly</button>
              <button className="px-5 py-2 text-gray-500 hover:text-gray-800 rounded-lg text-sm font-bold transition">Monthly</button>
            </div>
            <button className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-xl font-bold flex items-center shadow-sm transition">
              <Utensils size={16} className="mr-2" /> Category
            </button>
            <button className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-xl font-bold flex items-center shadow-sm transition">
              <Download size={16} className="mr-2" /> Export
            </button>
          </div>
        </div>

        {/* KPI Cards (Nilai Asli dari Database) */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          {/* Total Revenue */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col">
            <div className="flex items-center space-x-2 text-gray-500 font-bold mb-4">
              <DollarSign size={18} /><span>Total Revenue</span>
            </div>
            <div className="flex items-end space-x-4">
              <h3 className="text-4xl font-black text-gray-900">Rp {totalRevenue.toLocaleString("id-ID")}</h3>
              <span className="flex items-center bg-green-100 text-green-700 px-2 py-1 rounded-md text-sm font-bold mb-1">
                <TrendingUp size={14} className="mr-1" /> 8.2%
              </span>
            </div>
          </div>
          
          {/* Avg Transaction */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col">
            <div className="flex items-center space-x-2 text-gray-500 font-bold mb-4">
              <ReceiptText size={18} /><span>Avg. Transaction</span>
            </div>
            <div className="flex items-end space-x-4">
              <h3 className="text-4xl font-black text-gray-900">Rp {avgTransaction.toLocaleString("id-ID")}</h3>
              <span className="flex items-center bg-green-100 text-green-700 px-2 py-1 rounded-md text-sm font-bold mb-1">
                <TrendingUp size={14} className="mr-1" /> 2.1%
              </span>
            </div>
          </div>

          {/* Total Orders */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col">
            <div className="flex items-center space-x-2 text-gray-500 font-bold mb-4">
              <ShoppingBag size={18} /><span>Total Orders</span>
            </div>
            <div className="flex items-end space-x-4">
              <h3 className="text-4xl font-black text-gray-900">{totalOrders}</h3>
              <span className="flex items-center bg-red-100 text-red-700 px-2 py-1 rounded-md text-sm font-bold mb-1">
                <TrendingDown size={14} className="mr-1" /> 1.4%
              </span>
            </div>
          </div>
        </div>

        {/* Charts Section (Visual Dummy sesuai Desain) */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          {/* Bar Chart Overview */}
          <div className="col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-bold text-gray-900">Revenue Overview</h3>
              <div className="flex items-center text-sm font-bold text-gray-500"><span className="w-3 h-3 bg-[#8b5e34] rounded-full mr-2"></span>Current Week</div>
            </div>
            {/* Visualisasi Bar Statis */}
            <div className="h-64 flex items-end justify-between space-x-2 bg-gray-50 rounded-xl p-4">
              <div className="w-full bg-[#fcdab7] rounded-t-md h-[30%]"></div>
              <div className="w-full bg-[#fcdab7] rounded-t-md h-[45%]"></div>
              <div className="w-full bg-[#fcdab7] rounded-t-md h-[35%]"></div>
              <div className="w-full bg-[#fcdab7] rounded-t-md h-[60%]"></div>
              <div className="w-full bg-[#fcdab7] rounded-t-md h-[75%]"></div>
              <div className="w-full bg-[#8b5e34] rounded-t-md h-[95%] relative"><span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold text-gray-500">Peak</span></div>
              <div className="w-full bg-[#fcdab7] rounded-t-md h-[65%]"></div>
            </div>
            <div className="flex justify-between text-sm font-bold text-gray-400 mt-4 px-2">
              <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
            </div>
          </div>

          {/* Peak Hours Horizontal Bar */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-8">Peak Hours</h3>
            <div className="space-y-4">
              {[
                { time: "08:00", width: "w-3/4", color: "bg-[#fcdab7]" },
                { time: "10:00", width: "w-4/5", color: "bg-[#fcdab7]" },
                { time: "12:00", width: "w-full", color: "bg-[#8b5e34]", label: "Peak" },
                { time: "14:00", width: "w-3/4", color: "bg-[#fcdab7]" },
                { time: "16:00", width: "w-4/5", color: "bg-[#fcdab7]" },
                { time: "18:00", width: "w-2/3", color: "bg-[#fcdab7]" },
                { time: "20:00", width: "w-1/2", color: "bg-[#fcdab7]" },
              ].map((bar, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <span className="text-sm font-bold text-gray-400 w-10">{bar.time}</span>
                  <div className="flex-1 bg-gray-100 rounded-md h-6 flex items-center">
                    <div className={`${bar.width} ${bar.color} h-full rounded-md flex items-center justify-center`}>
                       {bar.label && <span className="text-[10px] text-white font-bold">{bar.label}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Products Table (Data Riil dari Database) */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-gray-900">Top Products</h3>
            <button className="text-sm font-bold text-[#8b5e34] hover:underline">View All</button>
          </div>
          
          <table className="w-full text-left">
            <thead>
              <tr className="text-xs font-bold text-gray-400 border-b border-gray-100">
                <th className="pb-4 w-10">#</th>
                <th className="pb-4">PRODUCT NAME</th>
                <th className="pb-4 text-right">UNITS SOLD</th>
                <th className="pb-4 text-right">REVENUE</th>
                <th className="pb-4 text-right pr-4">PROFIT MARGIN</th>
              </tr>
            </thead>
            <tbody>
              {topProducts.length === 0 ? (
                <tr><td colSpan={5} className="py-8 text-center text-gray-400">Belum ada data penjualan</td></tr>
              ) : (
                topProducts.map((product, index) => (
                  <tr key={index} className="border-b border-gray-50 hover:bg-gray-50 transition">
                    <td className="py-4 font-bold text-gray-500">{index + 1}</td>
                    <td className="py-4 flex items-center space-x-4">
                      <div className="w-12 h-12 bg-[#f5f0eb] rounded-xl flex items-center justify-center text-[#8b5e34]">
                         <Utensils size={20} />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{product.name}</p>
                        <p className="text-xs font-medium text-gray-500">{product.category}</p>
                      </div>
                    </td>
                    <td className="py-4 text-right font-bold text-gray-700">{product.units}</td>
                    <td className="py-4 text-right font-bold text-gray-900">Rp {product.revenue.toLocaleString("id-ID")}</td>
                    <td className="py-4 text-right">
                      {/* Profit Margin Visual Dummy */}
                      <div className="flex items-center justify-end space-x-2">
                        <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full bg-[#8b5e34]" style={{ width: `${65 - index * 5}%` }}></div>
                        </div>
                        <span className="text-xs font-bold text-gray-500 w-8">{65 - index * 5}%</span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}