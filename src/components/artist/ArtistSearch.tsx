import { useState, useEffect } from 'react';
import { useDebounce } from '@/hooks/useDebounce';

interface Artist {
  name: string;
  id: string;
  spotify?: string;
  image?: string;
}

interface ArtistSearchProps {
  onArtistSelect: (artist: Artist) => void;
}

export default function ArtistSearch({ onArtistSelect }: ArtistSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(false);
  const debouncedSearch = useDebounce(searchTerm, 300);

  // Search for artists as user types
  useEffect(() => {
    async function searchArtists() {
      if (debouncedSearch.length < 2) {
        setSuggestions([]);
        return;
      }

      setLoading(true);
      try {
        const response = await fetch('/api/search-artists', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: debouncedSearch })
        });
        const data = await response.json();
        setSuggestions(data.artists || []);
      } catch (error) {
        console.error('Artist search error:', error);
      } finally {
        setLoading(false);
      }
    }

    searchArtists();
  }, [debouncedSearch]);

  return (
    <div className="relative">
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search for an artist..."
        className="w-full p-4 rounded bg-white/10 text-white"
      />
      
      {/* Suggestions Dropdown */}
      {suggestions.length > 0 && (
        <div className="absolute w-full mt-1 bg-black/90 rounded-lg shadow-xl z-50">
          {suggestions.map((artist) => (
            <button
              key={artist.id}
              onClick={() => {
                onArtistSelect(artist);
                setSearchTerm('');
                setSuggestions([]);
              }}
              className="flex items-center w-full p-3 hover:bg-white/10 text-left"
            >
              {artist.image && (
                <img 
                  src={artist.image} 
                  alt={artist.name} 
                  className="w-10 h-10 rounded-full mr-3"
                />
              )}
              <span className="text-white">{artist.name}</span>
            </button>
          ))}
        </div>
      )}

      {loading && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <div className="animate-spin text-pink-500">⭐</div>
        </div>
      )}
    </div>
  );
} 