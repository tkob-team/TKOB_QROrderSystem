/**
 * KDS Button Configuration
 * UI-facing button configs per column (may contain lucide-react icons and Tailwind classes)
 */

import { Play, Check } from 'lucide-react';
import type { KdsButtonConfig } from '../model/types';

/**
 * Button configuration by column
 */
export const KDS_BUTTON_CONFIG: Record<'new' | 'preparing' | 'ready', KdsButtonConfig> = {
  new: {
    text: 'Start Prep',
    icon: Play,
    className: 'bg-blue-500 hover:bg-blue-600 text-white',
  },
  preparing: {
    text: 'Mark Ready',
    icon: Check,
    className: 'bg-amber-500 hover:bg-amber-600 text-white',
  },
  ready: {
    text: 'Served',
    icon: Check,
    className: 'bg-emerald-500 hover:bg-emerald-600 text-white',
  },
};
