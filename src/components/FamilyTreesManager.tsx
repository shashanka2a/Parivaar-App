'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { TreePine, Plus, Users, Trash2, LogOut, ArrowRight, Share2 } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
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
import { toast } from 'sonner';

interface FamilyTree {
  id: string;
  name: string;
  memberCount: number;
  createdAt: string;
  lastModified: string;
}

interface Props {
  userName: string;
  onSelectTree: (treeId: string, treeName: string) => void;
  onLogout: () => void;
}

export default function FamilyTreesManager({ userName, onSelectTree, onLogout }: Props) {
  const router = useRouter();
  const [trees, setTrees] = useState<FamilyTree[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTreeName, setNewTreeName] = useState('');

  useEffect(() => {
    const loadTrees = async () => {
      try {
        const res = await fetch('/api/trees', { credentials: 'include' });
        if (!res.ok) throw new Error('Failed to load trees');
        const data = await res.json();
        setTrees(
          (data.trees || []).map((t: any) => ({
            id: t.id,
            name: t.name,
            memberCount: t.memberCount ?? 0,
            createdAt: t.createdAt,
            lastModified: t.lastModified,
          })),
        );
      } catch (error) {
        console.error('Failed to load trees:', error);
      }
    };

    loadTrees();
  }, []);

  const handleCreateTree = async () => {
    if (!newTreeName.trim()) {
      toast.error('Please enter a family name');
      return;
    }

    try {
      const res = await fetch('/api/trees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name: newTreeName }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to create tree');
      }

      const created = await res.json();

      const newTree: FamilyTree = {
        id: created.id,
        name: created.name,
        memberCount: created.memberCount ?? 0,
        createdAt: created.createdAt,
        lastModified: created.lastModified,
      };

      setTrees(prev => [newTree, ...prev]);

      toast.success(`${newTreeName} family tree created!`);
      setIsCreateModalOpen(false);
      setNewTreeName('');

      // Select the newly created tree
      onSelectTree(newTree.id, newTree.name);
    } catch (error: any) {
      console.error('Create tree failed:', error);
      toast.error(error.message || 'Failed to create tree');
    }
  };

  const handleDeleteTree = async (treeId: string, treeName: string) => {
    try {
      const res = await fetch(`/api/trees/${treeId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to delete tree');
      }

      const updatedTrees = trees.filter(t => t.id !== treeId);
      setTrees(updatedTrees);

      toast.success(`${treeName} family tree deleted`);
    } catch (error: any) {
      console.error('Delete tree failed:', error);
      toast.error(error.message || 'Failed to delete tree');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const handleShareTree = async (tree: FamilyTree) => {
    // Create shareable URL with family name
    const familySlug = tree.name.toLowerCase().replace(/\s+/g, '-');
    const shareUrl = `${window.location.origin}/${familySlug}`;
    
    // Store the tree data for sharing
    const treeData = localStorage.getItem(`parivaar-tree-${tree.id}`);
    if (treeData) {
      localStorage.setItem(`parivaar-shared-${familySlug}`, treeData);
    }
    
    // Copy to clipboard
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success('Share link copied to clipboard!');
    } catch (err) {
      toast.error('Failed to copy link');
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F3EF] flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-[#D9D5CE]/50 px-6 py-4 shadow-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#4CAF50]/10 rounded-xl">
              <TreePine className="size-6 text-[#3D5A3A]" />
            </div>
            <div>
              <h1 className="text-xl text-[#2C3E2A]">Parivaar</h1>
              <p className="text-sm text-[#5A6B57]">Welcome, {userName}</p>
            </div>
          </div>
          <Button
            onClick={onLogout}
            variant="outline"
            size="sm"
            className="border-[#D9D5CE] text-[#2C3E2A] hover:bg-[#F5F3EF]"
          >
            <LogOut className="size-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 px-6 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Title Section */}
          <div className="mb-8">
            <h2 className="text-3xl mb-2 text-[#2C3E2A]">Your Family Trees</h2>
            <p className="text-[#5A6B57]">
              Manage multiple family trees and explore your ancestral lineage
            </p>
          </div>

          {/* Create New Tree Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-[#4CAF50] hover:bg-[#3D9141] text-white shadow-sm mb-8"
              size="lg"
            >
              <Plus className="size-5 mr-2" />
              Create New Family Tree
            </Button>
          </motion.div>

          {/* Trees Grid */}
          {trees.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <Card className="p-12 bg-white border-[#D9D5CE] shadow-sm text-center">
                <div className="flex justify-center mb-4">
                  <div className="p-4 bg-[#F5F3EF] rounded-full">
                    <TreePine className="size-12 text-[#5A6B57]" />
                  </div>
                </div>
                <h3 className="text-xl mb-2 text-[#2C3E2A]">No Family Trees Yet</h3>
                <p className="text-[#5A6B57] mb-6">
                  Create your first family tree to start building your ancestral lineage
                </p>
                <Button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="bg-[#4CAF50] hover:bg-[#3D9141] text-white shadow-sm"
                >
                  <Plus className="size-4 mr-2" />
                  Create Your First Tree
                </Button>
              </Card>
            </motion.div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trees.map((tree, index) => (
                <motion.div
                  key={tree.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <Card
                    className="p-6 bg-white border-[#D9D5CE] shadow-sm hover:shadow-md transition-shadow group cursor-pointer"
                    onClick={() => onSelectTree(tree.id, tree.name)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-3 bg-[#4CAF50]/10 rounded-xl">
                        <TreePine className="size-6 text-[#3D5A3A]" />
                      </div>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="opacity-0 group-hover:opacity-100 transition-opacity text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-white border-[#D9D5CE]">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="text-[#2C3E2A]">Delete Family Tree?</AlertDialogTitle>
                            <AlertDialogDescription className="text-[#5A6B57]">
                              This will permanently delete "{tree.name}" and all its members. This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="border-[#D9D5CE] text-[#2C3E2A] hover:bg-[#F5F3EF]">
                              Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteTree(tree.id, tree.name)}
                              className="bg-red-600 hover:bg-red-700 text-white"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>

                    <h3 className="text-xl mb-2 text-[#2C3E2A]">{tree.name} Family</h3>
                    
                    <div className="flex items-center gap-2 mb-4 text-[#5A6B57]">
                      <Users className="size-4" />
                      <span className="text-sm">
                        {tree.memberCount} {tree.memberCount === 1 ? 'member' : 'members'}
                      </span>
                    </div>

                    <div className="text-xs text-[#5A6B57] mb-4">
                      <p>Created: {formatDate(tree.createdAt)}</p>
                      <p>Modified: {formatDate(tree.lastModified)}</p>
                    </div>

                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectTree(tree.id, tree.name);
                      }}
                      className="w-full bg-[#4CAF50] hover:bg-[#3D9141] text-white shadow-sm"
                    >
                      Open Tree
                      <ArrowRight className="size-4 ml-2" />
                    </Button>

                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleShareTree(tree);
                      }}
                      className="w-full bg-[#4CAF50] hover:bg-[#3D9141] text-white shadow-sm mt-2"
                    >
                      Share Tree
                      <Share2 className="size-4 ml-2" />
                    </Button>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Tree Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="bg-white border-[#D9D5CE]">
          <DialogHeader>
            <DialogTitle className="text-[#2C3E2A]">Create New Family Tree</DialogTitle>
            <DialogDescription className="text-[#5A6B57]">
              Enter your family name to create a new family tree
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="family-name" className="text-[#2C3E2A] mb-2">
                Family Name
              </Label>
              <Input
                id="family-name"
                value={newTreeName}
                onChange={(e) => setNewTreeName(e.target.value)}
                placeholder="e.g., Kumar, Smith, Garcia"
                className="bg-white border-[#D9D5CE] text-[#2C3E2A] h-11 mt-2"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleCreateTree();
                  }
                }}
              />
            </div>
          </div>

          <div className="flex gap-3 justify-end">
            <Button
              onClick={() => {
                setIsCreateModalOpen(false);
                setNewTreeName('');
              }}
              variant="outline"
              className="border-[#D9D5CE] text-[#2C3E2A] hover:bg-[#F5F3EF]"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateTree}
              className="bg-[#4CAF50] hover:bg-[#3D9141] text-white shadow-sm"
            >
              Create Tree
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}