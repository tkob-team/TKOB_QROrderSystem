import React from 'react';
import { Card } from './Card';
import { LucideIcon, ArrowUp, ArrowDown } from 'lucide-react';

export interface KPICardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

export function KPICard({ title, value, icon: Icon, trend, className }: KPICardProps) {
  return (
    <Card className={`p-6 ${className || ''}`}>
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-2">
          <span className="text-gray-500" style={{ fontSize: '14px', fontWeight: 500 }}>{title}</span>
          <span className="text-gray-900" style={{ fontSize: '28px', fontWeight: 700, lineHeight: '1.2' }}>{value}</span>
          {trend && (
            <div className="flex items-center gap-1">
              {trend.isPositive ? (
                <ArrowUp className="w-4 h-4 text-emerald-600" />
              ) : (
                <ArrowDown className="w-4 h-4 text-red-500" />
              )}
              <span 
                className={trend.isPositive ? 'text-emerald-600' : 'text-red-500'}
                style={{ fontSize: '13px', fontWeight: 600 }}
              >
                {Math.abs(trend.value)}%
              </span>
              <span className="text-gray-500" style={{ fontSize: '13px' }}>
                vs last week
              </span>
            </div>
          )}
        </div>
        <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center">
          <Icon className="w-5 h-5 text-emerald-500" />
        </div>
      </div>
    </Card>
  );
}
