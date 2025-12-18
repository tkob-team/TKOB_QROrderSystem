"use client";

import React, { useState, useRef, useEffect } from "react";
import { Card } from "@/shared/components/ui/Card";
import { Badge } from "@/shared/components/ui/Badge";
import { Toast } from "@/shared/components/ui/Toast";
import {
  Bell,
  BellOff,
  RefreshCw,
  Clock,
  ChevronDown,
  LogOut,
  AlertCircle,
  Play,
  Check,
} from "lucide-react";
import { useAuth } from "@/shared/context/AuthContext";
import { useRouter } from "next/navigation";

interface OrderItem {
  name: string;
  quantity: number;
  modifiers?: string[];
  notes?: string;
}

type OrderStatus = "pending" | "preparing" | "ready" | "served";

interface Order {
  id: string;
  table: string;
  time: number;
  items: OrderItem[];
  isOverdue: boolean;
  status: OrderStatus;
  startedAt?: string;
  readyAt?: string;
  servedAt?: string;
  servedBy?: "KITCHEN" | "WAITER";
}

interface KdsBoardPageProps {
  showKdsProfile?: boolean;
  enableKitchenServe?: boolean;
}

export function KdsBoardPage({
  showKdsProfile = true,
  enableKitchenServe = false,
}: KdsBoardPageProps) {
  const router = useRouter();
  const { logout } = useAuth();
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [loadingOrderId, setLoadingOrderId] = useState<string | null>(null);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [showErrorToast, setShowErrorToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setIsUserMenuOpen(false);
      }
    };

    if (isUserMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isUserMenuOpen]);

  const handleLogout = () => {
    setIsUserMenuOpen(false);
    logout();
    router.push("/auth/login");
  };

  const columns = [
    {
      id: "new",
      title: "NEW",
      color: "blue",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-500",
      textColor: "text-blue-700",
      badgeBg: "bg-blue-500",
    },
    {
      id: "preparing",
      title: "PREPARING",
      color: "amber",
      bgColor: "bg-amber-50",
      borderColor: "border-amber-500",
      textColor: "text-amber-700",
      badgeBg: "bg-amber-500",
    },
    {
      id: "ready",
      title: "READY",
      color: "emerald",
      bgColor: "bg-emerald-50",
      borderColor: "border-emerald-500",
      textColor: "text-emerald-700",
      badgeBg: "bg-emerald-500",
    },
  ];

  // Stateful orders array
  const [orders, setOrders] = useState<Order[]>([
    // Pending orders
    {
      id: "#1247",
      table: "Table 7",
      time: 2,
      items: [
        {
          name: "Caesar Salad",
          quantity: 2,
          modifiers: ["No croutons", "Extra dressing"],
        },
        {
          name: "Margherita Pizza",
          quantity: 1,
          modifiers: ["Thin crust", "Extra basil"],
        },
        { name: "Coca Cola", quantity: 2 },
      ],
      isOverdue: false,
      status: "pending",
    },
    {
      id: "#1248",
      table: "Table 2",
      time: 1,
      items: [
        {
          name: "Grilled Salmon",
          quantity: 1,
          modifiers: ["Medium rare", "No butter"],
          notes: "Allergy: shellfish",
        },
        { name: "Mashed Potato", quantity: 1 },
      ],
      isOverdue: false,
      status: "pending",
    },
    {
      id: "#1249",
      table: "Table 12",
      time: 0,
      items: [
        {
          name: "Burger Deluxe",
          quantity: 1,
          modifiers: ["Medium well", "Extra cheese", "No onions"],
        },
        { name: "French Fries", quantity: 1, modifiers: ["Extra crispy"] },
        { name: "Milkshake", quantity: 1, modifiers: ["Vanilla"] },
      ],
      isOverdue: false,
      status: "pending",
    },
    // Preparing orders
    {
      id: "#1245",
      table: "Table 5",
      time: 8,
      items: [
        {
          name: "Ribeye Steak",
          quantity: 1,
          modifiers: ["Medium", "Peppercorn sauce"],
        },
        { name: "Grilled Vegetables", quantity: 1 },
        { name: "Red Wine", quantity: 1, modifiers: ["Chilled"] },
      ],
      isOverdue: false,
      status: "preparing",
    },
    {
      id: "#1244",
      table: "Table 3",
      time: 16,
      items: [
        {
          name: "Pasta Carbonara",
          quantity: 2,
          modifiers: ["Extra bacon", "Less cream"],
        },
        { name: "Garlic Bread", quantity: 1 },
        { name: "House Salad", quantity: 1, modifiers: ["Balsamic dressing"] },
      ],
      isOverdue: true,
      status: "preparing",
    },
    // Ready orders
    {
      id: "#1243",
      table: "Table 8",
      time: 2,
      items: [
        {
          name: "Fish & Chips",
          quantity: 1,
          modifiers: ["Extra tartar sauce"],
        },
        { name: "Coleslaw", quantity: 1 },
        { name: "Lemon Water", quantity: 1 },
      ],
      isOverdue: false,
      status: "ready",
    },
    {
      id: "#1242",
      table: "Table 1",
      time: 4,
      items: [
        {
          name: "Chicken Wings",
          quantity: 1,
          modifiers: ["Spicy", "Blue cheese dip"],
        },
        { name: "Onion Rings", quantity: 1 },
      ],
      isOverdue: false,
      status: "ready",
    },
  ]);

  const getButtonConfig = (columnId: string) => {
    switch (columnId) {
      case "new":
        return {
          text: "Start Prep",
          icon: Play,
          className: "bg-blue-500 hover:bg-blue-600 text-white",
        };
      case "preparing":
        return {
          text: "Mark Ready",
          icon: Check,
          className: "bg-amber-500 hover:bg-amber-600 text-white",
        };
      case "ready":
        return {
          text: "Served",
          icon: Check,
          className: "bg-emerald-500 hover:bg-emerald-600 text-white",
        };
      default:
        return {
          text: "Action",
          icon: Check,
          className: "bg-gray-500 hover:bg-gray-600 text-white",
        };
    }
  };

  // Sort orders by time DESC (higher time first - older orders first)
  // For PREPARING column: overdue orders first, then by time DESC
  const sortedNewOrders = [...orders]
    .filter((order) => order.status === "pending")
    .sort((a, b) => b.time - a.time);

  const sortedPreparingOrders = [...orders]
    .filter((order) => order.status === "preparing")
    .sort((a, b) => {
      // Overdue orders first
      if (a.isOverdue && !b.isOverdue) return -1;
      if (!a.isOverdue && b.isOverdue) return 1;
      // Then by time DESC
      return b.time - a.time;
    });

  const sortedReadyOrders = [...orders]
    .filter((order) => order.status === "ready")
    .sort((a, b) => b.time - a.time);

  // Calculate status summary
  const pendingCount = orders.filter(
    (order) => order.status === "pending"
  ).length;
  const cookingCount = orders.filter(
    (order) => order.status === "preparing"
  ).length;
  const readyCount = orders.filter((order) => order.status === "ready").length;
  const overdueCount = orders.filter((order) => order.isOverdue).length;

  // Format current time as HH:mm:ss
  const formatTime = (date: Date) => {
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const seconds = date.getSeconds().toString().padStart(2, "0");
    return `${hours}:${minutes}:${seconds}`;
  };

  const handleAction = (orderId: string, columnId: string) => {
    setLoadingOrderId(orderId);
    const order = orders.find((o) => o.id === orderId);
    if (!order) return;

    const newStatus: OrderStatus =
      columnId === "new"
        ? "preparing"
        : columnId === "preparing"
          ? "ready"
          : "served";
    const newOrder: Order = {
      ...order,
      status: newStatus,
      startedAt:
        newStatus === "preparing" ? new Date().toISOString() : order.startedAt,
      readyAt: newStatus === "ready" ? new Date().toISOString() : order.readyAt,
      servedAt:
        newStatus === "served" ? new Date().toISOString() : order.servedAt,
      servedBy: newStatus === "served" ? "KITCHEN" : order.servedBy,
    };

    // Simulate API call
    setTimeout(() => {
      setLoadingOrderId(null);
      if (Math.random() < 0.9) {
        // Update order status
        setOrders(orders.map((o) => (o.id === orderId ? newOrder : o)));
        setToastMessage(`Order ${orderId} marked as ${newStatus}`);
        setShowSuccessToast(true);
      } else {
        setToastMessage(`Failed to mark order ${orderId} as ${newStatus}`);
        setShowErrorToast(true);
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Bar - Two Row Header */}
      <div className="bg-white border-b border-gray-200">
        {/* Row 1 - Main Header */}
        <div className="h-16 flex items-center justify-between px-6">
          {/* Left - Brand */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                <span style={{ fontSize: "20px" }}>👨‍🍳</span>
              </div>
              <div>
                <h2
                  className="text-gray-900"
                  style={{ fontSize: "20px", fontWeight: 700 }}
                >
                  Kitchen Display
                </h2>
                <p className="text-gray-500" style={{ fontSize: "13px" }}>
                  Live order status
                </p>
              </div>
            </div>
            <Badge variant="success">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                Live
              </span>
            </Badge>
          </div>

          {/* Center - Live Clock (lg+ only) */}
          <div className="hidden lg:flex items-center justify-center">
            <div
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-gray-200"
              style={{ boxShadow: "0 2px 6px rgba(0,0,0,0.08)" }}
            >
              <Clock className="w-5 h-5 text-gray-600" />
              <span
                className="text-gray-900"
                style={{
                  fontSize: "18px",
                  fontWeight: 700,
                  fontFamily: "monospace",
                  letterSpacing: "0.02em",
                }}
              >
                {formatTime(currentTime)}
              </span>
            </div>
          </div>

          {/* Right - Controls */}
          <div className="flex items-center gap-3">
            {/* Sound Toggle */}
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                soundEnabled
                  ? "bg-emerald-50 text-emerald-600 border-2 border-emerald-200"
                  : "bg-gray-100 text-gray-600 border-2 border-gray-200"
              }`}
              style={{ fontSize: "14px", fontWeight: 600, height: "40px" }}
              title={soundEnabled ? "Sound enabled" : "Sound disabled"}
            >
              {soundEnabled ? (
                <Bell className="w-4 h-4" />
              ) : (
                <BellOff className="w-4 h-4" />
              )}
              <span className="hidden sm:inline">Sound</span>
            </button>

            {/* Auto Refresh Toggle */}
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                autoRefresh
                  ? "bg-emerald-50 text-emerald-600 border-2 border-emerald-200"
                  : "bg-gray-100 text-gray-600 border-2 border-gray-200"
              }`}
              style={{ fontSize: "14px", fontWeight: 600, height: "40px" }}
              title={autoRefresh ? "Auto-refresh enabled" : "Auto-refresh disabled"}
            >
              <RefreshCw
                className={`w-4 h-4 ${autoRefresh ? "animate-spin" : ""}`}
                style={{ animationDuration: "3s" }}
              />
              <span className="hidden sm:inline">Auto</span>
            </button>

            {/* User Menu - Only show when showKdsProfile is true */}
            {showKdsProfile && (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 pl-4 border-l-2 border-gray-200 hover:bg-gray-50 rounded-xl transition-colors py-2 pr-2"
                >
                  <div className="w-9 h-9 bg-amber-100 rounded-full flex items-center justify-center shrink-0">
                    <span
                      className="text-amber-600"
                      style={{ fontSize: "14px", fontWeight: 700 }}
                    >
                      KS
                    </span>
                  </div>
                  <div className="hidden md:flex flex-col items-start">
                    <span
                      className="text-gray-900"
                      style={{ fontSize: "14px", fontWeight: 600 }}
                    >
                      Kitchen Staff
                    </span>
                    <span
                      className="text-gray-500"
                      style={{ fontSize: "12px" }}
                    >
                      KDS View
                    </span>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-gray-400 transition-transform ${
                      isUserMenuOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {isUserMenuOpen && (
                  <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-xl border border-gray-200 shadow-lg py-2 z-50">
                    <button
                      onClick={handleLogout}
                      className="w-full px-4 py-2.5 text-left hover:bg-red-50 transition-colors flex items-center gap-3 group"
                    >
                      <LogOut className="w-4 h-4 text-red-600" />
                      <span
                        className="text-red-600 group-hover:text-red-700"
                        style={{ fontSize: "14px", fontWeight: 500 }}
                      >
                        Log out
                      </span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Row 2 - Status Summary Dashboard Bar (lg+ only) */}
        <div className="hidden lg:block border-t border-gray-100 bg-gray-50 px-6 py-4">
          <div className="max-w-[1600px] mx-auto">
            <div className="w-full flex items-center justify-between gap-4">
              {/* Pending Status Card */}
              <div
                className="flex-1 flex items-center justify-between px-5 py-3 bg-white rounded-xl border-2 border-blue-200"
                style={{
                  boxShadow: "0 2px 8px rgba(59, 130, 246, 0.1)",
                  minHeight: "48px",
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full" />
                  <span
                    className="text-blue-700"
                    style={{ fontSize: "15px", fontWeight: 600 }}
                  >
                    Pending
                  </span>
                </div>
                <span
                  className="text-blue-900"
                  style={{ fontSize: "22px", fontWeight: 800 }}
                >
                  {pendingCount}
                </span>
              </div>

              {/* Cooking Status Card */}
              <div
                className="flex-1 flex items-center justify-between px-5 py-3 bg-white rounded-xl border-2 border-amber-200"
                style={{
                  boxShadow: "0 2px 8px rgba(245, 158, 11, 0.1)",
                  minHeight: "48px",
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-amber-500 rounded-full" />
                  <span
                    className="text-amber-700"
                    style={{ fontSize: "15px", fontWeight: 600 }}
                  >
                    Cooking
                  </span>
                </div>
                <span
                  className="text-amber-900"
                  style={{ fontSize: "22px", fontWeight: 800 }}
                >
                  {cookingCount}
                </span>
              </div>

              {/* Ready Status Card */}
              <div
                className="flex-1 flex items-center justify-between px-5 py-3 bg-white rounded-xl border-2 border-emerald-200"
                style={{
                  boxShadow: "0 2px 8px rgba(16, 185, 129, 0.1)",
                  minHeight: "48px",
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full" />
                  <span
                    className="text-emerald-700"
                    style={{ fontSize: "15px", fontWeight: 600 }}
                  >
                    Ready
                  </span>
                </div>
                <span
                  className="text-emerald-900"
                  style={{ fontSize: "22px", fontWeight: 800 }}
                >
                  {readyCount}
                </span>
              </div>

              {/* Overdue Status Card - Only show if there are overdue orders */}
              {overdueCount > 0 && (
                <div
                  className="flex-1 flex items-center justify-between px-5 py-3 bg-red-50 rounded-xl border-2 border-red-400"
                  style={{
                    boxShadow:
                      "0 2px 12px rgba(239, 68, 68, 0.15), 0 0 0 3px rgba(239, 68, 68, 0.08)",
                    minHeight: "48px",
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse-slow" />
                    <span
                      className="text-red-700"
                      style={{ fontSize: "15px", fontWeight: 700 }}
                    >
                      Overdue
                    </span>
                  </div>
                  <span
                    className="text-red-900"
                    style={{ fontSize: "22px", fontWeight: 900 }}
                  >
                    {overdueCount}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Board */}
      <main className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-[1600px] mx-auto">
          {columns.map((column) => {
            const columnOrders =
              column.id === "new"
                ? sortedNewOrders
                : column.id === "preparing"
                  ? sortedPreparingOrders
                  : sortedReadyOrders;
            const buttonConfig = getButtonConfig(column.id);

            return (
              <div key={column.id} className="flex flex-col gap-4">
                {/* Column Header */}
                <div
                  className={`${column.bgColor} rounded-xl p-4 border-2 ${column.borderColor}`}
                >
                  <div className="flex items-center justify-between">
                    <h3
                      className={column.textColor}
                      style={{
                        fontSize: "16px",
                        fontWeight: 700,
                        letterSpacing: "0.05em",
                      }}
                    >
                      {column.title}
                    </h3>
                    <span
                      className={`${column.badgeBg} text-white px-3 py-1 rounded-full`}
                      style={{ fontSize: "14px", fontWeight: 700 }}
                    >
                      {columnOrders.length}
                    </span>
                  </div>
                </div>

                {/* Order Cards */}
                <div className="flex flex-col gap-4 min-h-[400px]">
                  {columnOrders.length === 0 ? (
                    <Card
                      className="p-8 text-center"
                      style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}
                    >
                      <div className="flex flex-col items-center justify-center text-gray-400">
                        <div
                          className={`w-16 h-16 ${column.bgColor} rounded-full flex items-center justify-center mb-3`}
                        >
                          <Check className={`w-8 h-8 ${column.textColor}`} />
                        </div>
                        <p style={{ fontSize: "14px", fontWeight: 500 }}>
                          No orders {column.title.toLowerCase()}
                        </p>
                      </div>
                    </Card>
                  ) : (
                    columnOrders.map((order) => {
                      const ButtonIcon = buttonConfig.icon;

                      return (
                        <Card
                          key={order.id}
                          className={`p-5 transition-all hover:shadow-lg ${
                            order.isOverdue
                              ? "border-2 border-red-500 bg-red-50/30"
                              : ""
                          }`}
                          style={{
                            boxShadow: order.isOverdue
                              ? "0 4px 12px rgba(239, 68, 68, 0.15)"
                              : "0 1px 3px rgba(0,0,0,0.1)",
                          }}
                        >
                          <div className="flex flex-col gap-4">
                            {/* Header */}
                            <div className="flex items-start justify-between">
                              <div className="flex flex-col gap-1">
                                <span
                                  className="text-gray-900"
                                  style={{ fontSize: "20px", fontWeight: 700 }}
                                >
                                  {order.id}
                                </span>
                                <span
                                  className="text-gray-600"
                                  style={{ fontSize: "15px", fontWeight: 500 }}
                                >
                                  {order.table}
                                </span>
                              </div>
                              <div
                                className={`flex items-center gap-2 px-3 py-2 rounded-xl ${
                                  order.isOverdue
                                    ? "bg-red-100 border border-red-300"
                                    : "bg-gray-100"
                                }`}
                              >
                                <Clock
                                  className={`w-4 h-4 ${
                                    order.isOverdue
                                      ? "text-red-600"
                                      : "text-gray-600"
                                  }`}
                                />
                                <span
                                  className={
                                    order.isOverdue
                                      ? "text-red-600"
                                      : "text-gray-900"
                                  }
                                  style={{ fontSize: "15px", fontWeight: 700 }}
                                >
                                  {order.time} min
                                </span>
                              </div>
                            </div>

                            {/* Overdue Alert */}
                            {order.isOverdue && (
                              <div className="flex items-center gap-2 p-3 bg-red-100 border border-red-300 rounded-xl">
                                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                                <span
                                  className="text-red-700"
                                  style={{ fontSize: "13px", fontWeight: 600 }}
                                >
                                  Exceeding standard preparation time
                                </span>
                              </div>
                            )}

                            {/* Items with Modifiers */}
                            <div className="flex flex-col gap-3 py-3 border-y-2 border-gray-200">
                              {order.items.map((item, index) => (
                                <div key={index} className="flex flex-col gap-1.5">
                                  <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 bg-gray-200 rounded-md flex items-center justify-center shrink-0">
                                      <span
                                        className="text-gray-700"
                                        style={{
                                          fontSize: "13px",
                                          fontWeight: 700,
                                        }}
                                      >
                                        {item.quantity}
                                      </span>
                                    </div>
                                    <span
                                      className="text-gray-900"
                                      style={{
                                        fontSize: "15px",
                                        fontWeight: 600,
                                      }}
                                    >
                                      {item.name}
                                    </span>
                                  </div>

                                  {/* Modifiers */}
                                  {item.modifiers && item.modifiers.length > 0 && (
                                    <div className="ml-8 flex flex-col gap-1">
                                      {item.modifiers.map((modifier, modIndex) => (
                                        <div
                                          key={modIndex}
                                          className="flex items-center gap-1.5"
                                        >
                                          <div className="w-1 h-1 bg-gray-400 rounded-full" />
                                          <span
                                            className="text-gray-600"
                                            style={{
                                              fontSize: "13px",
                                              fontStyle: "italic",
                                            }}
                                          >
                                            {modifier}
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  )}

                                  {/* Special Notes */}
                                  {item.notes && (
                                    <div className="ml-8 mt-1 p-2 bg-amber-50 border border-amber-200 rounded-lg">
                                      <div className="flex items-start gap-2">
                                        <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                                        <span
                                          className="text-amber-900"
                                          style={{
                                            fontSize: "12px",
                                            fontWeight: 600,
                                          }}
                                        >
                                          {item.notes}
                                        </span>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>

                            {/* Action Button */}
                            {column.id === "ready" && !enableKitchenServe ? (
                              // For READY column when kitchen serve is disabled, show secondary message
                              <div
                                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 border-2 border-gray-300 text-gray-600 rounded-xl"
                                style={{
                                  fontSize: "14px",
                                  fontWeight: 600,
                                  height: "48px",
                                }}
                              >
                                Waiting for waiter to serve
                              </div>
                            ) : (
                              <button
                                className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition-all ${
                                  column.id === "ready"
                                    ? "bg-white hover:bg-gray-50 border-2 border-gray-300 text-gray-700"
                                    : buttonConfig.className
                                }`}
                                style={{
                                  fontSize: "15px",
                                  fontWeight: column.id === "ready" ? 600 : 700,
                                  boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                                  height: "48px",
                                }}
                                onClick={() => handleAction(order.id, column.id)}
                                disabled={loadingOrderId === order.id}
                              >
                                {loadingOrderId === order.id ? (
                                  <>
                                    <div
                                      className={`w-5 h-5 border-2 rounded-full animate-spin ${
                                        column.id === "ready"
                                          ? "border-gray-400 border-t-gray-700"
                                          : "border-white"
                                      }`}
                                    />
                                    {column.id === "ready"
                                      ? "Marking served..."
                                      : buttonConfig.text}
                                  </>
                                ) : (
                                  <>
                                    <ButtonIcon className="w-5 h-5" />
                                    {column.id === "ready"
                                      ? "Served (Fallback)"
                                      : buttonConfig.text}
                                  </>
                                )}
                              </button>
                            )}
                          </div>
                        </Card>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .animate-pulse-slow {
          animation: pulse-slow 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>

      {/* Toasts */}
      {showSuccessToast && (
        <Toast
          type="success"
          message={toastMessage}
          onClose={() => setShowSuccessToast(false)}
        />
      )}
      {showErrorToast && (
        <Toast
          type="error"
          message={toastMessage}
          onClose={() => setShowErrorToast(false)}
        />
      )}
    </div>
  );
}
