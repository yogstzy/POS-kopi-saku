// app/pos/StrukPrinter.tsx
"use client";

import React, { forwardRef } from "react";

interface StrukProps {
  storeLogoUrl?: string; // <--- Property baru
  storeName: string;
  storeAddress: string;
  receiptFooter: string;
  kasirName: string;
  customerName: string; 
  items: any[];
  subtotal: number;
  taxRate: number;
  pajak: number;
  serviceRate: number;
  serviceCharge: number;
  total: number;
  paymentMethod: string;
}

const StrukPrinter = forwardRef<HTMLDivElement, StrukProps>(
  ({ storeLogoUrl, storeName, storeAddress, receiptFooter, kasirName, customerName, items, subtotal, taxRate, pajak, serviceRate, serviceCharge, total, paymentMethod }, ref) => {
    const date = new Date();
    const formattedDate = date.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
    const formattedTime = date.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });

    return (
      <div className="hidden print:block font-mono text-black w-[58mm] text-xs p-4" ref={ref}>
        
        {/* LOGO TOKO (JIKA ADA) */}
        {storeLogoUrl && (
          <div className="flex justify-center mb-2">
            <img 
              src={`/${storeLogoUrl}`} 
              alt="Logo" 
              className="w-16 h-16 object-contain grayscale" 
            />
          </div>
        )}

        {/* Header Toko */}
        <div className="text-center mb-4">
          <h1 className="text-xl font-bold font-sans uppercase">{storeName || "KOPI SAKU"}</h1>
          <p className="whitespace-pre-line">{storeAddress || "Jl. Sudirman, Jakarta"}</p>
          <p className="mt-2 border-b border-dashed border-black pb-2">------------------------</p>
        </div>

        {/* Info Transaksi */}
        <div className="mb-4">
          <p>Tgl   : {formattedDate} {formattedTime}</p>
          <p>Kasir : {kasirName}</p>
          <p>Pelanggan: {customerName || "Walk-in"}</p>
          <p>Metode: {paymentMethod}</p>
          <p className="mt-2 border-b border-dashed border-black pb-2">------------------------</p>
        </div>

        {/* List Produk */}
        <div className="mb-4">
          {items.map((item, index) => (
            <div key={index} className="mb-2">
              <p className="font-bold">{item.nama}</p>
              <div className="flex justify-between">
                <span>{item.qty} x Rp {item.harga.toLocaleString("id-ID")}</span>
                <span>Rp {(item.qty * item.harga).toLocaleString("id-ID")}</span>
              </div>
            </div>
          ))}
          <p className="mt-2 border-b border-dashed border-black pb-2">------------------------</p>
        </div>

        {/* Ringkasan Harga */}
        <div className="mb-6 space-y-1">
          <div className="flex justify-between"><span>Subtotal:</span><span>Rp {subtotal.toLocaleString("id-ID")}</span></div>
          
          {pajak > 0 && (
            <div className="flex justify-between"><span>PB1/PPN ({taxRate}%):</span><span>Rp {pajak.toLocaleString("id-ID")}</span></div>
          )}
          
          {serviceCharge > 0 && (
            <div className="flex justify-between"><span>Service ({serviceRate}%):</span><span>Rp {serviceCharge.toLocaleString("id-ID")}</span></div>
          )}
          
          <div className="flex justify-between mt-2 pt-2 font-bold text-sm border-t border-dashed border-black">
            <span>TOTAL:</span><span>Rp {total.toLocaleString("id-ID")}</span>
          </div>
        </div>

        {/* Footer (Pesan Terima Kasih) */}
        <div className="text-center mt-8">
          <p>{receiptFooter || "Terima Kasih!"}</p>
          <p className="mt-8">.</p>
        </div>
      </div>
    );
  }
);

StrukPrinter.displayName = "StrukPrinter";
export default StrukPrinter;