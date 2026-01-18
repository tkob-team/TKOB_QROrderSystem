/**
 * KDS Header Section
 * Top bar with clock, toggles (sound/auto-refresh), and user menu
 */

'use client';

import React from 'react';
import { Badge } from '@/shared/components/Badge';
import { Bell, BellOff, RefreshCw, Clock, ChevronDown, LogOut, Wifi, WifiOff } from 'lucide-react';
import { formatKdsTime } from '../../../utils/formatKdsTime';

export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

export interface KdsHeaderSectionProps {
  currentTime: Date | null;
  soundEnabled: boolean;
  autoRefresh: boolean;
  showKdsProfile: boolean;
  isUserMenuOpen: boolean;
  userMenuRef: React.RefObject<HTMLDivElement>;
  connectionStatus?: ConnectionStatus;
  onToggleSound: () => void;
  onToggleAutoRefresh: () => void;
  onToggleUserMenu: () => void;
  onLogout: () => void;
}

export function KdsHeaderSection({
  currentTime,
  soundEnabled,
  autoRefresh,
  showKdsProfile,
  isUserMenuOpen,
  userMenuRef,
  connectionStatus = 'connected',
  onToggleSound,
  onToggleAutoRefresh,
  onToggleUserMenu,
  onLogout,
}: KdsHeaderSectionProps) {
  // Connection status config
  const connectionConfig = {
    connecting: {
      icon: Wifi,
      label: 'Connecting...',
      color: 'text-yellow-500',
      bg: 'bg-yellow-500/10',
      border: 'border-yellow-500/20',
      dot: 'bg-yellow-500',
    },
    connected: {
      icon: Wifi,
      label: 'Connected',
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20',
      dot: 'bg-emerald-500',
    },
    disconnected: {
      icon: WifiOff,
      label: 'Disconnected',
      color: 'text-red-500',
      bg: 'bg-red-500/10',
      border: 'border-red-500/20',
      dot: 'bg-red-500',
    },
    error: {
      icon: WifiOff,
      label: 'Connection Error',
      color: 'text-orange-500',
      bg: 'bg-orange-500/10',
      border: 'border-orange-500/20',
      dot: 'bg-orange-500',
    },
  };

  const config = connectionConfig[connectionStatus];
  const ConnectionIcon = config.icon;

  return (
    <div className="bg-secondary border-b border-default">
      {/* Main Header */}
      <div className="h-16 flex items-center justify-between px-6">
        {/* Left - Brand */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-accent-500/10 rounded-lg flex items-center justify-center">
              <span style={{ fontSize: '20px' }}>👨‍🍳</span>
            </div>
            <div>
              <h2 className="text-text-primary" style={{ fontSize: '20px', fontWeight: 700 }}>
                Kitchen Display
              </h2>
              <p className="text-text-tertiary" style={{ fontSize: '13px' }}>
                Live order status
              </p>
            </div>
          </div>
          
          {/* WebSocket Connection Status */}
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border-2 ${config.bg} ${config.border}`}>
            <ConnectionIcon className={`w-4 h-4 ${config.color}`} />
            <span className={`text-xs font-medium ${config.color}`}>
              {config.label}
            </span>
            {connectionStatus === 'connected' && (
              <span className={`w-2 h-2 rounded-full ${config.dot} animate-pulse`}></span>
            )}
          </div>
        </div>

        {/* Center - Live Clock (lg+ only) */}
        <div className="hidden lg:flex items-center justify-center">
          <div className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-br from-elevated to-secondary rounded-lg border-2 border-default">
            <Clock className="w-5 h-5 text-text-tertiary" />
            <span
              className="text-text-primary"
              suppressHydrationWarning
              style={{
                fontSize: '18px',
                fontWeight: 700,
                fontFamily: 'monospace',
                letterSpacing: '0.02em',
              }}
            >
              {currentTime ? formatKdsTime(currentTime) : '--:--:--'}
            </span>
          </div>
        </div>

        {/* Right - Controls */}
        <div className="flex items-center gap-3">
          {/* Sound Toggle */}
          <button
            onClick={onToggleSound}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
              soundEnabled
                ? 'bg-green-500/10 text-green-500 border-2 border-green-500/20'
                : 'bg-elevated text-text-tertiary border-2 border-default'
            }`}
            style={{ fontSize: '14px', fontWeight: 600, height: '40px' }}
            title={soundEnabled ? 'Sound enabled' : 'Sound disabled'}
          >
            {soundEnabled ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
            <span className="hidden sm:inline">{soundEnabled ? 'Sound On' : 'Sound Off'}</span>
          </button>

          {/* Auto Refresh Toggle */}
          <button
            onClick={onToggleAutoRefresh}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
              autoRefresh
                ? 'bg-green-500/10 text-green-500 border-2 border-green-500/20'
                : 'bg-elevated text-text-tertiary border-2 border-default'
            }`}
            style={{ fontSize: '14px', fontWeight: 600, height: '40px' }}
            title={autoRefresh ? 'Auto-refresh enabled' : 'Auto-refresh disabled'}
          >
            <RefreshCw
              className={`w-4 h-4 ${autoRefresh ? 'animate-spin' : ''}`}
              style={{ animationDuration: '3s' }}
            />
            <span className="hidden sm:inline">Auto</span>
          </button>

          {/* User Menu */}
          {showKdsProfile && (
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={onToggleUserMenu}
                className="flex items-center gap-2 pl-4 border-l-2 border-default hover:bg-elevated rounded-lg transition-colors py-2 pr-2"
              >
                <div className="w-9 h-9 bg-amber-500/10 rounded-full flex items-center justify-center shrink-0">
                  <span className="text-amber-500" style={{ fontSize: '14px', fontWeight: 700 }}>
                    KS
                  </span>
                </div>
                <div className="hidden md:flex flex-col items-start">
                  <span className="text-text-primary" style={{ fontSize: '14px', fontWeight: 600 }}>
                    Kitchen Staff
                  </span>
                  <span className="text-text-tertiary" style={{ fontSize: '12px' }}>
                    KDS View
                  </span>
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-text-tertiary transition-transform ${
                    isUserMenuOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {isUserMenuOpen && (
                <div className="absolute top-full right-0 mt-2 w-56 bg-secondary rounded-lg border border-default shadow-lg py-2 z-50">
                  <button
                    onClick={onLogout}
                    className="w-full px-4 py-2.5 text-left hover:bg-red-500/10 transition-colors flex items-center gap-3 group"
                  >
                    <LogOut className="w-4 h-4 text-red-500" />
                    <span
                      className="text-red-500 group-hover:text-red-600"
                      style={{ fontSize: '14px', fontWeight: 500 }}
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
    </div>
  );
}
