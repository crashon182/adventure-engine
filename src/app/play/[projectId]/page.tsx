import AdventurePlayer from '@/components/engine/AdventurePlayer';

export const metadata = {
    title: 'Playing Engine',
};

export default function PlayModePage({ params }: { params: { projectId: string } }) {
    return (
        <main>
            <AdventurePlayer projectId={params.projectId} />
        </main>
    );
}
