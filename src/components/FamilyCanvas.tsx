'use client';

import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { ZoomIn, ZoomOut, Maximize } from 'lucide-react';
import { Button } from './ui/button';
import TreeNodeCard from './TreeNodeCard';
import { Person } from '@/lib/state-context';

interface Props {
  familyTree: Person[];
  theme: 'classic' | 'modern' | 'colorful';
  onNodeClick: (person: Person) => void;
  onEditPerson: (person: Person) => void;
  familyName?: string;
}

export default function FamilyCanvas({ familyTree, theme, onNodeClick, onEditPerson, familyName = 'Our' }: Props) {
  // Organize people by generation (ancestors at top, descendants at bottom)
  const generations = familyTree.reduce((acc, person) => {
    if (!acc[person.generation]) {
      acc[person.generation] = [];
    }
    acc[person.generation].push(person);
    return acc;
  }, {} as Record<number, Person[]>);

  // Sort from ancestors (negative) to descendants (positive) - REVERSED ORDER
  const sortedGenerations = Object.entries(generations).sort(([a], [b]) => Number(a) - Number(b));

  // Get generation label
  const getGenerationLabel = (generation: number) => {
    if (generation === 0) return '';
    if (generation === -1) return 'PARENTS';
    if (generation === 1) return 'CHILDREN';
    if (generation === -2) return 'GRANDPARENTS';
    if (generation === 2) return 'GRANDCHILDREN';
    if (generation < -2) return 'ANCESTORS';
    return 'DESCENDANTS';
  };

  return (
    <div className="w-full h-full relative bg-transparent">
      <TransformWrapper
        initialScale={1}
        minScale={0.3}
        maxScale={2}
        centerOnInit
      >
        {({ zoomIn, zoomOut, resetTransform }) => (
          <>
            {/* Zoom Controls */}
            <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
              <Button
                onClick={() => zoomIn()}
                size="sm"
                variant="secondary"
                className="bg-card/80 backdrop-blur-sm shadow-lg border border-border/50"
              >
                <ZoomIn className="size-4" />
              </Button>
              <Button
                onClick={() => zoomOut()}
                size="sm"
                variant="secondary"
                className="bg-card/80 backdrop-blur-sm shadow-lg border border-border/50"
              >
                <ZoomOut className="size-4" />
              </Button>
              <Button
                onClick={() => resetTransform()}
                size="sm"
                variant="secondary"
                className="bg-card/80 backdrop-blur-sm shadow-lg border border-border/50"
              >
                <Maximize className="size-4" />
              </Button>
            </div>

            <TransformComponent
              wrapperStyle={{ width: '100%', height: '100%' }}
              contentStyle={{ width: '100%', height: '100%' }}
            >
              <div className="family-canvas-content min-w-full min-h-full flex flex-col items-center p-12">
                {familyTree.length === 0 ? (
                  <div className="text-center mt-20">
                    <p className="text-xl text-muted-foreground mb-2">Your family tree is empty</p>
                    <p className="text-muted-foreground">Click the + button to add your first person</p>
                  </div>
                ) : (
                  <>
                    {/* Family Tree */}
                    <div className="flex flex-col items-center">
                      {sortedGenerations.map(([generation, people], index) => (
                        <div key={generation} className="flex flex-col items-center">
                          {/* Generation Row */}
                          <div className="flex gap-8 justify-center mb-8">
                            {people.map((person) => (
                              <div key={person.id} className="relative">
                                <TreeNodeCard
                                  person={person}
                                  theme={theme}
                                  onClick={() => onNodeClick(person)}
                                  onEdit={() => onEditPerson(person)}
                                />
                              </div>
                            ))}
                          </div>

                          {/* Connector Lines and Label */}
                          {index < sortedGenerations.length - 1 && (
                            <div className="flex flex-col items-center mb-4">
                              {/* Generation Label */}
                              {getGenerationLabel(Number(sortedGenerations[index + 1][0])) && (
                                <div className="text-xs text-muted-foreground uppercase tracking-wider mb-6 mt-4">
                                  {getGenerationLabel(Number(sortedGenerations[index + 1][0]))}
                                </div>
                              )}
                              
                              {/* Vertical Connector Lines */}
                              <div className="flex gap-8 justify-center mb-8">
                                {people.map((person) => {
                                  const hasChildren = familyTree.some(p => p.parentId === person.id);
                                  return (
                                    <div key={person.id} className="w-48 flex justify-center">
                                      {hasChildren && (
                                        <div className="w-[2px] h-20 bg-[#94A3B8]" />
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </TransformComponent>
          </>
        )}
      </TransformWrapper>
    </div>
  );
}