// app/page.tsx
import { redirect } from "next/navigation";

export default function Home() {
  // Ini akan langsung melempar user ke halaman login tanpa ba-bi-bu
  redirect("/login");
}