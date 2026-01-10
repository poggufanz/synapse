"use client";

import { useCallback, useState, useEffect } from "react";
import {
    ReactFlow,
    MiniMap,
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    addEdge,
    Connection,
    Edge,
    Node,
    BackgroundVariant,
    Panel,
    Handle,
    Position,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Plus, Trash2, Edit3, Link2, RotateCcw } from "lucide-react";
import { motion } from "framer-motion";

// localStorage keys
const STORAGE_KEY_NODES = "mindmap-nodes";
const STORAGE_KEY_EDGES = "mindmap-edges";

// Default edge style for new connections
const DEFAULT_EDGE_STYLE = {
    stroke: "#4facfe",
    strokeWidth: 2,
};

// Custom node types
interface ConceptNodeData {
    [key: string]: unknown;
    label: string;
    description?: string;
    type: "main" | "concept" | "detail";
    icon?: string;
}

// Custom node component with connection handles
function ConceptNode({ data, selected }: { data: ConceptNodeData; selected: boolean }) {
    const getNodeStyle = () => {
        switch (data.type) {
            case "main":
                return "bg-gradient-to-br from-blue-600 to-blue-800 border-blue-400 shadow-[0_0_25px_rgba(59,130,246,0.5)]";
            case "concept":
                return "bg-[#1a2332] border-[#232f48] hover:border-blue-500/50";
            case "detail":
                return "bg-[#1a2332]/80 border-[#232f48]/50 text-sm";
            default:
                return "bg-[#1a2332] border-[#232f48]";
        }
    };

    const getIconBg = () => {
        switch (data.type) {
            case "main":
                return "bg-white/20";
            case "concept":
                return "bg-blue-500/20";
            default:
                return "bg-[#232f48]";
        }
    };

    return (
        <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
                type: "spring",
                stiffness: 260,
                damping: 20,
                delay: Math.random() * 0.3 // Staggered entrance
            }}
            className={`
                px-4 py-3 rounded-2xl border-2 transition-all cursor-pointer relative max-w-[180px]
                ${getNodeStyle()}
                ${selected ? "ring-2 ring-blue-400 ring-offset-2 ring-offset-[#111722]" : ""}
            `}
        >
            {/* Connection Handles - visible dots for drag-to-connect */}
            <Handle
                type="target"
                position={Position.Top}
                className="!w-3 !h-3 !bg-blue-500 !border-2 !border-blue-300 hover:!bg-blue-400 transition-colors"
            />
            <Handle
                type="source"
                position={Position.Bottom}
                className="!w-3 !h-3 !bg-emerald-500 !border-2 !border-emerald-300 hover:!bg-emerald-400 transition-colors"
            />
            <Handle
                type="source"
                position={Position.Left}
                id="left"
                className="!w-3 !h-3 !bg-purple-500 !border-2 !border-purple-300 hover:!bg-purple-400 transition-colors"
            />
            <Handle
                type="source"
                position={Position.Right}
                id="right"
                className="!w-3 !h-3 !bg-orange-500 !border-2 !border-orange-300 hover:!bg-orange-400 transition-colors"
            />

            {data.icon && (
                <motion.div
                    initial={{ rotate: -180, scale: 0 }}
                    animate={{ rotate: 0, scale: 1 }}
                    transition={{ delay: 0.2, type: "spring" }}
                    className={`w-8 h-8 ${getIconBg()} rounded-lg flex items-center justify-center mb-2 mx-auto`}
                >
                    <span className="text-lg">{data.icon}</span>
                </motion.div>
            )}
            <h3 className={`font-bold text-center line-clamp-2 ${data.type === "main" ? "text-white text-base" : "text-white text-sm"}`}>
                {data.label}
            </h3>
            {data.description && (
                <p className={`text-center mt-1 line-clamp-1 ${data.type === "main" ? "text-blue-100 text-xs" : "text-[#92a4c9] text-[10px]"}`}>
                    {data.description}
                </p>
            )}
            {data.type === "main" && (
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.4, type: "spring" }}
                    className="absolute -top-2 -right-2 bg-blue-500 text-[8px] font-bold text-white px-1.5 py-0.5 rounded-full uppercase tracking-wider shadow-lg"
                >
                    Focus
                </motion.div>
            )}
        </motion.div>
    );
}

// Node types map
const nodeTypes = {
    concept: ConceptNode,
};

// Default nodes (used when no saved data exists)
const defaultNodes: Node<ConceptNodeData>[] = [
    {
        id: "1",
        type: "concept",
        position: { x: 400, y: 200 },
        data: { label: "Neural Networks", description: "Core Concept", type: "main", icon: "🧠" },
    },
    {
        id: "2",
        type: "concept",
        position: { x: 150, y: 100 },
        data: { label: "Perceptrons", description: "Basic unit", type: "concept", icon: "⚡" },
    },
    {
        id: "3",
        type: "concept",
        position: { x: 650, y: 100 },
        data: { label: "Backpropagation", description: "Learning algorithm", type: "concept", icon: "🔄" },
    },
    {
        id: "4",
        type: "concept",
        position: { x: 150, y: 350 },
        data: { label: "Activation Functions", description: "Non-linearity", type: "concept", icon: "📈" },
    },
    {
        id: "5",
        type: "concept",
        position: { x: 650, y: 350 },
        data: { label: "Deep Learning", description: "Multi-layer networks", type: "concept", icon: "🏗️" },
    },
    {
        id: "6",
        type: "concept",
        position: { x: 400, y: 450 },
        data: { label: "Training Data", type: "detail" },
    },
];

// Default edges
const defaultEdges: Edge[] = [
    { id: "e1-2", source: "1", target: "2", animated: true, style: { stroke: "#4facfe", strokeWidth: 2 } },
    { id: "e1-3", source: "1", target: "3", animated: true, style: { stroke: "#4facfe", strokeWidth: 2 } },
    { id: "e1-4", source: "1", target: "4", style: { stroke: "#353b4b", strokeWidth: 2, strokeDasharray: "5,5" } },
    { id: "e1-5", source: "1", target: "5", style: { stroke: "#353b4b", strokeWidth: 2 } },
    { id: "e5-6", source: "5", target: "6", style: { stroke: "#353b4b", strokeWidth: 1 } },
];

// Normalize edges to ensure they have proper styling
const normalizeEdges = (edges: Edge[]): Edge[] => {
    return edges.map((edge) => ({
        ...edge,
        animated: true,
        style: edge.style?.stroke ? edge.style : DEFAULT_EDGE_STYLE,
    }));
};

// Load from localStorage
const loadFromStorage = () => {
    if (typeof window === "undefined") return { nodes: defaultNodes, edges: defaultEdges };

    try {
        const savedNodes = localStorage.getItem(STORAGE_KEY_NODES);
        const savedEdges = localStorage.getItem(STORAGE_KEY_EDGES);

        const loadedEdges = savedEdges ? JSON.parse(savedEdges) : defaultEdges;

        return {
            nodes: savedNodes ? JSON.parse(savedNodes) : defaultNodes,
            edges: normalizeEdges(loadedEdges),
        };
    } catch {
        return { nodes: defaultNodes, edges: defaultEdges };
    }
};

interface MindMapCanvasProps {
    topic?: string;
    onNodeSelect?: (node: Node<ConceptNodeData> | null) => void;
}

export default function MindMapCanvas({ topic = "Neural Networks", onNodeSelect }: MindMapCanvasProps) {
    const [isLoaded, setIsLoaded] = useState(false);
    const [nodes, setNodes, onNodesChange] = useNodesState(defaultNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(defaultEdges);
    const [selectedNode, setSelectedNode] = useState<Node<ConceptNodeData> | null>(null);
    const [selectedNodeIds, setSelectedNodeIds] = useState<string[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editLabel, setEditLabel] = useState("");

    // Load from localStorage on mount
    useEffect(() => {
        const { nodes: savedNodes, edges: savedEdges } = loadFromStorage();
        setNodes(savedNodes);
        setEdges(savedEdges);
        setIsLoaded(true);
    }, [setNodes, setEdges]);

    // Save to localStorage when nodes/edges change
    useEffect(() => {
        if (!isLoaded) return;
        if (typeof window === "undefined") return;

        localStorage.setItem(STORAGE_KEY_NODES, JSON.stringify(nodes));
        localStorage.setItem(STORAGE_KEY_EDGES, JSON.stringify(edges));
    }, [nodes, edges, isLoaded]);

    // Drag-to-connect handler
    const onConnect = useCallback(
        (params: Connection) => {
            const newEdge = {
                ...params,
                id: `e-${params.source}-${params.target}-${Date.now()}`,
                style: { ...DEFAULT_EDGE_STYLE },
                animated: true,
            };
            setEdges((eds) => addEdge(newEdge, eds));
        },
        [setEdges]
    );

    // Node click - toggle selection for multi-select
    const onNodeClick = useCallback(
        (_: React.MouseEvent, node: Node) => {
            setSelectedNode(node as Node<ConceptNodeData>);
            onNodeSelect?.(node as Node<ConceptNodeData>);

            // Toggle selection for multi-select (hold node in selection)
            setSelectedNodeIds((prev) => {
                if (prev.includes(node.id)) {
                    return prev.filter((id) => id !== node.id);
                }
                // Keep max 2 nodes selected for connection
                if (prev.length >= 2) {
                    return [prev[1], node.id];
                }
                return [...prev, node.id];
            });
        },
        [onNodeSelect]
    );

    // Connect two selected nodes manually
    const connectSelectedNodes = useCallback(() => {
        if (selectedNodeIds.length !== 2) return;

        const [source, target] = selectedNodeIds;
        const edgeId = `e-${source}-${target}-${Date.now()}`;

        // Check if edge already exists
        const edgeExists = edges.some(
            (e) => (e.source === source && e.target === target) || (e.source === target && e.target === source)
        );

        if (!edgeExists) {
            setEdges((eds) => [
                ...eds,
                {
                    id: edgeId,
                    source,
                    target,
                    animated: true,
                    style: { stroke: "#4facfe", strokeWidth: 2 },
                },
            ]);
        }

        // Clear selection after connecting
        setSelectedNodeIds([]);
    }, [selectedNodeIds, edges, setEdges]);

    // Add new node
    const addNewNode = useCallback(() => {
        const newId = `node-${Date.now()}`;
        const newNode: Node<ConceptNodeData> = {
            id: newId,
            type: "concept",
            position: { x: Math.random() * 400 + 200, y: Math.random() * 300 + 150 },
            data: { label: "New Concept", description: "Click to edit", type: "concept", icon: "💡" },
        };
        setNodes((nds) => [...nds, newNode]);

        // Connect to main node if it exists
        if (nodes.length > 0) {
            const mainNode = nodes.find((n) => n.data.type === "main");
            if (mainNode) {
                setEdges((eds) => [
                    ...eds,
                    {
                        id: `e-${mainNode.id}-${newId}`,
                        source: mainNode.id,
                        target: newId,
                        style: { stroke: "#353b4b", strokeWidth: 2 },
                    },
                ]);
            }
        }
    }, [nodes, setNodes, setEdges]);

    // Delete selected node
    const deleteSelectedNode = useCallback(() => {
        if (selectedNode && selectedNode.data.type !== "main") {
            setNodes((nds) => nds.filter((n) => n.id !== selectedNode.id));
            setEdges((eds) => eds.filter((e) => e.source !== selectedNode.id && e.target !== selectedNode.id));
            setSelectedNode(null);
            setSelectedNodeIds((prev) => prev.filter((id) => id !== selectedNode.id));
            onNodeSelect?.(null);
        }
    }, [selectedNode, setNodes, setEdges, onNodeSelect]);

    // Clear multi-selection
    const clearSelection = useCallback(() => {
        setSelectedNodeIds([]);
    }, []);

    // Reset mind map to defaults (clear localStorage)
    const resetMindMap = useCallback(() => {
        if (typeof window !== "undefined") {
            localStorage.removeItem(STORAGE_KEY_NODES);
            localStorage.removeItem(STORAGE_KEY_EDGES);
        }
        setNodes(defaultNodes);
        setEdges(defaultEdges);
        setSelectedNode(null);
        setSelectedNodeIds([]);
    }, [setNodes, setEdges]);

    // AI Generate related concepts
    const aiGenerateConcepts = useCallback(async () => {
        setIsGenerating(true);
        try {
            const response = await fetch("/api/chat-productive", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: `Berikan 3 sub-konsep dari "${topic}" dalam format JSON array. Setiap item harus punya "label" (max 3 kata) dan "description" (max 5 kata). Contoh format: [{"label":"Gradient Descent","description":"Optimisasi neural network"}]. Hanya return JSON array, tanpa text lain.`,
                    studyMode: true,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                try {
                    // Try to parse the AI response as JSON
                    const conceptText = data.message.replace(/```json|```/g, "").trim();
                    const concepts = JSON.parse(conceptText);

                    if (Array.isArray(concepts)) {
                        concepts.forEach((concept: { label: string; description?: string }, index: number) => {
                            const newId = `ai-${Date.now()}-${index}`;
                            const icons = ["💡", "🔍", "📚", "⚡", "🎯", "🔧"];
                            // Truncate label and description if too long
                            const label = (concept.label || "Konsep").slice(0, 25);
                            const description = (concept.description || "AI Generated").slice(0, 30);
                            const newNode: Node<ConceptNodeData> = {
                                id: newId,
                                type: "concept",
                                position: {
                                    x: 200 + (index * 200),
                                    y: 100 + (index * 80)
                                },
                                data: {
                                    label,
                                    description,
                                    type: "concept",
                                    icon: icons[Math.floor(Math.random() * icons.length)]
                                },
                            };
                            setNodes((nds) => [...nds, newNode]);

                            // Connect to main node
                            const mainNode = nodes.find((n) => n.data.type === "main");
                            if (mainNode) {
                                setEdges((eds) => [
                                    ...eds,
                                    {
                                        id: `e-${mainNode.id}-${newId}`,
                                        source: mainNode.id,
                                        target: newId,
                                        animated: true,
                                        style: { stroke: "#4facfe", strokeWidth: 2 },
                                    },
                                ]);
                            }
                        });
                    }
                } catch {
                    // If parsing fails, just add a generic node
                    addNewNode();
                }
            }
        } catch (error) {
            console.error("AI generate error:", error);
        } finally {
            setIsGenerating(false);
        }
    }, [topic, nodes, setNodes, setEdges, addNewNode]);

    // Edit selected node
    const startEditNode = useCallback(() => {
        if (selectedNode) {
            setEditLabel(selectedNode.data.label);
            setIsEditing(true);
        }
    }, [selectedNode]);

    const saveEditNode = useCallback(() => {
        if (selectedNode && editLabel.trim()) {
            setNodes((nds) =>
                nds.map((n) =>
                    n.id === selectedNode.id
                        ? { ...n, data: { ...n.data, label: editLabel.trim() } }
                        : n
                )
            );
            setSelectedNode((prev) => prev ? { ...prev, data: { ...prev.data, label: editLabel.trim() } } : null);
        }
        setIsEditing(false);
    }, [selectedNode, editLabel, setNodes]);

    return (
        <div className="w-full h-full relative">
            {/* Background Pattern */}
            <div
                className="absolute inset-0 opacity-10 pointer-events-none"
                style={{ backgroundImage: "radial-gradient(#4facfe 1px, transparent 1px)", backgroundSize: "24px 24px" }}
            />

            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onNodeClick={onNodeClick}
                nodeTypes={nodeTypes}
                fitView
                attributionPosition="bottom-left"
                className="bg-transparent"
                proOptions={{ hideAttribution: true }}
                connectionLineStyle={{ stroke: "#4facfe", strokeWidth: 2 }}
                defaultEdgeOptions={{ style: { stroke: "#4facfe", strokeWidth: 2 }, animated: true }}
            >
                {/* Controls Panel */}
                <Panel position="top-right" className="flex gap-2 bg-[#1a2332]/80 backdrop-blur-sm p-2 rounded-xl border border-[#232f48]">
                    <button
                        onClick={addNewNode}
                        className="p-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-all flex items-center gap-2 text-sm font-medium"
                    >
                        <Plus size={16} />
                        Add Node
                    </button>

                    {/* Connect Button - visible when 2 nodes selected */}
                    {selectedNodeIds.length === 2 && (
                        <button
                            onClick={connectSelectedNodes}
                            className="p-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-all flex items-center gap-2 text-sm font-medium animate-pulse"
                        >
                            <Link2 size={16} />
                            Connect
                        </button>
                    )}

                    {selectedNodeIds.length > 0 && (
                        <button
                            onClick={clearSelection}
                            className="p-2 bg-[#232f48] hover:bg-[#353b4b] text-[#92a4c9] hover:text-white rounded-lg transition-all text-xs"
                        >
                            Clear ({selectedNodeIds.length})
                        </button>
                    )}

                    <button
                        onClick={deleteSelectedNode}
                        disabled={!selectedNode || selectedNode.data.type === "main"}
                        className="p-2 bg-[#232f48] hover:bg-red-500/20 text-[#92a4c9] hover:text-red-400 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Delete selected node"
                    >
                        <Trash2 size={16} />
                    </button>
                    <button
                        onClick={resetMindMap}
                        className="p-2 bg-[#232f48] hover:bg-orange-500/20 text-[#92a4c9] hover:text-orange-400 rounded-lg transition-all"
                        title="Reset to defaults"
                    >
                        <RotateCcw size={16} />
                    </button>
                </Panel>

                {/* Topic Header */}
                <Panel position="top-left" className="flex flex-col gap-2">
                    <div className="bg-[#1a2332]/80 backdrop-blur-sm px-4 py-3 rounded-xl border border-[#232f48]">
                        <div className="flex items-center gap-2 text-xs text-[#92a4c9] mb-1">
                            <span>Mind Map</span>
                            <span className="text-[#556987]">›</span>
                            <span className="text-blue-400">{topic}</span>
                        </div>
                        <h2 className="text-white font-bold text-lg">Visual Concept Explorer</h2>
                    </div>
                    <div className="flex items-center gap-2 bg-[#1a2332]/60 backdrop-blur-sm px-3 py-2 rounded-lg border border-[#232f48]/50">
                        <span className="text-[10px] text-blue-400 font-bold uppercase tracking-wider">Drag handles to connect</span>
                    </div>
                </Panel>

                {/* Selected Node Info */}
                {selectedNode && (
                    <Panel position="bottom-left" className="bg-[#1a2332]/80 backdrop-blur-sm p-4 rounded-xl border border-[#232f48] max-w-xs">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-[#556987] uppercase tracking-wider">Selected</span>
                            <button onClick={startEditNode} className="p-1 text-[#92a4c9] hover:text-white">
                                <Edit3 size={14} />
                            </button>
                        </div>
                        {isEditing ? (
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={editLabel}
                                    onChange={(e) => setEditLabel(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && saveEditNode()}
                                    className="flex-1 bg-[#111722] border border-[#232f48] rounded px-2 py-1 text-white text-sm focus:border-blue-500 outline-none"
                                    autoFocus
                                />
                                <button onClick={saveEditNode} className="px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-500">
                                    Save
                                </button>
                            </div>
                        ) : (
                            <h3 className="text-white font-bold">{selectedNode.data.label}</h3>
                        )}
                        {selectedNode.data.description && !isEditing && (
                            <p className="text-sm text-[#92a4c9] mt-1">{selectedNode.data.description}</p>
                        )}
                        <div className="mt-3 flex gap-2">
                            <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider ${selectedNode.data.type === "main"
                                ? "text-blue-400 bg-blue-500/20"
                                : selectedNode.data.type === "concept"
                                    ? "text-emerald-400 bg-emerald-500/20"
                                    : "text-[#92a4c9] bg-[#232f48]"
                                }`}>
                                {selectedNode.data.type}
                            </span>
                            {selectedNodeIds.includes(selectedNode.id) && (
                                <span className="text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider text-purple-400 bg-purple-500/20">
                                    Selected for connect
                                </span>
                            )}
                        </div>
                    </Panel>
                )}

                <Controls
                    className="bg-[#1a2332] border border-[#232f48] rounded-xl overflow-hidden"
                    showZoom={true}
                    showFitView={true}
                    showInteractive={false}
                />
                <MiniMap
                    className="bg-[#1a2332] border border-[#232f48] rounded-xl overflow-hidden"
                    nodeColor={(node) => {
                        const data = node.data as ConceptNodeData;
                        return data.type === "main" ? "#3b82f6" : "#232f48";
                    }}
                    maskColor="rgba(17, 23, 34, 0.8)"
                />
                <Background variant={BackgroundVariant.Dots} gap={24} size={1} color="#4facfe" className="opacity-10" />
            </ReactFlow>
        </div>
    );
}
