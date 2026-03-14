"use client";

interface Scene3DProps {
  variant?: "full" | "subtle";
}

export default function Scene3D({ variant = "full" }: Scene3DProps) {
  // 3D parallax disabled to improve performance and stop UI lag
  return null;
}
