'use client';

import { useState, useEffect } from 'react';
import { X, Upload, User, Calendar, MapPin } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Person } from '@/lib/state-context';

interface Props {
  open: boolean;
  onClose: () => void;
  onAdd: (person: Omit<Person, 'id'>) => void;
  onUpdate: (person: Person) => void;
  familyTree: Person[];
  editingPerson: Person | null;
}

export default function AddPersonModal({ open, onClose, onAdd, onUpdate, familyTree, editingPerson }: Props) {
  const [formData, setFormData] = useState<Omit<Person, 'id'>>({
    name: '',
    relation: '',
    birthYear: '',
    deathYear: '',
    dateOfBirth: '',
    gender: 'other',
    photo: '',
    notes: '',
    generation: 0,
    timeline: [],
    gallery: [],
    documents: [],
    contact: {
      city: '',
      state: '',
      country: '',
    },
  });

  useEffect(() => {
    if (editingPerson) {
      setFormData({
        ...editingPerson,
        contact: editingPerson.contact || {
          city: '',
          state: '',
          country: '',
        },
      });
    } else {
      setFormData({
        name: '',
        relation: '',
        birthYear: '',
        deathYear: '',
        dateOfBirth: '',
        gender: 'other',
        photo: '',
        notes: '',
        generation: 0,
        timeline: [],
        gallery: [],
        documents: [],
        contact: {
          city: '',
          state: '',
          country: '',
        },
      });
    }
  }, [editingPerson, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPerson) {
      onUpdate({ ...formData, id: editingPerson.id } as Person);
    } else {
      onAdd(formData);
    }
    onClose();
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, photo: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white border-[#D9D5CE]">
        <DialogHeader>
          <DialogTitle className="text-[#2C3E2A]">{editingPerson ? 'Edit Person' : 'Add New Person'}</DialogTitle>
          <DialogDescription className="text-[#5A6B57]">
            {editingPerson ? 'Update the details of an existing person in your family tree.' : 'Add a new person to your family tree.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Photo Upload */}
          <div className="flex justify-center">
            <div className="relative">
              {formData.photo ? (
                <img
                  src={formData.photo}
                  alt="Profile"
                  className="size-32 rounded-full object-cover border-4 border-[#F5F3EF] shadow-md"
                />
              ) : (
                <div className="size-32 rounded-full bg-[#F5F3EF] flex items-center justify-center border-4 border-[#D9D5CE]">
                  <User className="size-16 text-[#5A6B57]" />
                </div>
              )}
              <label
                htmlFor="photo-upload"
                className="absolute bottom-0 right-0 bg-[#4CAF50] text-white rounded-full p-2.5 cursor-pointer hover:bg-[#3D9141] transition-colors shadow-md"
              >
                <Upload className="size-4" />
              </label>
              <input
                id="photo-upload"
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            {/* Name */}
            <div>
              <Label htmlFor="name" className="text-[#2C3E2A] mb-2">Full Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter full name"
                className="bg-white border-[#D9D5CE] text-[#2C3E2A] h-11 mt-2"
                required
              />
            </div>

            {/* Relation */}
            <div>
              <Label htmlFor="relation" className="text-[#2C3E2A] mb-2">Relation *</Label>
              <Input
                id="relation"
                value={formData.relation}
                onChange={(e) => setFormData({ ...formData, relation: e.target.value })}
                placeholder="e.g., Father, Mother, Son"
                className="bg-white border-[#D9D5CE] text-[#2C3E2A] h-11 mt-2"
                required
              />
            </div>

            {/* Gender */}
            <div>
              <Label htmlFor="gender" className="text-[#2C3E2A] mb-2">Gender</Label>
              <Select
                value={formData.gender}
                onValueChange={(value: 'male' | 'female' | 'other') =>
                  setFormData({ ...formData, gender: value })
                }
              >
                <SelectTrigger className="bg-white border-[#D9D5CE] text-[#2C3E2A] h-11 mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border-[#D9D5CE]">
                  <SelectItem value="male" className="text-[#2C3E2A]">Male</SelectItem>
                  <SelectItem value="female" className="text-[#2C3E2A]">Female</SelectItem>
                  <SelectItem value="other" className="text-[#2C3E2A]">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Generation */}
            <div>
              <Label htmlFor="generation" className="text-[#2C3E2A] mb-2">Generation</Label>
              <Select
                value={formData.generation.toString()}
                onValueChange={(value) =>
                  setFormData({ ...formData, generation: parseInt(value) })
                }
              >
                <SelectTrigger className="bg-white border-[#D9D5CE] text-[#2C3E2A] h-11 mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border-[#D9D5CE]">
                  <SelectItem value="2" className="text-[#2C3E2A]">Great Grandchild (+2)</SelectItem>
                  <SelectItem value="1" className="text-[#2C3E2A]">Grandchild (+1)</SelectItem>
                  <SelectItem value="0" className="text-[#2C3E2A]">Self (0)</SelectItem>
                  <SelectItem value="-1" className="text-[#2C3E2A]">Parent (-1)</SelectItem>
                  <SelectItem value="-2" className="text-[#2C3E2A]">Grandparent (-2)</SelectItem>
                  <SelectItem value="-3" className="text-[#2C3E2A]">Great Grandparent (-3)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Date of Birth */}
            <div>
              <Label htmlFor="dateOfBirth" className="text-[#2C3E2A] mb-2 flex items-center gap-2">
                <Calendar className="size-4" />
                Date of Birth
              </Label>
              <Input
                id="dateOfBirth"
                type="date"
                value={formData.dateOfBirth || ''}
                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                className="bg-white border-[#D9D5CE] text-[#2C3E2A] h-11 mt-2"
              />
            </div>

            {/* Birth Year (for backward compatibility) */}
            <div>
              <Label htmlFor="birthYear" className="text-[#2C3E2A] mb-2">Birth Year (Optional)</Label>
              <Input
                id="birthYear"
                value={formData.birthYear || ''}
                onChange={(e) => setFormData({ ...formData, birthYear: e.target.value })}
                placeholder="e.g., 1950"
                className="bg-white border-[#D9D5CE] text-[#2C3E2A] h-11 mt-2"
              />
            </div>

            {/* Death Year */}
            <div>
              <Label htmlFor="deathYear" className="text-[#2C3E2A] mb-2">Death Year</Label>
              <Input
                id="deathYear"
                value={formData.deathYear || ''}
                onChange={(e) => setFormData({ ...formData, deathYear: e.target.value })}
                placeholder="e.g., 2020 (if applicable)"
                className="bg-white border-[#D9D5CE] text-[#2C3E2A] h-11 mt-2"
              />
            </div>

            {/* Location - City */}
            <div>
              <Label htmlFor="city" className="text-[#2C3E2A] mb-2 flex items-center gap-2">
                <MapPin className="size-4" />
                City
              </Label>
              <Input
                id="city"
                value={formData.contact?.city || ''}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  contact: { 
                    ...formData.contact, 
                    city: e.target.value 
                  } 
                })}
                placeholder="e.g., Mumbai"
                className="bg-white border-[#D9D5CE] text-[#2C3E2A] h-11 mt-2"
              />
            </div>

            {/* Location - State */}
            <div>
              <Label htmlFor="state" className="text-[#2C3E2A] mb-2">State</Label>
              <Input
                id="state"
                value={formData.contact?.state || ''}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  contact: { 
                    ...formData.contact, 
                    state: e.target.value 
                  } 
                })}
                placeholder="e.g., Maharashtra"
                className="bg-white border-[#D9D5CE] text-[#2C3E2A] h-11 mt-2"
              />
            </div>

            {/* Location - Country */}
            <div>
              <Label htmlFor="country" className="text-[#2C3E2A] mb-2">Country</Label>
              <Input
                id="country"
                value={formData.contact?.country || ''}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  contact: { 
                    ...formData.contact, 
                    country: e.target.value 
                  } 
                })}
                placeholder="e.g., India"
                className="bg-white border-[#D9D5CE] text-[#2C3E2A] h-11 mt-2"
              />
            </div>

            {/* Parent */}
            {familyTree.length > 0 && (
              <div className="md:col-span-2">
                <Label htmlFor="parent" className="text-[#2C3E2A] mb-2">Parent (Optional)</Label>
                <Select
                  value={formData.parentId || 'none'}
                  onValueChange={(value) =>
                    setFormData({ ...formData, parentId: value === 'none' ? undefined : value })
                  }
                >
                  <SelectTrigger className="bg-white border-[#D9D5CE] text-[#2C3E2A] h-11 mt-2">
                    <SelectValue placeholder="Select parent" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-[#D9D5CE]">
                    <SelectItem value="none" className="text-[#2C3E2A]">None</SelectItem>
                    {familyTree.map((person) => (
                      <SelectItem key={person.id} value={person.id} className="text-[#2C3E2A]">
                        {person.name} ({person.relation})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor="notes" className="text-[#2C3E2A] mb-2">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Add any additional information, stories, or memories..."
              rows={4}
              className="bg-white border-[#D9D5CE] text-[#2C3E2A] mt-2"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="border-[#D9D5CE] text-[#2C3E2A] hover:bg-[#F5F3EF]">
              Cancel
            </Button>
            <Button type="submit" className="bg-[#4CAF50] hover:bg-[#3D9141] text-white shadow-sm">
              {editingPerson ? 'Update Person' : 'Add Person'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}