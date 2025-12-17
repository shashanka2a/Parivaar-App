'use client';

import { useState, useEffect } from 'react';
import { X, Plus, Trash2, Upload, Image as ImageIcon, FileText } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Card } from './ui/card';
import { Person } from '@/lib/state-context';

interface Props {
  open: boolean;
  onClose: () => void;
  person: Person | null;
  onUpdate: (person: Person) => void;
}

export default function DetailedEditModal({ open, onClose, person, onUpdate }: Props) {
  const [formData, setFormData] = useState<Person | null>(null);

  useEffect(() => {
    if (person) {
      setFormData({
        ...person,
        education: person.education || [],
        career: person.career || [],
        contact: person.contact || {},
      });
    }
  }, [person]);

  if (!formData) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(formData);
    onClose();
  };

  const addEducation = () => {
    setFormData({
      ...formData,
      education: [...(formData.education || []), { level: '', institution: '', year: '', status: '' }],
    });
  };

  const updateEducation = (index: number, field: string, value: string) => {
    const updated = [...(formData.education || [])];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, education: updated });
  };

  const removeEducation = (index: number) => {
    const updated = formData.education?.filter((_, i) => i !== index);
    setFormData({ ...formData, education: updated });
  };

  const addCareer = () => {
    setFormData({
      ...formData,
      career: [...(formData.career || []), { title: '', company: '', period: '', achievements: '' }],
    });
  };

  const updateCareer = (index: number, field: string, value: string) => {
    const updated = [...(formData.career || [])];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, career: updated });
  };

  const removeCareer = (index: number) => {
    const updated = formData.career?.filter((_, i) => i !== index);
    setFormData({ ...formData, career: updated });
  };

  const handleGalleryUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const readers = files.map((file) => {
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
    });

    Promise.all(readers).then((images) => {
      setFormData({
        ...formData,
        gallery: [...(formData.gallery || []), ...images],
      });
    });
  };

  const removeGalleryImage = (index: number) => {
    const updated = formData.gallery?.filter((_, i) => i !== index);
    setFormData({ ...formData, gallery: updated });
  };

  const handleDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newDoc = {
          name: file.name,
          type: file.type,
          url: reader.result as string,
        };
        setFormData({
          ...formData,
          documents: [...(formData.documents || []), newDoc],
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const removeDocument = (index: number) => {
    const updated = formData.documents?.filter((_, i) => i !== index);
    setFormData({ ...formData, documents: updated });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto bg-[#F5F3EF] p-0">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-white">
          <DialogHeader className="flex-1">
            <DialogTitle className="text-lg md:text-xl font-semibold">
              Edit Detailed Profile<span className="text-sm text-muted-foreground font-normal"> – {person?.name}</span>
            </DialogTitle>
          </DialogHeader>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="rounded-full"
            onClick={onClose}
            aria-label="Close"
          >
            <X className="size-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 pb-6 pt-4">
          <Tabs defaultValue="biography" className="mt-2">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 mb-6 bg-[#F5F3EF] rounded-xl p-1 gap-1">
              <TabsTrigger value="biography" className="rounded-lg py-2 text-sm font-medium">Story</TabsTrigger>
              <TabsTrigger value="personal" className="rounded-lg py-2 text-sm font-medium">Personal</TabsTrigger>
              <TabsTrigger value="education" className="rounded-lg py-2 text-sm font-medium">Education</TabsTrigger>
              <TabsTrigger value="career" className="rounded-lg py-2 text-sm font-medium">Career</TabsTrigger>
              <TabsTrigger value="contact" className="rounded-lg py-2 text-sm font-medium">Contact</TabsTrigger>
              <TabsTrigger value="media" className="rounded-lg py-2 text-sm font-medium">Media</TabsTrigger>
            </TabsList>

            {/* Biography Tab */}
            <TabsContent value="biography" className="space-y-6">
              <div>
                <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase mb-2">
                  Story
                </p>
                <Label htmlFor="biography" className="text-sm font-medium text-[#2C3E2A]">
                  Biography / Life Story
                </Label>
                <Textarea
                  id="biography"
                  value={formData.biography || ''}
                  onChange={(e) => setFormData({ ...formData, biography: e.target.value })}
                  placeholder="Write about their life, achievements, personality, memorable moments..."
                  rows={8}
                  className="mt-2 bg-white border-[#E0DAD0]"
                />
              </div>

              <div>
                <Label htmlFor="notes" className="text-sm font-medium text-[#2C3E2A]">
                  Additional Notes
                </Label>
                <Textarea
                  id="notes"
                  value={formData.notes || ''}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Any other information..."
                  rows={4}
                  className="mt-2 bg-white border-[#E0DAD0]"
                />
              </div>
            </TabsContent>

            {/* Personal Details Tab */}
            <TabsContent value="personal" className="space-y-8">
              {/* Astrological Details */}
              <div>
                <div className="flex items-baseline justify-between mb-3">
                  <h3 className="text-sm font-semibold text-[#2C3E2A]">Astrological Details</h3>
                  <p className="text-xs text-muted-foreground">Optional, for traditional records</p>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="nakshatram" className="text-xs font-medium text-[#4B5563]">
                      Nakshatram
                    </Label>
                    <Input
                      id="nakshatram"
                      value={formData.nakshatram || ''}
                      onChange={(e) => setFormData({ ...formData, nakshatram: e.target.value })}
                      placeholder="e.g., Ashwini"
                      className="mt-1 bg-white border-[#E0DAD0]"
                    />
                  </div>
                  <div>
                    <Label htmlFor="moolaPadam" className="text-xs font-medium text-[#4B5563]">
                      Padam
                    </Label>
                    <Input
                      id="moolaPadam"
                      value={formData.moolaPadam || ''}
                      onChange={(e) => setFormData({ ...formData, moolaPadam: e.target.value })}
                      placeholder="e.g., 1st Padam"
                      className="mt-1 bg-white border-[#E0DAD0]"
                    />
                  </div>
                  <div>
                    <Label htmlFor="rasi" className="text-xs font-medium text-[#4B5563]">
                      Rasi
                    </Label>
                    <Input
                      id="rasi"
                      value={formData.rasi || ''}
                      onChange={(e) => setFormData({ ...formData, rasi: e.target.value })}
                      placeholder="e.g., Mesha"
                      className="mt-1 bg-white border-[#E0DAD0]"
                    />
                  </div>
                </div>
              </div>

              {/* Physical Attributes */}
              <div>
                <h3 className="mb-3 text-sm font-semibold text-[#2C3E2A]">Physical Attributes</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="height" className="text-xs font-medium text-[#4B5563]">
                      Height
                    </Label>
                    <Input
                      id="height"
                      value={formData.height || ''}
                      onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                      placeholder="e.g., 5'8&quot;"
                      className="mt-1 bg-white border-[#E0DAD0]"
                    />
                  </div>
                  <div>
                    <Label htmlFor="weight" className="text-xs font-medium text-[#4B5563]">
                      Weight
                    </Label>
                    <Input
                      id="weight"
                      value={formData.weight || ''}
                      onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                      placeholder="e.g., 70 kg"
                      className="mt-1 bg-white border-[#E0DAD0]"
                    />
                  </div>
                  <div>
                    <Label htmlFor="bloodGroup" className="text-xs font-medium text-[#4B5563]">
                      Blood Group
                    </Label>
                    <Input
                      id="bloodGroup"
                      value={formData.bloodGroup || ''}
                      onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                      placeholder="e.g., O+"
                      className="mt-1 bg-white border-[#E0DAD0]"
                    />
                  </div>
                  <div>
                    <Label htmlFor="complexion" className="text-xs font-medium text-[#4B5563]">
                      Complexion
                    </Label>
                    <Input
                      id="complexion"
                      value={formData.complexion || ''}
                      onChange={(e) => setFormData({ ...formData, complexion: e.target.value })}
                      placeholder="e.g., Fair, Wheatish"
                      className="mt-1 bg-white border-[#E0DAD0]"
                    />
                  </div>
                </div>
              </div>

              {/* Important Dates */}
              <div>
                <h3 className="mb-3 text-sm font-semibold text-[#2C3E2A]">Important Dates</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="dateOfBirth" className="text-xs font-medium text-[#4B5563]">
                      Date of Birth
                    </Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={formData.dateOfBirth || ''}
                      onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                      className="mt-1 bg-white border-[#E0DAD0]"
                    />
                  </div>
                  <div>
                    <Label htmlFor="birthPlace" className="text-xs font-medium text-[#4B5563]">
                      Birth Place
                    </Label>
                    <Input
                      id="birthPlace"
                      value={formData.birthPlace || ''}
                      onChange={(e) => setFormData({ ...formData, birthPlace: e.target.value })}
                      placeholder="e.g., Mumbai, Maharashtra"
                      className="mt-1 bg-white border-[#E0DAD0]"
                    />
                  </div>
                  <div>
                    <Label htmlFor="marriageDate" className="text-xs font-medium text-[#4B5563]">
                      Marriage Date
                    </Label>
                    <Input
                      id="marriageDate"
                      type="date"
                      value={formData.marriageDate || ''}
                      onChange={(e) => setFormData({ ...formData, marriageDate: e.target.value })}
                      className="mt-1 bg-white border-[#E0DAD0]"
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Education Tab */}
            <TabsContent value="education" className="space-y-5">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-semibold text-[#2C3E2A]">Education History</h3>
                <Button type="button" onClick={addEducation} size="sm">
                  <Plus className="size-4 mr-2" />
                  Add Education
                </Button>
              </div>

              {formData.education && formData.education.length > 0 ? (
                <div className="space-y-4">
                  {formData.education.map((edu, index) => (
                    <Card key={index} className="p-4 border-[#E0DAD0] bg-white">
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="text-sm font-medium text-[#111827]">Education Entry {index + 1}</h4>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeEducation(index)}
                        >
                          <Trash2 className="size-4 text-red-500" />
                        </Button>
                      </div>
                      <div className="grid md:grid-cols-2 gap-3">
                        <div>
                          <Label className="text-xs font-medium text-[#4B5563]">Level</Label>
                          <Input
                            value={edu.level}
                            onChange={(e) => updateEducation(index, 'level', e.target.value)}
                            placeholder="e.g., Bachelor's, Master's"
                          />
                        </div>
                        <div>
                          <Label className="text-xs font-medium text-[#4B5563]">Institution</Label>
                          <Input
                            value={edu.institution}
                            onChange={(e) => updateEducation(index, 'institution', e.target.value)}
                            placeholder="School/College name"
                          />
                        </div>
                        <div>
                          <Label className="text-xs font-medium text-[#4B5563]">Year</Label>
                          <Input
                            value={edu.year}
                            onChange={(e) => updateEducation(index, 'year', e.target.value)}
                            placeholder="e.g., 2015-2019"
                          />
                        </div>
                        <div>
                          <Label className="text-xs font-medium text-[#4B5563]">Status</Label>
                          <Input
                            value={edu.status}
                            onChange={(e) => updateEducation(index, 'status', e.target.value)}
                            placeholder="e.g., Completed, In Progress"
                          />
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="p-8 text-center text-gray-500 bg-white border-[#E0DAD0]">
                  <p>No education entries yet. Click "Add Education" to start.</p>
                </Card>
              )}
            </TabsContent>

            {/* Career Tab */}
            <TabsContent value="career" className="space-y-5">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-semibold text-[#2C3E2A]">Career History</h3>
                <Button type="button" onClick={addCareer} size="sm">
                  <Plus className="size-4 mr-2" />
                  Add Career Entry
                </Button>
              </div>

              {formData.career && formData.career.length > 0 ? (
                <div className="space-y-4">
                  {formData.career.map((job, index) => (
                    <Card key={index} className="p-4 border-[#E0DAD0] bg-white">
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="text-sm font-medium text-[#111827]">Career Entry {index + 1}</h4>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeCareer(index)}
                        >
                          <Trash2 className="size-4 text-red-500" />
                        </Button>
                      </div>
                      <div className="space-y-3">
                        <div className="grid md:grid-cols-2 gap-3">
                          <div>
                            <Label>Job Title</Label>
                            <Input
                              value={job.title}
                              onChange={(e) => updateCareer(index, 'title', e.target.value)}
                              placeholder="e.g., Senior Software Engineer"
                            />
                          </div>
                          <div>
                            <Label>Company</Label>
                            <Input
                              value={job.company}
                              onChange={(e) => updateCareer(index, 'company', e.target.value)}
                              placeholder="Company name"
                            />
                          </div>
                        </div>
                        <div>
                          <Label>Period</Label>
                          <Input
                            value={job.period}
                            onChange={(e) => updateCareer(index, 'period', e.target.value)}
                            placeholder="e.g., 2018-2022"
                          />
                        </div>
                        <div>
                          <Label>Achievements</Label>
                          <Textarea
                            value={job.achievements}
                            onChange={(e) => updateCareer(index, 'achievements', e.target.value)}
                            placeholder="Key achievements and responsibilities..."
                            rows={3}
                          />
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="p-8 text-center text-gray-500">
                  <p>No career entries yet. Click "Add Career Entry" to start.</p>
                </Card>
              )}
            </TabsContent>

            {/* Contact Tab */}
            <TabsContent value="contact" className="space-y-6">
              <div>
                <h3 className="mb-4">Contact Information</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={formData.contact?.phone || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          contact: { ...formData.contact, phone: e.target.value },
                        })
                      }
                      placeholder="+91 1234567890"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.contact?.email || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          contact: { ...formData.contact, email: e.target.value },
                        })
                      }
                      placeholder="email@example.com"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="mb-4">Address</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="address">Street Address</Label>
                    <Textarea
                      id="address"
                      value={formData.contact?.address || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          contact: { ...formData.contact, address: e.target.value },
                        })
                      }
                      placeholder="Street address"
                      rows={2}
                    />
                  </div>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        value={formData.contact?.city || ''}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            contact: { ...formData.contact, city: e.target.value },
                          })
                        }
                        placeholder="City"
                      />
                    </div>
                    <div>
                      <Label htmlFor="state">State</Label>
                      <Input
                        id="state"
                        value={formData.contact?.state || ''}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            contact: { ...formData.contact, state: e.target.value },
                          })
                        }
                        placeholder="State"
                      />
                    </div>
                    <div>
                      <Label htmlFor="country">Country</Label>
                      <Input
                        id="country"
                        value={formData.contact?.country || ''}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            contact: { ...formData.contact, country: e.target.value },
                          })
                        }
                        placeholder="Country"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Media Tab */}
            <TabsContent value="media" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3>Gallery Images</h3>
                <label htmlFor="gallery-upload">
                  <Button type="button" size="sm" asChild>
                    <span className="cursor-pointer">
                      <Upload className="size-4 mr-2" />
                      Upload Images
                    </span>
                  </Button>
                </label>
                <input
                  id="gallery-upload"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleGalleryUpload}
                  className="hidden"
                />
              </div>

              {formData.gallery && formData.gallery.length > 0 ? (
                <div className="grid grid-cols-2 gap-4">
                  {formData.gallery.map((image, index) => (
                    <Card key={index} className="p-3 relative group">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeGalleryImage(index)}
                        className="absolute top-2 right-2 bg-white/90 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="size-4 text-red-500" />
                      </Button>
                      <img
                        src={image}
                        alt={`Gallery ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="p-8 text-center text-gray-500">
                  <ImageIcon className="size-12 mx-auto mb-3 text-gray-400" />
                  <p>No gallery images yet. Click "Upload Images" to start.</p>
                </Card>
              )}

              <div className="flex justify-between items-center mt-6">
                <h3>Documents</h3>
                <label htmlFor="document-upload">
                  <Button type="button" size="sm" asChild>
                    <span className="cursor-pointer">
                      <Upload className="size-4 mr-2" />
                      Upload Document
                    </span>
                  </Button>
                </label>
                <input
                  id="document-upload"
                  type="file"
                  accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg"
                  onChange={handleDocumentUpload}
                  className="hidden"
                />
              </div>

              {formData.documents && formData.documents.length > 0 ? (
                <div className="space-y-3">
                  {formData.documents.map((doc, index) => (
                    <Card key={index} className="p-4 flex items-center justify-between hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-3">
                        <FileText className="size-5 text-gray-400" />
                        <div>
                          <p className="text-sm">{doc.name}</p>
                          <p className="text-xs text-gray-500">{doc.type}</p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeDocument(index)}
                      >
                        <Trash2 className="size-4 text-red-500" />
                      </Button>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="p-8 text-center text-gray-500">
                  <FileText className="size-12 mx-auto mb-3 text-gray-400" />
                  <p>No documents yet. Click "Upload Document" to start.</p>
                </Card>
              )}
            </TabsContent>
          </Tabs>

          {/* Actions */}
          <div className="flex gap-3 justify-end mt-6 pt-6 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">
              Save Changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}