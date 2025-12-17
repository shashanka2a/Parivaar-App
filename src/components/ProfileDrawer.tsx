'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Edit2, User, BookOpen, GraduationCap, Briefcase, MapPin, Phone, Image, FileText, Heart, Calendar, Ruler, Droplet, Users, Mail, Home, Star, Circle, Weight as WeightIcon, Activity, Pencil, ArrowLeft } from 'lucide-react';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Card } from './ui/card';
import { Separator } from './ui/separator';
import { Badge } from './ui/badge';
import { Person } from '@/lib/state-context';
import { toast } from 'sonner';
import { uploadProfileImage } from '@/lib/supabase';
import { useAppState } from '@/lib/state-context';

interface Props {
  open: boolean;
  onClose: () => void;
  person: Person | null;
  onEdit: (person: Person) => void;
  onUpdate?: (person: Person) => void;
}

// Utility function to format date from YYYY-MM-DD to dd-mm-yyyy
const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      // If it's not a valid date, try parsing as YYYY-MM-DD
      const parts = dateString.split('-');
      if (parts.length === 3) {
        const [year, month, day] = parts;
        return `${day}-${month}-${year}`;
      }
      return dateString; // Return as-is if can't parse
    }
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  } catch {
    return dateString; // Return as-is if error
  }
};

export default function ProfileDrawer({ open, onClose, person, onEdit, onUpdate }: Props) {
  if (!person) return null;
  const { appState } = useAppState();

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !person) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    try {
      toast.loading('Uploading profile photo...', { id: 'profile-photo-upload' });

      const publicUrl = await uploadProfileImage(file, {
        personId: person.id,
        treeId: appState.currentTreeId,
      });

      const updatedPerson: Person = {
        ...person,
        photo: publicUrl,
      };

      if (onUpdate) {
        onUpdate(updatedPerson);
      }

      toast.success('Profile photo updated successfully!', { id: 'profile-photo-upload' });
    } catch (error: any) {
      console.error('Profile photo upload failed:', error);
      toast.error('Failed to upload image. Please try again.', { id: 'profile-photo-upload' });
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40"
          />

          {/* Full-screen profile view */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 40 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 h-full w-full bg-white shadow-2xl z-50 overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 bg-card border-b px-4 md:px-8 py-4 flex items-center justify-between z-10">
              <div className="flex items-center gap-3">
                <Button
                  onClick={onClose}
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-1"
                >
                  <ArrowLeft className="size-4" />
                  <span>Back</span>
                </Button>
                <h2 className="text-lg md:text-xl">Profile Details</h2>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    onEdit(person);
                    onClose();
                  }}
                  variant="ghost"
                  size="sm"
                >
                  <Edit2 className="size-4 mr-2" />
                  Edit
                </Button>
                <Button onClick={onClose} variant="ghost" size="sm">
                  <X className="size-4" />
                </Button>
              </div>
            </div>

            {/* Profile Header */}
            <div className="px-4 md:px-8 py-6 border-b bg-gradient-to-br from-[#E9F5E2] to-[#C7E9C0]/30">
              <div className="flex flex-col items-center text-center">
                <div className="relative group">
                  {person.photo ? (
                    <img
                      src={person.photo}
                      alt={person.name}
                      className="size-32 rounded-full object-cover border-4 border-white shadow-lg mb-4"
                    />
                  ) : (
                    <div className="size-32 rounded-full bg-muted flex items-center justify-center border-4 border-white shadow-lg mb-4">
                      <User className="size-16 text-muted-foreground" />
                    </div>
                  )}
                  {/* Pen Icon Overlay */}
                  <label
                    htmlFor="profile-photo-upload"
                    className="absolute bottom-2 right-2 bg-[#4CAF50] text-white rounded-full p-2.5 cursor-pointer hover:bg-[#3D9141] transition-colors shadow-lg group-hover:opacity-100 opacity-90 z-10"
                    title="Upload photo"
                  >
                    <Pencil className="size-4" />
                  </label>
                  <input
                    id="profile-photo-upload"
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </div>
                <h3 className="text-2xl mb-1" style={{ fontWeight: 600 }}>{person.name}</h3>
                <p className="text-secondary-foreground text-sm mb-2 px-3 py-1 bg-secondary rounded-full inline-block">{person.relation}</p>
                {person.dateOfBirth && (
                  <p className="text-sm text-muted-foreground mb-1">
                    Born: {formatDate(person.dateOfBirth)}
                  </p>
                )}
              </div>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="overview" className="p-4 md:p-6">
              <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 mb-6 h-auto p-1.5 gap-1.5">
                <TabsTrigger value="overview" className="py-2.5 px-2 md:px-4 gap-1 md:gap-2 min-w-0 justify-center">
                  <User className="size-4 shrink-0" />
                  <span className="truncate">Overview</span>
                </TabsTrigger>
                <TabsTrigger value="personal" className="py-2.5 px-2 md:px-4 gap-1 md:gap-2 min-w-0 justify-center">
                  <Heart className="size-4 shrink-0" />
                  <span className="truncate">Personal</span>
                </TabsTrigger>
                <TabsTrigger value="education" className="py-2.5 px-2 md:px-4 gap-1 md:gap-2 min-w-0 justify-center">
                  <GraduationCap className="size-4 shrink-0" />
                  <span className="truncate">Education</span>
                </TabsTrigger>
                <TabsTrigger value="career" className="py-2.5 px-2 md:px-4 gap-1 md:gap-2 min-w-0 justify-center">
                  <Briefcase className="size-4 shrink-0" />
                  <span className="truncate">Career</span>
                </TabsTrigger>
                <TabsTrigger value="contact" className="py-2.5 px-2 md:px-4 gap-1 md:gap-2 min-w-0 justify-center">
                  <MapPin className="size-4 shrink-0" />
                  <span className="truncate">Contact</span>
                </TabsTrigger>
                <TabsTrigger value="media" className="py-2.5 px-2 md:px-4 gap-1 md:gap-2 min-w-0 justify-center">
                  <Image className="size-4 shrink-0" />
                  <span className="truncate">Media</span>
                </TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6 mt-0">
                {/* Biography Section */}
                {person.biography && (
                  <Card className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100">
                    <div className="flex items-start gap-3">
                      <BookOpen className="size-5 text-blue-600 mt-1 shrink-0" />
                      <div>
                        <h4 className="mb-2">Story & Biography</h4>
                        <p className="text-gray-700 whitespace-pre-wrap">{person.biography}</p>
                      </div>
                    </div>
                  </Card>
                )}

                {/* Quick Info */}
                <div className="grid grid-cols-2 gap-4">
                  <InfoCard label="Full Name" value={person.name} />
                  <InfoCard label="Relation" value={person.relation} />
                  <InfoCard label="Gender" value={person.gender} className="capitalize" />
                  {person.dateOfBirth && <InfoCard label="Date of Birth" value={formatDate(person.dateOfBirth)} />}
                  {person.marriageDate && <InfoCard label="Marriage Date" value={person.marriageDate} />}
                  {person.bloodGroup && <InfoCard label="Blood Group" value={person.bloodGroup} />}
                </div>

                {person.notes && (
                  <div>
                    <h4 className="text-sm text-gray-500 mb-2">Additional Notes</h4>
                    <Card className="p-4 bg-gray-50">
                      <p className="text-gray-700 whitespace-pre-wrap">{person.notes}</p>
                    </Card>
                  </div>
                )}
              </TabsContent>

              {/* Personal Details Tab */}
              <TabsContent value="personal" className="space-y-6 mt-0">
                {/* Astrological Details */}
                <div>
                  <h3 className="mb-4 flex items-center gap-2">
                    <Star className="size-5 text-emerald-600" />
                    Astrological Details
                  </h3>
                  <div className="space-y-3">
                    {person.nakshatram && (
                      <Card className="p-4">
                        <div className="flex items-center gap-3">
                          <Star className="size-4 text-amber-500" />
                          <div className="flex-1">
                            <p className="text-xs text-gray-500">Nakshatram</p>
                            <p className="mt-1">{person.nakshatram}</p>
                          </div>
                        </div>
                      </Card>
                    )}
                    {person.moolaPadam && (
                      <Card className="p-4">
                        <div className="flex items-center gap-3">
                          <Activity className="size-4 text-purple-500" />
                          <div className="flex-1">
                            <p className="text-xs text-gray-500">Padam</p>
                            <p className="mt-1">{person.moolaPadam}</p>
                          </div>
                        </div>
                      </Card>
                    )}
                    {person.rasi && (
                      <Card className="p-4">
                        <div className="flex items-center gap-3">
                          <Circle className="size-4 text-blue-500" />
                          <div className="flex-1">
                            <p className="text-xs text-gray-500">Rasi</p>
                            <p className="mt-1">{person.rasi}</p>
                          </div>
                        </div>
                      </Card>
                    )}
                    {person.birthPlace && (
                      <Card className="p-4">
                        <div className="flex items-center gap-3">
                          <MapPin className="size-4 text-blue-500" />
                          <div className="flex-1">
                            <p className="text-xs text-gray-500">Birth Place</p>
                            <p className="mt-1">{person.birthPlace}</p>
                          </div>
                        </div>
                      </Card>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Physical Attributes */}
                <div>
                  <h3 className="mb-4 flex items-center gap-2">
                    <Ruler className="size-5 text-emerald-600" />
                    Physical Attributes
                  </h3>
                  <div className="space-y-3">
                    {person.height && (
                      <Card className="p-4">
                        <div className="flex items-center gap-3">
                          <Ruler className="size-4 text-teal-500" />
                          <div className="flex-1">
                            <p className="text-xs text-gray-500">Height</p>
                            <p className="mt-1">{person.height}</p>
                          </div>
                        </div>
                      </Card>
                    )}
                    {person.weight && (
                      <Card className="p-4">
                        <div className="flex items-center gap-3">
                          <WeightIcon className="size-4 text-green-500" />
                          <div className="flex-1">
                            <p className="text-xs text-gray-500">Weight</p>
                            <p className="mt-1">{person.weight}</p>
                          </div>
                        </div>
                      </Card>
                    )}
                    {person.bloodGroup && (
                      <Card className="p-4">
                        <div className="flex items-center gap-3">
                          <Droplet className="size-4 text-red-500" />
                          <div className="flex-1">
                            <p className="text-xs text-gray-500">Blood Group</p>
                            <p className="mt-1">{person.bloodGroup}</p>
                          </div>
                        </div>
                      </Card>
                    )}
                    {person.complexion && (
                      <Card className="p-4">
                        <div className="flex items-center gap-3">
                          <User className="size-4 text-orange-500" />
                          <div className="flex-1">
                            <p className="text-xs text-gray-500">Complexion</p>
                            <p className="mt-1">{person.complexion}</p>
                          </div>
                        </div>
                      </Card>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Important Dates */}
                <div>
                  <h3 className="mb-4 flex items-center gap-2">
                    <Heart className="size-5 text-emerald-600" />
                    Important Dates
                  </h3>
                  <div className="space-y-3">
                    {person.dateOfBirth && (
                      <Card className="p-4">
                        <div className="flex items-center gap-3">
                          <Calendar className="size-4 text-blue-500" />
                          <div className="flex-1">
                            <p className="text-xs text-gray-500">Date of Birth</p>
                            <p className="mt-1">{formatDate(person.dateOfBirth)}</p>
                          </div>
                        </div>
                      </Card>
                    )}
                    {person.marriageDate && (
                      <Card className="p-4">
                        <div className="flex items-center gap-3">
                          <Heart className="size-4 text-pink-500" />
                          <div className="flex-1">
                            <p className="text-xs text-gray-500">Marriage</p>
                            <p className="mt-1">{person.marriageDate}</p>
                          </div>
                        </div>
                      </Card>
                    )}
                  </div>
                </div>
              </TabsContent>

              {/* Education Tab */}
              <TabsContent value="education" className="space-y-4 mt-0">
                {person.education && person.education.length > 0 ? (
                  <div className="space-y-3">
                    {person.education.map((edu, index) => (
                      <Card key={index} className="p-5 hover:shadow-md transition-all border-l-4 border-l-blue-500">
                        <div className="flex items-start gap-4">
                          <div className="p-3 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50">
                            <GraduationCap className="size-6 text-blue-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <h4 className="flex-1">{edu.level}</h4>
                              <Badge variant="secondary" className="bg-blue-100 text-blue-700 shrink-0">
                                {edu.year}
                              </Badge>
                            </div>
                            <p className="text-gray-600 mb-3">{edu.institution}</p>
                            <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
                              {edu.status}
                            </Badge>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    icon={GraduationCap}
                    title="No education records"
                    description="Edit profile to add education details"
                  />
                )}
              </TabsContent>

              {/* Career Tab */}
              <TabsContent value="career" className="space-y-4 mt-0">
                {person.career && person.career.length > 0 ? (
                  <div className="space-y-3">
                    {person.career.map((job, index) => (
                      <Card key={index} className="p-5 hover:shadow-md transition-all border-l-4 border-l-purple-500">
                        <div className="flex items-start gap-4">
                          <div className="p-3 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50">
                            <Briefcase className="size-6 text-purple-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <h4 className="flex-1">{job.title}</h4>
                              <Badge variant="secondary" className="bg-purple-100 text-purple-700 shrink-0">
                                {job.period}
                              </Badge>
                            </div>
                            <p className="text-gray-600 mb-3">{job.company}</p>
                            {job.achievements && (
                              <div className="mt-3 p-3 rounded-lg bg-gray-50 border border-gray-100">
                                <p className="text-sm text-gray-700 leading-relaxed">{job.achievements}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    icon={Briefcase}
                    title="No career history"
                    description="Edit profile to add career details"
                  />
                )}
              </TabsContent>

              {/* Contact Tab */}
              <TabsContent value="contact" className="space-y-6 mt-0">
                {person.contact && (person.contact.phone || person.contact.email || person.contact.address) ? (
                  <>
                    {/* Contact Info */}
                    {(person.contact.phone || person.contact.email) && (
                      <div>
                        <h3 className="mb-4 flex items-center gap-2">
                          <Phone className="size-5 text-emerald-600" />
                          Contact Information
                        </h3>
                        <div className="space-y-3">
                          {person.contact.phone && (
                            <Card className="p-4">
                              <div className="flex items-center gap-3">
                                <Phone className="size-4 text-green-500" />
                                <div className="flex-1">
                                  <p className="text-xs text-gray-500">Phone</p>
                                  <p className="mt-1">{person.contact.phone}</p>
                                </div>
                              </div>
                            </Card>
                          )}
                          {person.contact.email && (
                            <Card className="p-4">
                              <div className="flex items-center gap-3">
                                <Mail className="size-4 text-blue-500" />
                                <div className="flex-1">
                                  <p className="text-xs text-gray-500">Email</p>
                                  <p className="mt-1">{person.contact.email}</p>
                                </div>
                              </div>
                            </Card>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Address */}
                    {person.contact.address && (
                      <>
                        {(person.contact.phone || person.contact.email) && <Separator />}
                        <div>
                          <h3 className="mb-4 flex items-center gap-2">
                            <Home className="size-5 text-emerald-600" />
                            Address
                          </h3>
                          <Card className="p-4">
                            <div className="flex items-start gap-3">
                              <MapPin className="size-4 text-red-500 mt-1" />
                              <div className="flex-1">
                                <p className="text-xs text-gray-500 mb-1">Location</p>
                                <p className="mb-2">{person.contact.address}</p>
                                {(person.contact.city || person.contact.state || person.contact.country) && (
                                  <p className="text-sm text-gray-600">
                                    {[person.contact.city, person.contact.state, person.contact.country]
                                      .filter(Boolean)
                                      .join(', ')}
                                  </p>
                                )}
                              </div>
                            </div>
                          </Card>
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <EmptyState
                    icon={MapPin}
                    title="No contact information"
                    description="Edit profile to add contact details"
                  />
                )}
              </TabsContent>

              {/* Media Tab */}
              <TabsContent value="media" className="space-y-6 mt-0">
                {/* Gallery */}
                <div>
                  <h3 className="mb-4 flex items-center gap-2">
                    <Image className="size-5 text-emerald-600" />
                    Photo Gallery
                  </h3>
                  {person.gallery && person.gallery.length > 0 ? (
                    <div className="grid grid-cols-2 gap-4">
                      {person.gallery.map((image, index) => (
                        <motion.img
                          key={index}
                          src={image}
                          alt={`Gallery ${index + 1}`}
                          className="rounded-xl object-cover aspect-square cursor-pointer hover:scale-105 transition-transform"
                          whileHover={{ scale: 1.05 }}
                        />
                      ))}
                    </div>
                  ) : (
                    <EmptyState
                      icon={Image}
                      title="No photos yet"
                      description="Edit profile to add photos to the gallery"
                      compact
                    />
                  )}
                </div>

                <Separator />

                {/* Documents */}
                <div>
                  <h3 className="mb-4 flex items-center gap-2">
                    <FileText className="size-5 text-emerald-600" />
                    Documents
                  </h3>
                  {person.documents && person.documents.length > 0 ? (
                    <div className="space-y-3">
                      {person.documents.map((doc, index) => (
                        <Card
                          key={index}
                          className="p-4 flex items-center gap-3 hover:shadow-md transition-shadow cursor-pointer"
                        >
                          <FileText className="size-5 text-gray-400" />
                          <div className="flex-1">
                            <p>{doc.name}</p>
                            <p className="text-sm text-gray-500">{doc.type}</p>
                          </div>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <EmptyState
                      icon={FileText}
                      title="No documents yet"
                      description="Edit profile to add documents"
                      compact
                    />
                  )}
                </div>

                {/* Timeline */}
                {person.timeline && person.timeline.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="mb-4 flex items-center gap-2">
                        <Calendar className="size-5 text-emerald-600" />
                        Life Timeline
                      </h3>
                      <div className="space-y-4">
                        {person.timeline.map((event, index) => (
                          <div key={index} className="flex gap-4">
                            <div className="flex flex-col items-center">
                              <div className="size-3 rounded-full bg-emerald-600" />
                              {index < person.timeline!.length - 1 && (
                                <div className="w-0.5 flex-1 bg-emerald-200 mt-1 min-h-[40px]" />
                              )}
                            </div>
                            <div className="flex-1 pb-4">
                              <p className="text-sm text-emerald-600">{event.year}</p>
                              <p className="mt-1 text-gray-700">{event.event}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </TabsContent>
            </Tabs>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function InfoCard({ label, value, className }: { label: string; value: string; className?: string }) {
  return (
    <Card className="p-3 bg-gray-50">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className={className}>{value}</p>
    </Card>
  );
}

function EmptyState({ 
  icon: Icon, 
  title, 
  description,
  compact = false 
}: { 
  icon: React.ElementType; 
  title: string; 
  description: string;
  compact?: boolean;
}) {
  return (
    <div className={`text-center ${compact ? 'py-8' : 'py-12'} text-gray-500`}>
      <Icon className={`${compact ? 'size-10' : 'size-12'} mx-auto mb-3 text-gray-400`} />
      <p>{title}</p>
      <p className="text-sm mt-1">{description}</p>
    </div>
  );
}