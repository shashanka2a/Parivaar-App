'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Users, Lock, Download, Share2, Trash2, LogOut } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Separator } from './ui/separator';
import { AppState } from '@/lib/state-context';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from './ui/alert-dialog';

interface Props {
  appState: AppState;
  setAppState: React.Dispatch<React.SetStateAction<AppState>>;
}

export default function SettingsPage({ appState, setAppState }: Props) {
  const router = useRouter();
  const [shareLink, setShareLink] = useState('https://parivaar.app/share/abc123');
  const [collaboratorEmail, setCollaboratorEmail] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [allowEditing, setAllowEditing] = useState(false);

  const mockCollaborators = [
    { email: 'john@example.com', role: 'Editor', added: '2 days ago' },
    { email: 'jane@example.com', role: 'Viewer', added: '1 week ago' },
  ];

  const handleAddCollaborator = () => {
    if (!collaboratorEmail) {
      toast.error('Please enter an email address');
      return;
    }
    
    toast.success(`Invitation sent to ${collaboratorEmail}`);
    setCollaboratorEmail('');
  };

  const handleClearData = () => {
    setAppState(prev => ({
      ...prev,
      familyTree: [],
    }));
    toast.success('Family tree cleared');
  };

  const handleLogout = () => {
    setAppState({
      user: null,
      familyTree: [],
      theme: 'modern',
    });
    localStorage.removeItem('parivaar-state');
    localStorage.removeItem('parivaar_onboarded');
    toast.success('Logged out successfully');
    router.push('/onboarding');
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(appState, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = 'parivaar-family-tree.json';

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();

    toast.success('Family tree exported successfully!');
  };

  const copyShareLink = () => {
    navigator.clipboard.writeText(shareLink);
    toast.success('Share link copied to clipboard!');
  };

  return (
    <div className="min-h-screen bg-[#F5F3EF] flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-[#D9D5CE]/50 px-6 py-4 flex items-center gap-3 sticky top-0 z-30 shadow-sm">
        <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard')} className="hover:bg-[#F5F3EF] text-[#2C3E2A]">
          <ArrowLeft className="size-5" />
        </Button>
        <h1 className="text-lg md:text-xl text-[#2C3E2A]">Settings</h1>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Collaborators Section */}
        <Card className="p-6 mb-6 bg-white border-[#D9D5CE] shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <Users className="size-5 text-[#3D5A3A]" />
            <h2 className="text-xl text-[#2C3E2A]">Manage Collaborators</h2>
          </div>
          <p className="text-[#5A6B57] mb-6">
            Invite family members to view or edit your family tree
          </p>

          <div className="flex gap-3 mb-6">
            <Input
              value={collaboratorEmail}
              onChange={(e) => setCollaboratorEmail(e.target.value)}
              placeholder="Enter email address"
              type="email"
              className="bg-white border-[#D9D5CE] text-[#2C3E2A] h-11"
            />
            <Button onClick={handleAddCollaborator} className="bg-[#4CAF50] hover:bg-[#3D9141] text-white shadow-sm">
              Invite
            </Button>
          </div>

          <div className="space-y-3">
            {mockCollaborators.map((collaborator, index) => (
              <div key={index} className="flex items-center justify-between p-4 rounded-lg border border-[#D9D5CE] bg-[#F5F3EF]/30">
                <div>
                  <p className="text-[#2C3E2A]">{collaborator.email}</p>
                  <p className="text-sm text-[#5A6B57]">
                    {collaborator.role} • Added {collaborator.added}
                  </p>
                </div>
                <Button variant="ghost" size="sm" className="hover:bg-white text-red-600">
                  <Trash2 className="size-4" />
                </Button>
              </div>
            ))}
          </div>
        </Card>

        {/* Privacy Settings */}
        <Card className="p-6 mb-6 bg-white border-[#D9D5CE] shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <Lock className="size-5 text-[#3D5A3A]" />
            <h2 className="text-xl text-[#2C3E2A]">Privacy Settings</h2>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="public-tree" className="text-[#2C3E2A]">Make Tree Public</Label>
                <p className="text-sm text-[#5A6B57]">
                  Allow anyone with the link to view your tree
                </p>
              </div>
              <Switch
                id="public-tree"
                checked={isPublic}
                onCheckedChange={setIsPublic}
              />
            </div>

            <Separator className="bg-[#D9D5CE]" />

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="allow-editing" className="text-[#2C3E2A]">Allow Collaborator Editing</Label>
                <p className="text-sm text-[#5A6B57]">
                  Let collaborators add and edit people in your tree
                </p>
              </div>
              <Switch
                id="allow-editing"
                checked={allowEditing}
                onCheckedChange={setAllowEditing}
              />
            </div>
          </div>
        </Card>

        {/* Export & Sharing */}
        <Card className="p-6 mb-6 bg-white border-[#D9D5CE] shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <Download className="size-5 text-[#3D5A3A]" />
            <h2 className="text-xl text-[#2C3E2A]">Export & Sharing</h2>
          </div>

          <div className="space-y-4">
            <div>
              <Label className="mb-2 block text-[#2C3E2A]">Export Family Tree</Label>
              <div className="flex flex-wrap gap-3">
                <Button onClick={handleExport} variant="outline" className="border-[#D9D5CE] text-[#2C3E2A] hover:bg-[#F5F3EF]">
                  <Download className="size-4 mr-2" />
                  Export as JSON
                </Button>
              </div>
            </div>

            <Separator className="bg-[#D9D5CE]" />

            <div>
              <Label className="mb-2 block text-[#2C3E2A]">Generate Share Link</Label>
              <Button onClick={copyShareLink} className="bg-[#4CAF50] hover:bg-[#3D9141] text-white shadow-sm">
                <Share2 className="size-4 mr-2" />
                Create Share Link
              </Button>
            </div>
          </div>
        </Card>

        {/* Danger Zone */}
        <Card className="p-6 border-2 border-red-200 bg-white shadow-sm">
          <h2 className="text-xl mb-4 text-red-600">Danger Zone</h2>

          <div className="space-y-4">
            <div>
              <Label className="mb-2 block text-[#2C3E2A]">Clear All Data</Label>
              <p className="text-sm text-[#5A6B57] mb-3">
                This will permanently delete all people in your family tree. This action cannot be undone.
              </p>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">
                    <Trash2 className="size-4 mr-2" />
                    Clear Family Tree
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-white border-[#D9D5CE]">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-[#2C3E2A]">Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription className="text-[#5A6B57]">
                      This action cannot be undone. This will permanently delete all people from your family tree.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="border-[#D9D5CE] text-[#2C3E2A] hover:bg-[#F5F3EF]">Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleClearData} className="bg-red-600 hover:bg-red-700 text-white">
                      Yes, clear all data
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>

            <Separator className="bg-[#D9D5CE]" />

            <div>
              <Label className="mb-2 block text-[#2C3E2A]">Logout</Label>
              <p className="text-sm text-[#5A6B57] mb-3">
                Sign out of your account
              </p>
              <Button onClick={handleLogout} variant="outline" className="border-[#D9D5CE] text-[#2C3E2A] hover:bg-[#F5F3EF]">
                <LogOut className="size-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}