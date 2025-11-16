import React from 'react';
import { motion } from 'framer-motion';

interface Player {
  id: number;
  name: string;
  jerseyNumber: number;
}

const mockPlayers: Player[] = [
  { id: 1, name: 'Player 1', jerseyNumber: 10 },
  { id: 2, name: 'Player 2', jerseyNumber: 7 },
  { id: 3, name: 'Player 3', jerseyNumber: 11 },
  { id: 4, name: 'Player 4', jerseyNumber: 5 },
  { id: 5, name: 'Player 5', jerseyNumber: 9 },
];

const QuickPlayerStrip: React.FC = () => {
  return (
    <div className="w-full bg-gray-800 p-4">
      <h3 className="text-lg font-bold mb-2">Quick Player Select</h3>
      <div className="flex space-x-4 overflow-x-auto">
        {mockPlayers.map((player) => (
          <motion.div
            key={player.id}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="flex flex-col items-center space-y-2 cursor-pointer"
          >
            <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center text-2xl font-bold">
              {player.jerseyNumber}
            </div>
            <span className="text-sm">{player.name}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default QuickPlayerStrip;
