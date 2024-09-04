import Link from "next/link";
import React from "react";

export default function Protected() {
  return (
    <div>
      <p>jak masz login to możesz tu byc mewo</p>
      <Link href={"/"}>coffnijjj</Link>
    </div>
  );
}
