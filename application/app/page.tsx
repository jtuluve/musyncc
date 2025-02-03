"use client";
import React, { useEffect, useState } from "react";

const HomePage = () => {
  const [roomCode, setRoomCode] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (roomCode.trim()) {
      window.location.href = `/room/${roomCode}`;
    }
  };
  useEffect(() => {
    fetch(process.env.NEXT_PUBLIC_SOCKET_URL);
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-purple-800">
      <div className="container mx-auto px-4 py-24">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <img src="/logo.png" className="w-14 h-14 text-purple-300" />
            <h1 className="text-5xl font-bold text-white ml-4">Musync</h1>
          </div>
          <p className="text-xl text-purple-200 max-w-md mx-auto">
            Sync your music experience. Join a room or create your own to share
            the rhythm.
          </p>
        </div>

        {/* Room Code Input */}
        <div className="w-full max-w-md mx-auto mb-24">
          <form onSubmit={handleSubmit} className="relative">
            <input
              type="text"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value)}
              placeholder="Enter room code"
              className="w-full px-6 py-4 text-lg bg-white/10 border-2 border-purple-400/30 rounded-full text-white placeholder-purple-300 focus:outline-none focus:border-purple-400 transition-colors"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-purple-500 hover:bg-purple-600 text-white p-3 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 focus:ring-offset-purple-900"
            >
              <img src="/arrow-right.svg" className="w-6 h-6" />
            </button>
          </form>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="text-center p-6 bg-white/5 rounded-xl backdrop-blur-sm">
            <h3 className="text-xl font-semibold text-purple-200 mb-2">
              Real-time Sync
            </h3>
            <p className="text-purple-300">
              Stay in perfect harmony with synchronized playback across all
              devices
            </p>
          </div>
          <div className="text-center p-6 bg-white/5 rounded-xl backdrop-blur-sm">
            <h3 className="text-xl font-semibold text-purple-200 mb-2">
              Real-time Chat
            </h3>
            <p className="text-purple-300">
              Chat with your friends while enjoying the music.
            </p>
          </div>
          <div className="text-center p-6 bg-white/5 rounded-xl backdrop-blur-sm">
            <h3 className="text-xl font-semibold text-purple-200 mb-2">
              Shared Control
            </h3>
            <p className="text-purple-300">
              Take turns being the DJ and control the music together
            </p>
          </div>
          <div className="text-center p-6 bg-white/5 rounded-xl backdrop-blur-sm">
            <h3 className="text-xl font-semibold text-purple-200 mb-2">
              Cross-Platform
            </h3>
            <p className="text-purple-300">
              Works seamlessly across all your favorite devices and browsers
            </p>
          </div>
        </div>

        {/* Additional Features Section */}
        <div className="mt-24 max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Why Choose Musync?
          </h2>
          <div className="space-y-8">
            <div className="bg-white/5 rounded-xl p-8 backdrop-blur-sm">
              <h3 className="text-2xl font-semibold text-purple-200 mb-4">
                Seamless Music Synchronization
              </h3>
              <p className="text-purple-300 text-lg">
                Experience music together in perfect harmony. Our advanced
                synchronization technology ensures that everyone in the room
                hears the same beat at the same time, creating a truly shared
                listening experience.
              </p>
            </div>
            <div className="bg-white/5 rounded-xl p-8 backdrop-blur-sm">
              <h3 className="text-2xl font-semibold text-purple-200 mb-4">
                Interactive Playlist Control
              </h3>
              <p className="text-purple-300 text-lg">
                Take turns being the DJ with our collaborative playlist feature.
                Add songs, vote on upcoming tracks, and enjoy a democratically
                curated music experience that everyone can participate in.
              </p>
            </div>
            <div className="bg-white/5 rounded-xl p-8 backdrop-blur-sm">
              <h3 className="text-2xl font-semibold text-purple-200 mb-4">
                No Installation Required
              </h3>
              <p className="text-purple-300 text-lg">
                Jump right into the music with our web-based platform. No
                downloads, no installations - just share your room code and
                start listening together instantly on any device.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center mt-24 text-purple-300">
          <p>© 2024 Musync. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
};

export default HomePage;
