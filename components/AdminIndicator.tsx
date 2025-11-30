"use client";

import { useState, useEffect } from "react";
import { Settings, LogOut } from "lucide-react";
import { Button } from "./ui/button";
import { checkAdmin, logout } from "@/lib/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminIndicator() {
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsAdmin(checkAdmin());
  }, []);

  const handleLogout = () => {
    logout();
    setIsAdmin(false);
    router.refresh();
  };

  if (!isAdmin) {
    return (
      <Link href="/login">
        <Button variant="ghost" size="sm" className="gap-2 text-xs admin-button">
          <Settings className="h-3 w-3" />
          ADMIN
        </Button>
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-2 admin-button">
      <span className="text-xs uppercase">ADMIN MODE</span>
      <Link href="/admin">
        <Button variant="ghost" size="sm" className="gap-2 text-xs admin-button">
          <Settings className="h-3 w-3" />
          MANAGE
        </Button>
      </Link>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleLogout}
        className="gap-2 text-xs admin-button"
      >
        <LogOut className="h-3 w-3" />
        LOGOUT
      </Button>
    </div>
  );
}


