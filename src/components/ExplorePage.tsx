'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, ArrowLeft, Filter, UserCircle2 } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card } from './ui/card';
import { AppState } from '@/lib/state-context';
import { motion } from 'framer-motion';

interface Props {
  appState: AppState;
}

export default function ExplorePage({ appState }: Props) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRelation, setSelectedRelation] = useState<string>('all');
  const [selectedGeneration, setSelectedGeneration] = useState<string>('all');

  const filteredPeople = appState.familyTree.filter(person => {
    const matchesSearch = person.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRelation = selectedRelation === 'all' || person.relation === selectedRelation;
    const matchesGeneration = selectedGeneration === 'all' || person.generation.toString() === selectedGeneration;
    return matchesSearch && matchesRelation && matchesGeneration;
  });

  const relations = Array.from(new Set(appState.familyTree.map(p => p.relation)));
  const generations = Array.from(new Set(appState.familyTree.map(p => p.generation))).sort((a, b) => a - b);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      {/* Header */}
      <header className="bg-white border-b px-4 py-3 flex items-center gap-3 sticky top-0 z-30">
        <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard')}>
          <ArrowLeft className="size-5" />
        </Button>
        <div>
          <h1 className="text-lg md:text-xl">Explore Family</h1>
          <p className="text-xs text-gray-500">{filteredPeople.length} members</p>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Search and Filters */}
        <Card className="p-6 mb-6 bg-white">
          <div className="flex flex-col gap-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name or relation..."
                className="pl-10 text-lg"
              />
            </div>

            {/* Filters */}
            <div className="flex gap-3 flex-wrap items-center">
              <div className="flex items-center gap-2">
                <Filter className="size-4 text-gray-500" />
                <span className="text-sm text-gray-600">Filters:</span>
              </div>

              <Select value={selectedGeneration} onValueChange={setSelectedGeneration}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Generations" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Generations</SelectItem>
                  {generations.map(generation => (
                    <SelectItem key={generation} value={generation.toString()}>
                      {generation === 0 ? 'Self' : generation > 0 ? `${generation} Generation` : `${Math.abs(generation)} Generation`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedRelation} onValueChange={setSelectedRelation}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Relations" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Relations</SelectItem>
                  {relations.map((relation) => (
                    <SelectItem key={relation} value={relation}>
                      {relation}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {(searchQuery || selectedGeneration !== 'all' || selectedRelation !== 'all') && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedGeneration('all');
                    setSelectedRelation('all');
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </div>
          </div>
        </Card>

        {/* Results */}
        <div className="mb-4">
          <p className="text-gray-600">
            Found {filteredPeople.length} {filteredPeople.length === 1 ? 'person' : 'people'}
          </p>
        </div>

        {filteredPeople.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredPeople.map((person, index) => (
              <motion.div
                key={person.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Card className="p-4 hover:shadow-lg transition-shadow cursor-pointer bg-white">
                  <div className="flex flex-col items-center text-center">
                    {person.photo ? (
                      <img
                        src={person.photo}
                        alt={person.name}
                        className="size-24 rounded-full object-cover mb-3 border-2 border-gray-100"
                      />
                    ) : (
                      <div className="size-24 rounded-full bg-gray-100 flex items-center justify-center mb-3 border-2 border-gray-200">
                        <UserCircle2 className="size-12 text-gray-400" />
                      </div>
                    )}
                    <h3 className="mb-1">{person.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">{person.relation}</p>
                    {(person.birthYear || person.deathYear) && (
                      <p className="text-xs text-gray-500">
                        {person.birthYear && <span>{person.birthYear}</span>}
                        {person.birthYear && person.deathYear && <span> - </span>}
                        {person.deathYear && <span>{person.deathYear}</span>}
                      </p>
                    )}
                    <div className="mt-2">
                      <span className="inline-block px-2 py-1 text-xs rounded-full bg-emerald-100 text-emerald-700">
                        Gen {Math.abs(person.generation)}
                      </span>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center bg-white">
            <Search className="size-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl mb-2">No Results Found</h3>
            <p className="text-gray-600">
              Try adjusting your search query or filters
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}