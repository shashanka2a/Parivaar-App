'use client';

import { motion } from 'framer-motion';
import { UserCircle2, Edit2 } from 'lucide-react';
import { Person } from '@/lib/state-context';
import { Button } from './ui/button';

interface Props {
  person: Person;
  theme: 'classic' | 'modern' | 'colorful';
  onClick: () => void;
  onEdit: () => void;
}

export default function TreeNodeCard({ person, theme, onClick, onEdit }: Props) {
  const getThemeColors = () => {
    switch (theme) {
      case 'classic':
        return {
          bg: 'bg-white',
          border: 'border-[#D9D5CE]',
          accent: 'bg-[#F5F3EF]',
        };
      case 'colorful':
        return person.gender === 'male'
          ? { bg: 'bg-blue-50', border: 'border-blue-200', accent: 'bg-blue-100' }
          : person.gender === 'female'
          ? { bg: 'bg-pink-50', border: 'border-pink-200', accent: 'bg-pink-100' }
          : { bg: 'bg-purple-50', border: 'border-purple-200', accent: 'bg-purple-100' };
      default:
        return {
          bg: 'bg-white',
          border: 'border-[#D9D5CE]',
          accent: 'bg-[#F5F3EF]',
        };
    }
  };

  const colors = getThemeColors();

  return (
    <motion.div
      whileHover={{ scale: 1.03, y: -2 }}
      whileTap={{ scale: 0.98 }}
      className={`rounded-2xl border-2 ${colors.border} ${colors.bg} p-5 shadow-md hover:shadow-lg transition-all cursor-pointer w-[192px] group relative`}
      onClick={onClick}
    >
      {/* Edit Button */}
      <Button
        onClick={(e) => {
          e.stopPropagation();
          onEdit();
        }}
        size="sm"
        variant="ghost"
        className="absolute top-2 right-2 size-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 backdrop-blur hover:bg-[#F5F3EF] text-[#3D5A3A]"
      >
        <Edit2 className="size-3.5" />
      </Button>

      {/* Profile Photo */}
      <div className="flex justify-center mb-4">
        {person.photo ? (
          <img
            src={person.photo}
            alt={person.name}
            className="size-20 rounded-full object-cover border-3 border-[#D9D5CE] shadow-sm"
          />
        ) : (
          <div className={`size-20 rounded-full ${colors.accent} flex items-center justify-center border-3 border-[#D9D5CE] shadow-sm`}>
            <UserCircle2 className="size-12 text-[#5A6B57]" />
          </div>
        )}
      </div>

      {/* Name */}
      <h3 className="text-center mb-3 truncate text-[17px] text-[#2C3E2A]" style={{ fontWeight: 600 }}>{person.name}</h3>

      {/* Relation Badge */}
      <div className="flex justify-center mb-3">
        <span className="text-[13px] text-[#3D5A3A] px-3 py-1.5 bg-[#4CAF50]/10 rounded-full border border-[#4CAF50]/20 truncate max-w-full" style={{ fontWeight: 500 }} title={person.relation}>{person.relation}</span>
      </div>

    </motion.div>
  );
}