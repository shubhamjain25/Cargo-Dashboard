import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

export async function POST(request: Request) {
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

    // Only Admin can add cargo
    if (payload.role !== "Admin") {
      return NextResponse.json(
        { error: "Forbidden: Admin access required" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { id, weight, destination, createdAt } = body;

    if (!id || !weight || !destination || !createdAt) {
      return NextResponse.json(
        { error: "ID, weight, destination, and createdAt are required" },
        { status: 400 }
      );
    }

    // Forward to backend Express server
    const backendResponse = await fetch(`${BACKEND_URL}/api/add-cargo`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ id, weight, destination, createdAt }),
    });

    const data = await backendResponse.json();

    if (!backendResponse.ok) {
      return NextResponse.json(
        { error: data.message || "Failed to add cargo" },
        { status: backendResponse.status }
      );
    }

    return NextResponse.json(
      {
        message: data.message || "Cargo added successfully",
        data: data.data,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Add cargo error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
