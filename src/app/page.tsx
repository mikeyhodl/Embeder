'use client';
import { useState } from 'react';
import PlaylistForm from '@/components/PlaylistForm';
import PlaylistView from '@/components/PlaylistView';

export default function Home() {
  const [updateTrigger, setUpdateTrigger] = useState(0);

  const handlePlaylistUpdate = () => {
    setUpdateTrigger(prev => prev + 1);
  };

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-8">Video Player App</h1>
      <div className="space-y-12">
        <PlaylistForm onPlaylistUpdate={handlePlaylistUpdate} />
        <PlaylistView updateTrigger={updateTrigger} />
      </div>
    </div>
  );
}
