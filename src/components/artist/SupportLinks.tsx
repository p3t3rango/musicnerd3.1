import { FaBandcamp, FaShoppingCart } from 'react-icons/fa';
import { SiSoundcloud, SiBeatport } from 'react-icons/si';
import { TbVinyl } from 'react-icons/tb';
import { MusicNerdData } from '@/types';
import { motion } from 'framer-motion';

interface ColorMap {
  [key: string]: string;
}

interface Platform {
  type: string;
  url: string;
  icon?: string;
}

interface SupportLinksProps {
  musicNerdData: MusicNerdData;
  platforms?: Platform[];
  artistName?: string;
}

export default function SupportLinks({ musicNerdData }: { musicNerdData: MusicNerdData }) {
  if (!musicNerdData) return null;

  const widgets = [
    {
      type: 'spotify',
      url: musicNerdData.spotify,
      height: 380,
      component: (id: string) => (
        <iframe
          src={`https://open.spotify.com/embed/artist/${id}`}
          width="100%"
          height="380"
          frameBorder="0"
          allow="encrypted-media"
        />
      )
    },
    {
      type: 'bandsintown',
      url: musicNerdData.bandsintown,
      height: 350,
      component: (id: string) => (
        <iframe
          src={`https://www.bandsintown.com/w/artist/${id}?came_from=267&display_local_dates=1`}
          width="100%"
          height="350"
          frameBorder="0"
        />
      )
    },
    // Add other widgets similarly
  ];

  return (
    <div className="grid grid-cols-1 gap-4">
      {widgets.map(widget => 
        widget.url && (
          <motion.div 
            key={widget.type}
            whileHover={{ scale: 1.01 }} 
            className="bg-white/5 rounded-lg overflow-hidden"
          >
            {widget.component(widget.url)}
          </motion.div>
        )
      )}
    </div>
  );
} 