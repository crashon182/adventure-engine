'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

type Room = {
    id: string;
    name: string;
};

export default function RoomsPage({ params }: { params: { projectId: string } }) {
    const [rooms, setRooms] = useState<Room[]>([]);
    const [newRoomName, setNewRoomName] = useState('');

    useEffect(() => {
        fetchRooms();
    }, []);

    const fetchRooms = async () => {
        const res = await fetch(`/api/projects/${params.projectId}/rooms`);
        if (res.ok) setRooms(await res.json());
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newRoomName) return;
        const res = await fetch(`/api/projects/${params.projectId}/rooms`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: newRoomName }),
        });
        if (res.ok) {
            setNewRoomName('');
            fetchRooms();
        }
    };

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-6">Rooms</h1>

            <form onSubmit={handleCreate} className="mb-8 flex gap-2">
                <input
                    type="text"
                    value={newRoomName}
                    onChange={(e) => setNewRoomName(e.target.value)}
                    placeholder="New Room Name (e.g. Castle Entrance)"
                    className="bg-gray-800 border border-gray-700 px-4 py-2 rounded-md outline-none text-white w-64"
                />
                <button type="submit" className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md font-medium">
                    Create Room
                </button>
            </form>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {rooms.map(room => (
                    <Link key={room.id} href={`/editor/${params.projectId}/rooms/${room.id}`} className="bg-gray-800 p-4 rounded-xl border border-gray-700 hover:border-blue-500 block transition-colors">
                        <h3 className="font-bold mb-2">{room.name}</h3>
                        <span className="text-sm text-blue-400">Edit Room &rarr;</span>
                    </Link>
                ))}
            </div>
        </div>
    );
}
