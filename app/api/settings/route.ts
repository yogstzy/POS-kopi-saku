import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

export async function GET() {
  try {
    let setting = await prisma.setting.findFirst();
    if (!setting) {
      setting = await prisma.setting.create({ data: {} });
    }
    return NextResponse.json(setting);
  } catch (error) {
    return NextResponse.json({ error: "Gagal mengambil pengaturan" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    let setting = await prisma.setting.findFirst();
    
    const updated = await prisma.setting.update({
      where: { id: setting!.id },
      data: {
        storeName: body.storeName,
        storePhone: body.storePhone,
        storeAddress: body.storeAddress,
        receiptFooter: body.receiptFooter,
        taxEnabled: body.taxEnabled,
        taxRate: parseFloat(body.taxRate),
        serviceChargeEnabled: body.serviceChargeEnabled,
        serviceChargeRate: parseFloat(body.serviceChargeRate),
        qrisImageUrl: body.qrisImageUrl,
        storeLogoUrl: body.storeLogoUrl // <--- Logika simpan logo ditambahkan
      }
    });
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: "Gagal menyimpan pengaturan" }, { status: 500 });
  }
}