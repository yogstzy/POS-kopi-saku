// app/api/products/route.ts
import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      include: { category: true },
      orderBy: { id: 'desc' } 
    });
    return NextResponse.json(products);
  } catch (error) {
    return NextResponse.json({ error: "Gagal mengambil data" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, price, categoryId, imageUrl } = body;

    const newProduct = await prisma.product.create({
      data: {
        name,
        price: parseInt(price), 
        categoryId: parseInt(categoryId), 
        imageUrl: imageUrl || null
      },
    });
    return NextResponse.json(newProduct, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Gagal menambah produk" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, name, price, categoryId, imageUrl } = body;

    const updatedProduct = await prisma.product.update({
      where: { id: parseInt(id) },
      data: {
        name,
        price: parseInt(price),
        categoryId: parseInt(categoryId), 
        imageUrl: imageUrl || null
      },
    });
    return NextResponse.json(updatedProduct);
  } catch (error) {
    return NextResponse.json({ error: "Gagal mengubah produk" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: "ID tidak ditemukan" }, { status: 400 });

    const productId = parseInt(id);

    // FIX ERROR 500: 
    // Hapus histori produk ini di dalam detail transaksi terlebih dahulu (jika ada).
    // Ini mencegah database menolak penghapusan akibat Foreign Key Constraint.
    try {
      await prisma.transactionItem.deleteMany({
        where: { productId: productId }
      });
    } catch (relationError) {
      console.log("Abaikan jika tidak ada relasi di transactionItem");
    }

    // Setelah histori transaksinya dibersihkan, produk bisa dihapus dengan aman!
    await prisma.product.delete({
      where: { id: productId },
    });

    return NextResponse.json({ message: "Produk berhasil dihapus" });
  } catch (error: any) {
    console.error("Gagal hapus produk:", error.message);
    return NextResponse.json({ error: "Gagal menghapus produk" }, { status: 500 });
  }
}