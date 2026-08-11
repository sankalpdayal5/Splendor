import { GemColor } from '../engine/types.js';

export interface GemMetaInfo {
  name: string;
  bg: string;
  text: string;
  border: string;
  icon: string;
  gradient: string;
}

export const GEM_META: Record<GemColor, GemMetaInfo> = {
  emerald: {
    name: 'Emerald',
    bg: '#047857',
    text: '#FFFFFF',
    border: '#10B981',
    icon: 'E',
    gradient: 'radial-gradient(circle at 35% 35%, #34D399 0%, #047857 60%, #064E3B 100%)'
  },
  diamond: {
    name: 'Diamond',
    bg: '#E2E8F0',
    text: '#0F172A',
    border: '#F8FAFC',
    icon: 'D',
    gradient: 'radial-gradient(circle at 35% 35%, #FFFFFF 0%, #CBD5E1 60%, #475569 100%)'
  },
  sapphire: {
    name: 'Sapphire',
    bg: '#1D4ED8',
    text: '#FFFFFF',
    border: '#3B82F6',
    icon: 'S',
    gradient: 'radial-gradient(circle at 35% 35%, #60A5FA 0%, #1D4ED8 60%, #1E3A8A 100%)'
  },
  ruby: {
    name: 'Ruby',
    bg: '#DC2626',
    text: '#FFFFFF',
    border: '#EF4444',
    icon: 'R',
    gradient: 'radial-gradient(circle at 35% 35%, #F87171 0%, #DC2626 60%, #7F1D1D 100%)'
  },
  onyx: {
    name: 'Onyx',
    bg: '#334155',
    text: '#FFFFFF',
    border: '#64748B',
    icon: 'O',
    gradient: 'radial-gradient(circle at 35% 35%, #94A3B8 0%, #334155 60%, #0F172A 100%)'
  }
};
