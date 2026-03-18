'use client';
import { ReactFlowProvider } from 'reactflow';
import RoomMapEditor from '@/components/editor/RoomMapEditor';

export default function RoomMapPage({ params }: { params: { projectId: string } }) {
    return (
        <ReactFlowProvider>
            <div className="h-full w-full">
                <RoomMapEditor projectId={params.projectId} />
            </div>
        </ReactFlowProvider>
    );
}
