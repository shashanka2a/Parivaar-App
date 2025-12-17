'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { TreePine, Save, Share2, Download, Search, Settings, Palette, Plus, Menu, FileImage, FileText } from 'lucide-react';
import { Button } from './ui/button';
import { AppState, Person } from '@/lib/state-context';
import FamilyCanvas from './FamilyCanvas';
import AddPersonModal from './AddPersonModal';
import ProfileDrawer from './ProfileDrawer';
import DetailedEditModal from './DetailedEditModal';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from './ui/dropdown-menu';
import { toast } from 'sonner';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface Props {
  appState: AppState;
  setAppState: React.Dispatch<React.SetStateAction<AppState>>;
}

export default function TreeDashboard({ appState, setAppState }: Props) {
  const router = useRouter();
  const [addPersonModalOpen, setAddPersonModalOpen] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [profileDrawerOpen, setProfileDrawerOpen] = useState(false);
  const [editingPerson, setEditingPerson] = useState<Person | null>(null);
  const [detailedEditPerson, setDetailedEditPerson] = useState<Person | null>(null);
  const [detailedEditModalOpen, setDetailedEditModalOpen] = useState(false);

  const handleSave = () => {
    toast.success('Family tree saved successfully!');
  };

  const handleExportData = () => {
    const dataStr = JSON.stringify(appState, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = 'parivaar-family-tree.json';

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();

    toast.success('Family tree exported successfully!');
  };

  const handleShare = async () => {
    if (!appState.currentTreeId) {
      toast.error('No family tree selected to share');
      return;
    }

    try {
      const res = await fetch('/api/shares', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ treeId: appState.currentTreeId }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to create share link');
      }

      const data = await res.json();
      const shareUrl =
        data.url ||
        `${window.location.origin}/shared/${data.shareId}`;

      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(shareUrl);
        toast.success('Share link copied to clipboard!', {
          description: shareUrl,
        });
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = shareUrl;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        toast.success('Share link copied to clipboard!', {
          description: shareUrl,
        });
      }
    } catch (err: any) {
      console.error('Share link creation failed:', err);
      toast.error(err.message || 'Failed to generate share link');
    }
  };

  const handleExportPNG = async () => {
    const treeElement = document.querySelector('.family-canvas-content') as HTMLElement;
    if (!treeElement) {
      toast.error('Unable to find tree canvas');
      return;
    }

    try {
      toast.loading('Generating PNG...');
      const canvas = await html2canvas(treeElement, {
        backgroundColor: '#F5F3EF',
        scale: 2,
        logging: false,
      });

      const link = document.createElement('a');
      const familyName = appState.familyName || 'family-tree';
      link.download = `${familyName.toLowerCase().replace(/\s+/g, '-')}-tree.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      
      toast.dismiss();
      toast.success('Family tree exported as PNG!');
    } catch (error) {
      toast.dismiss();
      toast.error('Failed to export as PNG');
      console.error(error);
    }
  };

  const handleExportPDF = async () => {
    const treeElement = document.querySelector('.family-canvas-content') as HTMLElement;
    if (!treeElement) {
      toast.error('Unable to find tree canvas');
      return;
    }

    try {
      toast.loading('Generating PDF...');
      const canvas = await html2canvas(treeElement, {
        backgroundColor: '#F5F3EF',
        scale: 2,
        logging: false,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
        unit: 'px',
        format: [canvas.width, canvas.height],
      });

      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      
      const familyName = appState.familyName || 'family-tree';
      pdf.save(`${familyName.toLowerCase().replace(/\s+/g, '-')}-tree.pdf`);
      
      toast.dismiss();
      toast.success('Family tree exported as PDF!');
    } catch (error) {
      toast.dismiss();
      toast.error('Failed to export as PDF');
      console.error(error);
    }
  };

  const handleAddPerson = (newPerson: Omit<Person, 'id'>) => {
    const person: Person = {
      ...newPerson,
      id: Date.now().toString(),
      timeline: newPerson.timeline || [],
      gallery: newPerson.gallery || [],
      documents: newPerson.documents || [],
    };

    setAppState(prev => ({
      ...prev,
      familyTree: [...prev.familyTree, person],
    }));

    toast.success(`${person.name} added to family tree`);
  };

  const handleUpdatePerson = (updatedPerson: Person) => {
    setAppState(prev => ({
      ...prev,
      familyTree: prev.familyTree.map(p => p.id === updatedPerson.id ? updatedPerson : p),
    }));

    toast.success(`${updatedPerson.name} updated`);
  };

  const handleNodeClick = (person: Person) => {
    setSelectedPerson(person);
    setProfileDrawerOpen(true);
  };

  const handleEditPerson = (person: Person) => {
    setEditingPerson(person);
    setAddPersonModalOpen(true);
  };

  const handleDetailedEdit = (person: Person) => {
    setDetailedEditPerson(person);
    setDetailedEditModalOpen(true);
  };

  const handleThemeChange = (theme: 'classic' | 'modern' | 'colorful') => {
    setAppState(prev => ({ ...prev, theme }));
    toast.success(`Theme changed to ${theme}`);
  };

  const exportTree = () => {
    handleExportData();
    handleExportPNG();
    handleExportPDF();
  };

  return (
    <div className="h-screen flex flex-col bg-[#F5F3EF]">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-md border-b border-[#D9D5CE]/50 px-6 py-4 flex items-center justify-between sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-1.5 bg-[#4CAF50]/10 rounded-xl cursor-pointer hover:bg-[#4CAF50]/20 transition-colors" onClick={() => router.push('/trees')}>
            <TreePine className="size-6 text-[#3D5A3A]" />
          </div>
          <div>
            <h1 className="text-lg md:text-xl text-[#2C3E2A]">Parivaar</h1>
            <p className="text-xs text-[#5A6B57] hidden sm:block">
              {appState.familyTree.length} {appState.familyTree.length === 1 ? 'member' : 'members'}
            </p>
          </div>
        </div>

        {/* Center Title */}
        <div className="absolute left-1/2 -translate-x-1/2 text-center hidden md:block">
          <h2 className="text-xl text-[#2C3E2A]">{appState.familyName || appState.user?.name?.split(' ')[0] || 'Our'}'s Family Tree</h2>
          <p className="text-sm text-[#5A6B57]">Explore your ancestral lineage</p>
        </div>

        <div className="flex items-center gap-2">
          {/* Mobile Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="hover:bg-[#F5F3EF] text-[#2C3E2A]">
                <Menu className="size-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-white border-[#D9D5CE]">
              <DropdownMenuItem onClick={() => router.push('/explore')} className="hover:bg-[#F5F3EF]">
                <Search className="size-4 mr-2 text-[#3D5A3A]" />
                <span className="text-[#2C3E2A]">Explore & Search</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push('/settings')} className="hover:bg-[#F5F3EF]">
                <Settings className="size-4 mr-2 text-[#3D5A3A]" />
                <span className="text-[#2C3E2A]">Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-[#D9D5CE]" />
              <DropdownMenuItem onClick={exportTree} className="hover:bg-[#F5F3EF]">
                <Download className="size-4 mr-2 text-[#3D5A3A]" />
                <span className="text-[#2C3E2A]">Export Tree</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button 
            onClick={() => {
              setEditingPerson(null);
              setAddPersonModalOpen(true);
            }} 
            size="sm" 
            className="bg-[#4CAF50] hover:bg-[#3D9141] text-white shadow-sm"
          >
            <Plus className="size-4 mr-1" />
            <span className="hidden sm:inline">Add Person</span>
          </Button>
        </div>
      </header>

      {/* Canvas Area */}
      <div className="flex-1 relative overflow-hidden">
        <FamilyCanvas
          familyTree={appState.familyTree}
          theme={appState.theme}
          onNodeClick={handleNodeClick}
          onEditPerson={handleEditPerson}
          familyName={appState.familyName || appState.user?.name?.split(' ')[0] || 'Our'}
        />

        {/* Floating Add Button */}
        <Button
          onClick={() => {
            setEditingPerson(null);
            setAddPersonModalOpen(true);
          }}
          size="lg"
          className="fixed bottom-6 right-6 rounded-full size-14 bg-[#4CAF50] hover:bg-[#3D9141] text-white shadow-lg transition-all hover:shadow-xl hover:scale-105"
        >
          <Plus className="size-6" />
        </Button>
      </div>

      {/* Add Person Modal */}
      <AddPersonModal
        open={addPersonModalOpen}
        onClose={() => {
          setAddPersonModalOpen(false);
          setEditingPerson(null);
        }}
        onAdd={handleAddPerson}
        onUpdate={handleUpdatePerson}
        familyTree={appState.familyTree}
        editingPerson={editingPerson}
      />

      {/* Profile Drawer */}
      <ProfileDrawer
        open={profileDrawerOpen}
        onClose={() => setProfileDrawerOpen(false)}
        person={selectedPerson}
        onEdit={handleDetailedEdit}
        onUpdate={handleUpdatePerson}
      />

      {/* Detailed Edit Modal */}
      <DetailedEditModal
        open={detailedEditModalOpen}
        onClose={() => {
          setDetailedEditModalOpen(false);
          setDetailedEditPerson(null);
        }}
        person={detailedEditPerson}
        onUpdate={handleUpdatePerson}
      />
    </div>
  );
}