'use client';

import React from 'react';
import { Card, Button } from '@/shared/components';
import { Upload, Copy } from 'lucide-react';
import { toast } from 'sonner';

export interface TenantMediaSectionProps {
  slugPreview: string;
  coverUploaded: boolean;
}

export function TenantMediaSection(props: TenantMediaSectionProps) {
  return (
    <Card className="p-6">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
          <Upload className="w-6 h-6 text-purple-600" />
        </div>
        <div>
          <h3 className="text-text-primary font-semibold">Media</h3>
          <p className="text-text-secondary text-sm">Logo and cover images</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="w-20 h-20 bg-elevated rounded-lg flex items-center justify-center">
          <Upload className="w-10 h-10 text-text-secondary" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-text-primary mb-2">Logo</p>
          <p className="text-sm text-text-secondary mb-3">Logo upload is simulated in demo mode</p>
          <Button size="sm" variant="secondary">Choose File</Button>
        </div>
      </div>

      <div className="my-4 p-4 bg-elevated rounded-lg border border-default flex items-center gap-3">
        <p className="text-sm text-text-secondary">{props.slugPreview}</p>
        <button
          onClick={() => {
            navigator.clipboard.writeText(props.slugPreview);
            toast.success('Slug copied to clipboard');
          }}
          className="p-1 hover:bg-default rounded transition-colors"
        >
          <Copy className="w-4 h-4 text-text-secondary" />
        </button>
      </div>

      {props.coverUploaded && (
        <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg border border-green-200">
          <span className="text-sm font-semibold text-green-700">Cover image uploaded</span>
        </div>
      )}
    </Card>
  );
}
