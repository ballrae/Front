// utils/filterPlayer.ts

import teamSearchMap from '../constants/teamSearchMap';

// src/utils/filterPlayer.ts

interface Player {
  id: number;
  player_name: string;
  team_id: string;
  position: 'P' | 'B';
}

export function filterPlayers(players: Player[], search: string): Player[] {
  const keyword = search.trim().toLowerCase();

  return players.filter(player => {
    const nameMatch = player.player_name.toLowerCase().includes(keyword);

    const teamKeywords = teamSearchMap[player.team_id] ?? [];
    const teamMatch = teamKeywords.some(word =>
      word.toLowerCase().includes(keyword)
    );

    return nameMatch || teamMatch;
  });
}