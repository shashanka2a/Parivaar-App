'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Edit2, User, BookOpen, GraduationCap, Briefcase, MapPin, Phone, Image, FileText, Heart, Calendar, Ruler, Droplet, Users, Mail, Home, Star, Circle, Weight as WeightIcon, Activity } from 'lucide-react';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Card } from './ui/card';
import { Separator } from './ui/separator';
import { Badge } from './ui/badge';
import { Person } from '@/lib/state-context';

interface Props {
  open: boolean;
  onClose: () => void;
  person: Person | null;
  onEdit: (person: Person) => void;
}

export default function ProfileDrawer({ open, onClose, person, onEdit }: Props) {
  if (!person) return null;

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

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full md:w-[600px] bg-white shadow-2xl z-50 overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 bg-card border-b px-6 py-4 flex items-center justify-between z-10">
              <h2 className="text-xl">Profile Details</h2>
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
            <div className="p-6 border-b bg-gradient-to-br from-[#E9F5E2] to-[#C7E9C0]/30">
              <div className="flex flex-col items-center text-center">
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
                <h3 className="text-2xl mb-1" style={{ fontWeight: 600 }}>{person.name}</h3>
                <p className="text-secondary-foreground text-sm mb-2 px-3 py-1 bg-secondary rounded-full inline-block">{person.relation}</p>
                {person.dateOfBirth && (
                  <p className="text-sm text-muted-foreground mb-1">
                    Born: {person.dateOfBirth}
                  </p>
                )}
                {(person.birthYear || person.deathYear) && !person.dateOfBirth && (
                  <p className="text-sm text-muted-foreground">
                    {person.birthYear && <span>{person.birthYear}</span>}
                    {person.birthYear && person.deathYear && <span> - </span>}
                    {person.deathYear && <span>{person.deathYear}</span>}
                  </p>
                )}
              </div>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="overview" className="p-4">
              <TabsList className="grid w-full grid-cols-6 mb-6 h-auto p-1.5">
                <TabsTrigger value="overview" className="py-2.5 px-3">
                  <User className="size-4 md:mr-2" />
                  <span className="hidden md:inline">Overview</span>
                </TabsTrigger>
                <TabsTrigger value="personal" className="py-2.5 px-3">
                  <Heart className="size-4 md:mr-2" />
                  <span className="hidden md:inline">Personal</span>
                </TabsTrigger>
                <TabsTrigger value="education" className="py-2.5 px-3">
                  <GraduationCap className="size-4 md:mr-2" />
                  <span className="hidden md:inline">Education</span>
                </TabsTrigger>
                <TabsTrigger value="career" className="py-2.5 px-3">
                  <Briefcase className="size-4 md:mr-2" />
                  <span className="hidden md:inline">Career</span>
                </TabsTrigger>
                <TabsTrigger value="contact" className="py-2.5 px-3">
                  <MapPin className="size-4 md:mr-2" />
                  <span className="hidden md:inline">Contact</span>
                </TabsTrigger>
                <TabsTrigger value="media" className="py-2.5 px-3">
                  <Image className="size-4 md:mr-2" />
                  <span className="hidden md:inline">Media</span>
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
                  {person.dateOfBirth && <InfoCard label="Date of Birth" value={person.dateOfBirth} />}
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
                            <p className="text-xs text-gray-500">Moola Padam</p>
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
                    {person.janmaRasi && (
                      <Card className="p-4">
                        <div className="flex items-center gap-3">
                          <Circle className="size-4 text-indigo-500" />
                          <div className="flex-1">
                            <p className="text-xs text-gray-500">Janma Rasi</p>
                            <p className="mt-1">{person.janmaRasi}</p>
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
                            <p className="mt-1">{person.dateOfBirth}</p>
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
                    {person.birthYear && !person.dateOfBirth && (
                      <Card className="p-4">
                        <div className="flex items-center gap-3">
                          <Calendar className="size-4 text-blue-500" />
                          <div className="flex-1">
                            <p className="text-xs text-gray-500">Birth Year</p>
                            <p className="mt-1">{person.birthYear}</p>
                          </div>
                        </div>
                      </Card>
                    )}
                    {person.deathYear && (
                      <Card className="p-4">
                        <div className="flex items-center gap-3">
                          <Calendar className="size-4 text-gray-500" />
                          <div className="flex-1">
                            <p className="text-xs text-gray-500">Death Year</p>
                            <p className="mt-1">{person.deathYear}</p>
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