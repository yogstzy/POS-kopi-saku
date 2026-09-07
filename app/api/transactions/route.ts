// app/api/transactions/route.ts
import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

// FUNGSI BARU: Mengambil riwayat transaksi untuk Laporan
export async function GET() {
  try {
    const transactions = await prisma.transaction.findMany({
      include: {
        items: {
          include: {
            product: { include: { category: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(transactions);
  } catch (error) {
    return NextResponse.json({ error: "Gagal mengambil transaksi" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    // 1. Menangkap data yang dikirim dari halaman kasir
    const body = await request.json();
    const { totalAmount, paymentMethod, items } = body;

    // 2. Menyimpan data ke Database (Tabel Transaction & TransactionItem)
    const newTransaction = await prisma.transaction.create({
      data: {
        totalAmount: totalAmount,
        paymentMethod: paymentMethod,
        // Fitur canggih Prisma: Nested Write (Menyimpan ke 2 tabel sekaligus)
        items: {
          create: items.map((item: any) => ({
            productId: item.id, // ID Kopi
            qty: item.qty,      // Jumlah beli
            subtotal: item.harga * item.qty,
          })),
        },
      },
    });

    // 3. Kembalikan respon sukses
    return NextResponse.json(newTransaction, { status: 201 });
  } catch (error) {
    console.error("Error simpan transaksi:", error);
    return NextResponse.json(
      { error: "Gagal menyimpan transaksi ke database" },
      { status: 500 }
    );
  }
}