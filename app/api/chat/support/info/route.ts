import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const adminClient = createAdminClient();

    // Query an admin user from users table
    const { data: adminUser } = await adminClient
      .from("users")
      .select("id, full_name, email")
      .eq("role", "admin")
      .limit(1)
      .maybeSingle();

    const adminId = adminUser?.id || "57b0c950-5397-42c9-b560-1459b21f8d8f";
    const adminName = adminUser?.full_name || "Soporte Agrilpa";
    const adminEmail = adminUser?.email || "agrilpasv@gmail.com";

    return NextResponse.json({
      adminId,
      adminName,
      adminEmail,
      isOnline: true
    });
  } catch (error) {
    console.error("[Support Info API] Error:", error);
    return NextResponse.json({
      adminId: "57b0c950-5397-42c9-b560-1459b21f8d8f",
      adminName: "Soporte Agrilpa",
      adminEmail: "agrilpasv@gmail.com",
      isOnline: true
    });
  }
}
