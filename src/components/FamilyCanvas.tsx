'use client';

import { useMemo, useRef, useEffect } from 'react';
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

interface TreeNode {
  person: Person;
  children: TreeNode[];
  spouse: TreeNode | null;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface LineConnection {
  from: { x: number; y: number };
  to: { x: number; y: number };
  type: 'parent-child' | 'spouse';
}

const NODE_WIDTH = 192; // Width of TreeNodeCard
const NODE_HEIGHT = 240; // Approximate height of TreeNodeCard
const HORIZONTAL_SPACING = 80; // Space between nodes horizontally
const VERTICAL_SPACING = 120; // Space between generations (increased for labels)
const SPOUSE_SPACING = 40; // Space between spouses
const GENERATION_LABEL_HEIGHT = 40; // Space for generation labels

export default function FamilyCanvas({ familyTree, theme, onNodeClick, onEditPerson, familyName = 'Our' }: Props) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  // Build tree structure from relationships
  const treeStructure = useMemo(() => {
    if (familyTree.length === 0) return null;

    const personMap = new Map<string, Person>();
    familyTree.forEach(person => personMap.set(person.id, person));

    // Create a map of all tree nodes first (without spouse links)
    const nodeMap = new Map<string, TreeNode>();
    familyTree.forEach(person => {
      nodeMap.set(person.id, {
        person,
        children: [],
        spouse: null,
        x: 0,
        y: 0,
        width: NODE_WIDTH,
        height: NODE_HEIGHT,
      });
    });

    // Build parent-child relationships
    familyTree.forEach(person => {
      const node = nodeMap.get(person.id)!;
      if (person.parentId) {
        const parentNode = nodeMap.get(person.parentId);
        if (parentNode) {
          parentNode.children.push(node);
        }
      }
    });

    // Link spouses (bidirectional)
    familyTree.forEach(person => {
      const node = nodeMap.get(person.id)!;
      if (person.spouseId) {
        const spouseNode = nodeMap.get(person.spouseId);
        if (spouseNode) {
          node.spouse = spouseNode;
          // Ensure bidirectional link
          if (!spouseNode.spouse || spouseNode.spouse.person.id !== person.id) {
            spouseNode.spouse = node;
          }
        }
      }
    });

    // Find root nodes (people without parents, or use generation 0 as root)
    let rootNodes = Array.from(nodeMap.values()).filter(node => !node.person.parentId || node.person.generation === 0);
    
    if (rootNodes.length === 0 && nodeMap.size > 0) {
      // If no root found, use the first person
      rootNodes = [Array.from(nodeMap.values())[0]];
    }

    // Remove nodes that are children of other nodes from root list
    const allChildren = new Set<string>();
    const collectChildren = (nodes: TreeNode[]) => {
      nodes.forEach(node => {
        node.children.forEach(child => {
          allChildren.add(child.person.id);
          collectChildren([child]);
        });
      });
    };
    collectChildren(rootNodes);
    rootNodes = rootNodes.filter(node => !allChildren.has(node.person.id));

    // Handle remaining orphan nodes
    const processed = new Set<string>();
    const markProcessed = (nodes: TreeNode[]) => {
      nodes.forEach(node => {
        processed.add(node.person.id);
        if (node.spouse) processed.add(node.spouse.person.id);
        markProcessed(node.children);
      });
    };
    markProcessed(rootNodes);

    // Add any remaining unprocessed nodes as separate roots
    nodeMap.forEach((node, id) => {
      if (!processed.has(id)) {
        rootNodes.push(node);
      }
    });

    return rootNodes.length > 0 ? rootNodes : null;
  }, [familyTree]);

  // Calculate positions for all nodes
  const positionedTree = useMemo(() => {
    if (!treeStructure) return null;

    const positioned = new Set<string>();

    const positionNode = (node: TreeNode, x: number, y: number): number => {
      // Skip if already positioned (to avoid positioning spouse twice)
      if (positioned.has(node.person.id)) {
        return x;
      }

      node.x = x;
      node.y = y;
      positioned.add(node.person.id);

      let rightmostX = x + NODE_WIDTH;

      // Position spouse next to this node if exists and not already positioned
      if (node.spouse && !positioned.has(node.spouse.person.id)) {
        node.spouse.x = x + NODE_WIDTH + SPOUSE_SPACING;
        node.spouse.y = y;
        positioned.add(node.spouse.person.id);
        rightmostX = node.spouse.x + NODE_WIDTH;
      }

      // Position children below
      if (node.children.length > 0) {
        const childY = y + NODE_HEIGHT + VERTICAL_SPACING;
        
        // Calculate center point for children
        let childrenCenterX: number;
        if (node.spouse && positioned.has(node.spouse.person.id)) {
          // Center children between both parents
          childrenCenterX = (node.x + node.spouse.x + NODE_WIDTH) / 2;
        } else {
          // Center children below this node
          childrenCenterX = node.x + NODE_WIDTH / 2;
        }

        // Calculate starting x for children (centered)
        const totalChildrenWidth = node.children.length * NODE_WIDTH + (node.children.length - 1) * HORIZONTAL_SPACING;
        let childStartX = childrenCenterX - totalChildrenWidth / 2;

        // Position each child
        node.children.forEach((child) => {
          // Skip children that share a parent with another child (siblings)
          // Position all children
          const childRightmost = positionNode(child, childStartX, childY);
          rightmostX = Math.max(rightmostX, childRightmost);
          childStartX += NODE_WIDTH + HORIZONTAL_SPACING;
        });
      }

      return rightmostX;
    };

    // Position all root nodes
    let startX = 100; // Start with some margin
    treeStructure.forEach((root) => {
      startX = positionNode(root, startX, 100) + HORIZONTAL_SPACING * 2;
    });

    return treeStructure;
  }, [treeStructure]);

  // Generate connection lines
  const connections = useMemo(() => {
    if (!positionedTree) return [];

    const lines: LineConnection[] = [];
    const drawnSpousePairs = new Set<string>();

    const collectConnections = (nodes: TreeNode[]) => {
      nodes.forEach(node => {
        // Draw line to spouse (only once per pair)
        if (node.spouse) {
          const pairId = [node.person.id, node.spouse.person.id].sort().join('-');
          if (!drawnSpousePairs.has(pairId)) {
            const nodeCenterX = node.x + NODE_WIDTH / 2;
            const nodeCenterY = node.y + NODE_HEIGHT / 2;
            const spouseCenterX = node.spouse.x + NODE_WIDTH / 2;
            const spouseCenterY = node.spouse.y + NODE_HEIGHT / 2;

            lines.push({
              from: { x: nodeCenterX, y: nodeCenterY },
              to: { x: spouseCenterX, y: spouseCenterY },
              type: 'spouse',
            });
            drawnSpousePairs.add(pairId);
          }
        }

        // Draw lines to children
        if (node.children.length > 0) {
          // Calculate the center point between parents (if spouse exists) or just this node
          let parentCenterX: number;
          if (node.spouse) {
            parentCenterX = (node.x + node.spouse.x + NODE_WIDTH) / 2;
          } else {
            parentCenterX = node.x + NODE_WIDTH / 2;
          }
          
          const parentBottomY = node.y + NODE_HEIGHT;
          const childTopY = node.children[0].y;
          const verticalLineY = childTopY - 20; // Stop a bit before children

          // Vertical line from parent(s) down
          lines.push({
            from: { x: parentCenterX, y: parentBottomY },
            to: { x: parentCenterX, y: verticalLineY },
            type: 'parent-child',
          });

          // Horizontal line connecting all children
          if (node.children.length > 1) {
            const firstChildCenterX = node.children[0].x + NODE_WIDTH / 2;
            const lastChildCenterX = node.children[node.children.length - 1].x + NODE_WIDTH / 2;

            lines.push({
              from: { x: firstChildCenterX, y: verticalLineY },
              to: { x: lastChildCenterX, y: verticalLineY },
              type: 'parent-child',
            });
          }

          // Vertical lines from horizontal line to each child
          node.children.forEach(child => {
            const childCenterX = child.x + NODE_WIDTH / 2;
            lines.push({
              from: { x: childCenterX, y: verticalLineY },
              to: { x: childCenterX, y: child.y },
              type: 'parent-child',
            });
          });
        }

        // Recursively process children (don't process spouse separately to avoid duplicates)
        collectConnections(node.children);
      });
    };

    collectConnections(positionedTree);
    return lines;
  }, [positionedTree]);

  // Get all nodes flattened for rendering (avoid duplicates)
  const allNodes = useMemo(() => {
    if (!positionedTree) return [];

    const nodes: TreeNode[] = [];
    const seen = new Set<string>();
    
    const collectNodes = (treeNodes: TreeNode[]) => {
      treeNodes.forEach(node => {
        if (!seen.has(node.person.id)) {
          nodes.push(node);
          seen.add(node.person.id);
        }
        // Add spouse if not already added
        if (node.spouse && !seen.has(node.spouse.person.id)) {
          nodes.push(node.spouse);
          seen.add(node.spouse.person.id);
        }
        collectNodes(node.children);
      });
    };
    collectNodes(positionedTree);
    return nodes;
  }, [positionedTree]);

  // Calculate canvas dimensions
  const canvasDimensions = useMemo(() => {
    if (allNodes.length === 0) return { width: 800, height: 600 };

    const maxX = Math.max(...allNodes.map(n => n.x + n.width), 0);
    const maxY = Math.max(...allNodes.map(n => n.y + n.height), 0);

    return {
      width: Math.max(maxX + 200, 800),
      height: Math.max(maxY + 200, 600),
    };
  }, [allNodes]);

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

  // Group nodes by Y position (generation level) for labels
  const nodesByGeneration = useMemo(() => {
    if (!allNodes.length) return new Map<number, TreeNode[]>();
    
    const grouped = new Map<number, TreeNode[]>();
    allNodes.forEach(node => {
      const y = node.y;
      if (!grouped.has(y)) {
        grouped.set(y, []);
      }
      grouped.get(y)!.push(node);
    });
    
    return grouped;
  }, [allNodes]);

  // Get generation labels with their Y positions
  const generationLabels = useMemo(() => {
    const labels: Array<{ y: number; label: string; generation: number }> = [];
    const processedY = new Set<number>();
    
    // Sort by Y position (top to bottom)
    const sortedYPositions = Array.from(nodesByGeneration.keys()).sort((a, b) => a - b);
    
    sortedYPositions.forEach(y => {
      if (processedY.has(y)) return;
      
      const nodesAtY = nodesByGeneration.get(y)!;
      if (nodesAtY.length > 0) {
        // Use the generation from the first node at this Y level
        const generation = nodesAtY[0].person.generation;
        const label = getGenerationLabel(generation);
        
        if (label) {
          labels.push({ y, label, generation });
        }
        processedY.add(y);
      }
    });
    
    return labels;
  }, [nodesByGeneration]);

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
              <div 
                ref={canvasRef}
                className="family-canvas-content relative"
                style={{ 
                  width: `${canvasDimensions.width}px`, 
                  height: `${canvasDimensions.height}px`,
                  minWidth: '100%',
                  minHeight: '100%',
                }}
              >
                {familyTree.length === 0 ? (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                    <p className="text-xl text-muted-foreground mb-2">Your family tree is empty</p>
                    <p className="text-muted-foreground">Click the + button to add your first person</p>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* SVG for connection lines */}
                    <svg
                      className="absolute inset-0 pointer-events-none"
                      style={{ width: '100%', height: '100%' }}
                    >
                      {connections.map((line, index) => (
                        <line
                          key={index}
                          x1={line.from.x}
                          y1={line.from.y}
                          x2={line.to.x}
                          y2={line.to.y}
                          stroke={line.type === 'spouse' ? '#94A3B8' : '#64748B'}
                          strokeWidth={line.type === 'spouse' ? 1.5 : 2}
                          strokeDasharray={line.type === 'spouse' ? '4,4' : '0'}
                          strokeLinecap="round"
                        />
                      ))}
                    </svg>

                    {/* Generation Labels */}
                    {generationLabels.map(({ y, label, generation }) => {
                      // Find the center X position of nodes at this Y level
                      const nodesAtY = nodesByGeneration.get(y) || [];
                      if (nodesAtY.length === 0) return null;
                      
                      const minX = Math.min(...nodesAtY.map(n => n.x));
                      const maxX = Math.max(...nodesAtY.map(n => n.x + n.width));
                      const centerX = (minX + maxX) / 2;
                      
                      return (
                        <div
                          key={`label-${y}-${generation}`}
                          className="absolute pointer-events-none"
                          style={{
                            left: `${centerX}px`,
                            top: `${y - 40}px`,
                            transform: 'translateX(-50%)',
                          }}
                        >
                          <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold whitespace-nowrap">
                            {label}
                          </div>
                                    </div>
                                  );
                                })}

                    {/* Render all nodes */}
                    {allNodes.map((node) => (
                      <div
                        key={node.person.id}
                        ref={(el) => {
                          if (el) nodeRefs.current.set(node.person.id, el);
                        }}
                        className="absolute"
                        style={{
                          left: `${node.x}px`,
                          top: `${node.y}px`,
                        }}
                      >
                        <TreeNodeCard
                          person={node.person}
                          theme={theme}
                          onClick={() => onNodeClick(node.person)}
                          onEdit={() => onEditPerson(node.person)}
                        />
                        </div>
                      ))}
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
