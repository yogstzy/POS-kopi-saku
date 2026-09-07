// app/api/auth/login/route.ts
import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password } = body;

    // Cari user di database berdasarkan username
    const user = await prisma.user.findUnique({
      where: { username: username },
    });

    // Jika user tidak ditemukan atau password salah
    if (!user || user.password !== password) {
      return NextResponse.json(
        { error: "Username atau password salah!" },
        { status: 401 }
      );
    }

    // Jika sukses, kembalikan data user (tanpa mengirim password-nya)
    return NextResponse.json(
      { 
        message: "Login sukses", 
        user: { id: user.id, username: user.username, name: user.name, role: user.role } 
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}