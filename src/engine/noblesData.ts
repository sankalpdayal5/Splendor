import { Noble } from './types';

// Dataset for all 10 official Splendor Noble Tiles (worth 3 Prestige Points each)

export const NOBLES_DATA: Noble[] = [
  {
    id: 'n1',
    name: 'Anne of Brittany',
    prestigePoints: 3,
    reqs: { diamond: 3, sapphire: 3, emerald: 3 }
  },
  {
    id: 'n2',
    name: 'Charles V',
    prestigePoints: 3,
    reqs: { diamond: 3, ruby: 3, onyx: 3 }
  },
  {
    id: 'n3',
    name: 'Catherine de\' Medici',
    prestigePoints: 3,
    reqs: { emerald: 3, ruby: 3, onyx: 3 }
  },
  {
    id: 'n4',
    name: 'Francis I of France',
    prestigePoints: 3,
    reqs: { sapphire: 3, emerald: 3, ruby: 3 }
  },
  {
    id: 'n5',
    name: 'Isabella I of Castile',
    prestigePoints: 3,
    reqs: { diamond: 4, onyx: 4 }
  },
  {
    id: 'n6',
    name: 'Henry VIII of England',
    prestigePoints: 3,
    reqs: { ruby: 4, onyx: 4 }
  },
  {
    id: 'n7',
    name: 'Suleiman the Magnificent',
    prestigePoints: 3,
    reqs: { sapphire: 4, emerald: 4 }
  },
  {
    id: 'n8',
    name: 'Mary Stuart',
    prestigePoints: 3,
    reqs: { diamond: 4, sapphire: 4 }
  },
  {
    id: 'n9',
    name: 'Elisabeth of Austria',
    prestigePoints: 3,
    reqs: { emerald: 4, ruby: 4 }
  },
  {
    id: 'n10',
    name: 'Machiavelli',
    prestigePoints: 3,
    reqs: { sapphire: 3, ruby: 3, onyx: 3 }
  }
];
