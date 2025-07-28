export type RootStackParamList = {
  Main: undefined; 
  MyTeamScreen: undefined;
  PostScreen: undefined;
  TeamPostScreen: {
    teamId: string;
    teamName: string;
  };
  WritePostScreen: {
     teamId: string; 
     teamName: string };
  DetailPostScreen: { 
    teamId: string; 
    teamName: string;
    postId: number };
  LiveGameScreen: {
    gameId: string;
    homeTeamName: string;
    awayTeamName: string;
    homeScore:number;
    awayScore:number;
    status: 'live' | 'done' | 'scheduled';
  };
  ArchiveScreen: undefined;
  PitcherDetailScreen: { playerId: number };
  BatterDetailScreen: { playerId: number };
  SettingsScreen: { type: 'broadcast' | 'alarm' };
};

