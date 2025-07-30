import teamSearchMap from '../constants/teamSearchMap';

interface PlayerMain {
  player: {
    id: number;
    player_name: string;
    team_id: string;
    position: 'P' | 'B';
  };
  stats: {
    inn?: number;
    k?: number;
    avg?: number;
    ops?: number;
  };
}

export function filterPlayers(players: PlayerMain[], search: string): PlayerMain[] {
  const keyword = search.trim().toLowerCase();

  return players.filter(p => {
    const { player } = p;

    const nameMatch = player.player_name.toLowerCase().includes(keyword);

    const teamKeywords = teamSearchMap[player.team_id.toUpperCase()] ?? [];
    const teamMatch = teamKeywords.some(word =>
      word.toLowerCase().includes(keyword) || keyword.includes(word.toLowerCase())
    );

    return nameMatch || teamMatch;
  });
}