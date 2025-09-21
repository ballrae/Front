import Sound from 'react-native-sound';

const BASE_S3_URL = 'https://ballrae-sounds.s3.us-east-2.amazonaws.com';

let currentSound: Sound | null = null;

export const stopCheerSong = () => {
  if (currentSound) {
    currentSound.stop();
    currentSound.release();
    currentSound = null;
  }
};

export const playCheerSong = (playerId: string) => {
  console.log('🎵 [playCheerSong] 시작 - playerId:', playerId);
  
  if (!playerId) {
    console.log('🎵 [playCheerSong] playerId가 없음');
    return;
  }
  
  const url = `${BASE_S3_URL}/${playerId}.mp3`;
  console.log('🎵 [playCheerSong] 재생할 URL:', url);

  // 이전 소리가 있으면 콜백으로 안전하게 정리
  if (currentSound) {
    console.log('🎵 [playCheerSong] 이전 소리 정리 중...');
    currentSound.stop(() => {
      currentSound?.release();
      currentSound = null;
      // 이전 소리 정리 후 새 소리 재생
      playNewSound(url);
    });
  } else {
    // 이전 소리가 없으면 바로 재생
    console.log('🎵 [playCheerSong] 바로 재생 시작');
    playNewSound(url);
  }
};

const playNewSound = (url: string) => {
  console.log('🎵 [playNewSound] 새 소리 로딩 시작:', url);
  
  const sound = new Sound(url, undefined, (error) => {
    if (error) {
      console.log('🎵 [playNewSound] 응원가 로딩 실패:', error);
      return;
    }
    
    console.log('🎵 [playNewSound] 응원가 로딩 성공, 재생 시작');
    currentSound = sound;
    
    sound.play((success) => {
      if (!success) {
        console.log('🎵 [playNewSound] 응원가 재생 실패');
      } else {
        console.log('🎵 [playNewSound] 응원가 재생 성공');
      }
      sound.release();
      currentSound = null;
    });
  });
};