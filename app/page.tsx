"use client";
import { useState, useEffect } from "react";

export default function Home() {
  const [data, setData] = useState<string>("");

  useEffect(() => {
    setData("Hello, Next.js with CSR!");
  }, []);

  return <div className="text-xl font-bold text-blue-600">{data}</div>;
}
