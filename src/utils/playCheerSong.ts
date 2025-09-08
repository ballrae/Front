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
  const url = `${BASE_S3_URL}/${playerId}.mp3`;

  // 이전 소리가 있으면 콜백으로 안전하게 정리
  if (currentSound) {
    currentSound.stop(() => {
      currentSound?.release();
      currentSound = null;
      // 이전 소리 정리 후 새 소리 재생
      playNewSound(url);
    });
  } else {
    // 이전 소리가 없으면 바로 재생
    playNewSound(url);
  }
};

const playNewSound = (url: string) => {
  const sound = new Sound(url, undefined, (error) => {
    if (error) {
      console.log('응원가 로딩 실패:', error);
      return;
    }
    currentSound = sound;
    sound.play((success) => {
      if (!success) {
        console.log('응원가 재생 실패');
      }
      sound.release();
      currentSound = null;
    });
  });
};