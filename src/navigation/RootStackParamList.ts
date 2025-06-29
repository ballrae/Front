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
  };
  ArchiveScreen: undefined;
  PitcherDetailScreen: { playerId: string };
  BatterDetailScreen: { playerId: string };
};

