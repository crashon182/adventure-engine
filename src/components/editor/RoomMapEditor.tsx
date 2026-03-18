'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import ReactFlow, {
    Controls,
    Background,
    MiniMap,
    ReactFlowProvider,
    Panel,
    Connection,
    Edge,
    Node,
    addEdge,
} from 'reactflow';
import 'reactflow/dist/style.css';

import { useMapStore } from '@/lib/store/useMapStore';
import RoomNode from './map/RoomNode';
import DraggableRoomList from './map/DraggableRoomList';
import EdgePropertiesPanel from './map/EdgePropertiesPanel';
import NodePropertiesPanel from './map/NodePropertiesPanel';
import { Save, Loader2, MousePointer2 } from 'lucide-react';

const nodeTypes = {
    room: RoomNode,
};

interface RoomMapEditorProps {
    projectId: string;
}

export default function RoomMapEditor({ projectId }: RoomMapEditorProps) {
    const {
        nodes,
        edges,
        onNodesChange,
        onEdgesChange,
        onConnect,
        setNodes,
        setEdges,
        updateNodePosition,
        addNode
    } = useMapStore();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [rooms, setRooms] = useState<any[]>([]);
    const [items, setItems] = useState<any[]>([]);
    const [selectedElement, setSelectedElement] = useState<any>(null);
    const reactFlowWrapper = useRef<HTMLDivElement>(null);
    const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);

    useEffect(() => {
        fetchData();
    }, [projectId]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [roomsRes, connectionsRes, itemsRes] = await Promise.all([
                fetch(`/api/projects/${projectId}/rooms`),
                fetch(`/api/projects/${projectId}/connections`),
                fetch(`/api/projects/${projectId}/items`)
            ]);

            const roomsData = await roomsRes.json();
            const connectionsData = await connectionsRes.json();
            const itemsData = await itemsRes.json();

            setRooms(roomsData);
            setItems(itemsData);

            // Filter rooms that have map positions
            const mapNodes = roomsData
                .filter((r: any) => r.x !== 0 || r.y !== 0)
                .map((r: any) => ({
                    id: r.id,
                    type: 'room',
                    position: { x: r.x, y: r.y },
                    data: {
                        name: r.name,
                        projectId,
                        id: r.id,
                        backgroundImage: r.bgImage?.url
                    },
                }));

            const mapEdges = connectionsData.map((c: any) => ({
                id: c.id,
                source: c.fromRoomId,
                target: c.toRoomId,
                data: {
                    direction: c.direction,
                    locked: c.locked,
                    requiredItemId: c.requiredItemId,
                    scriptEvent: c.scriptEvent,
                },
                label: c.direction,
                animated: c.locked,
                style: { stroke: c.locked ? '#f59e0b' : '#3b82f6' }
            }));

            setNodes(mapNodes);
            setEdges(mapEdges);
        } catch (error) {
            console.error('Failed to fetch map data:', error);
        } finally {
            setLoading(false);
        }
    };

    const onSave = async () => {
        setSaving(true);
        try {
            // Save node positions
            await Promise.all(nodes.map(node =>
                fetch(`/api/rooms/${node.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ x: node.position.x, y: node.position.y })
                })
            ));

            // Save connections (Simplified: just sync all)
            // In a real app, we'd only sync changes. Here we'll just handle creations/updates in realtime or via this button.
            // For now, let's assume positions are the main thing being batch saved.
        } catch (error) {
            console.error('Failed to save map:', error);
        } finally {
            setSaving(false);
        }
    };

    const onNodeClick = (_: any, node: Node) => {
        setSelectedElement({ type: 'node', ...node });
    };

    const onEdgeClick = (_: any, edge: Edge) => {
        setSelectedElement({ type: 'edge', ...edge });
    };

    const onPaneClick = () => {
        setSelectedElement(null);
    };

    const onConnectHandler = useCallback(async (params: Connection) => {
        const res = await fetch(`/api/projects/${projectId}/connections`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                fromRoomId: params.source,
                toRoomId: params.target,
            })
        });

        if (res.ok) {
            const newConn = await res.json();
            const newEdge = {
                id: newConn.id,
                source: params.source!,
                target: params.target!,
                data: { locked: false },
                style: { stroke: '#3b82f6' }
            };
            setEdges(addEdge(newEdge, edges));
        }
    }, [projectId, edges]);

    const onEdgeUpdate = async (edgeId: string, data: any) => {
        const res = await fetch(`/api/projects/${projectId}/connections/${edgeId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (res.ok) {
            setEdges(edges.map(e => e.id === edgeId ? {
                ...e,
                data,
                label: data.direction,
                animated: data.locked,
                style: { stroke: data.locked ? '#f59e0b' : '#3b82f6' }
            } : e));
        }
    };

    const onEdgeDelete = async (edgeId: string) => {
        const res = await fetch(`/api/projects/${projectId}/connections/${edgeId}`, {
            method: 'DELETE'
        });

        if (res.ok) {
            setEdges(edges.filter(e => e.id !== edgeId));
            setSelectedElement(null);
        }
    };

    const onDragOver = useCallback((event: React.DragEvent) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    const onDrop = useCallback(
        (event: React.DragEvent) => {
            event.preventDefault();

            if (!reactFlowWrapper.current || !reactFlowInstance) return;

            const roomData = JSON.parse(event.dataTransfer.getData('application/reactflow'));
            if (nodes.some(n => n.id === roomData.id)) return;

            const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
            const position = reactFlowInstance.project({
                x: event.clientX - reactFlowBounds.left,
                y: event.clientY - reactFlowBounds.top,
            });

            const newNode = {
                id: roomData.id,
                type: 'room',
                position,
                data: {
                    name: roomData.name,
                    projectId,
                    id: roomData.id,
                    backgroundImage: roomData.bgImage?.url
                },
            };

            addNode(newNode);
        },
        [reactFlowInstance, nodes, projectId]
    );

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="flex-1 flex h-full overflow-hidden bg-gray-950">
            <DraggableRoomList rooms={rooms.filter(r => !nodes.some(n => n.id === r.id))} />

            <div className="flex-1 relative" ref={reactFlowWrapper}>
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnectHandler}
                    onInit={setReactFlowInstance}
                    onDrop={onDrop}
                    onDragOver={onDragOver}
                    onNodeClick={onNodeClick}
                    onEdgeClick={onEdgeClick}
                    onPaneClick={onPaneClick}
                    nodeTypes={nodeTypes}
                    fitView
                    className="bg-gray-950"
                >
                    <Controls />
                    <MiniMap
                        style={{ backgroundColor: '#111827' }}
                        nodeColor="#374151"
                        maskColor="rgba(0, 0, 0, 0.3)"
                    />
                    <Background color="#333" gap={20} />

                    <Panel position="top-right" className="bg-gray-900/80 backdrop-blur-md border border-gray-700 p-2 rounded-lg flex items-center gap-2">
                        <button
                            onClick={onSave}
                            disabled={saving}
                            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-1.5 rounded-md text-sm font-medium flex items-center gap-2 transition-colors"
                        >
                            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                            {saving ? 'Saving...' : 'Save Map Positions'}
                        </button>
                    </Panel>

                    <Panel position="bottom-left" className="bg-gray-900/80 backdrop-blur-md border border-gray-700 p-3 rounded-lg text-[10px] text-gray-400 space-y-1">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full" />
                            <span>Standard Transition</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                            <span>Locked Transition</span>
                        </div>
                    </Panel>
                </ReactFlow>
            </div>

            {selectedElement?.type === 'node' && (
                <NodePropertiesPanel
                    node={selectedElement}
                    onDelete={(id) => {
                        setNodes(nodes.filter(n => n.id !== id));
                        setSelectedElement(null);
                    }}
                />
            )}

            {selectedElement?.type === 'edge' && (
                <EdgePropertiesPanel
                    edge={selectedElement}
                    onUpdate={onEdgeUpdate}
                    onDelete={onEdgeDelete}
                    items={items}
                />
            )}

            {!selectedElement && (
                <div className="w-80 bg-gray-900 border-l border-gray-700 flex flex-col items-center justify-center text-gray-500 p-8 text-center">
                    <MousePointer2 size={48} className="mb-4 opacity-20" />
                    <h3 className="text-sm font-bold uppercase tracking-wider mb-2">Editor Info</h3>
                    <p className="text-xs">Select a room node or a connection to view and edit properties.</p>
                </div>
            )}
        </div>
    );
}
