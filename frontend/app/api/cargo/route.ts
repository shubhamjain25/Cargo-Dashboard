import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3000";

export async function GET(request: Request) {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const payload = await verifyToken(token);

    if (!payload) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
    }

    // Fetch cargo data from backend Express server
    const backendResponse = await fetch(`${BACKEND_URL}/api/cargo`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!backendResponse.ok) {
      return NextResponse.json(
        { error: "Failed to fetch cargo data from backend" },
        { status: backendResponse.status }
      );
    }

    const cargoData = await backendResponse.json();

    return NextResponse.json({
      data: cargoData,
      meta: {
        total: cargoData.length,
        userRole: payload.role,
      },
    });
  } catch (error) {
    console.error("Cargo fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
