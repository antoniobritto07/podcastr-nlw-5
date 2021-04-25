import { createContext, useState, ReactNode } from 'react';

interface Episode {
  title: string;
  members: string;
  thumbnail: string;
  duration: number;
  url: string;
}

interface PlayerContextData {
  episodeList: Array<Episode>; // poderia declarar como Episode[]
  currentEpisodeIndex: number;
  isPlaying: boolean;
  isLooping: boolean;
  isShuffling: boolean;
  hasPrevious: boolean;
  hasNext: boolean;
  play: (episode: Episode) => void;
  setPlayingState: (state: boolean) => void;
  togglePlay: () => void;
  toggleLoop: () => void;
  toggleShuffle: () => void;
  playList: (list: Array<Episode>, index: number) => void;
  playNext: () => void;
  clearPlayerState: () => void;
  playPrevious: () => void;
}

interface PlayerContextProviderProps {
  children: ReactNode; //essa tipagem quer dizer basicamente que nesse children pode vim qualquer coisa de fato('ReactNode)
}

export const PlayerContext = createContext({} as PlayerContextData);

// export const PlayerContext = createContext({} as PlayerContextData); poderia declarar também como createContext({episodeList: [], currentEpisodeIndex: 0})

export function PlayerContextProvider({ children }: PlayerContextProviderProps) {
  const [episodeList, setEpisodeList] = useState([]);
  const [currentEpisodeIndex, setCurrentEpisodeIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  const [isShuffling, setIsShuffing] = useState(false);

  function play(episode: Episode) {
    setEpisodeList([episode])
    setCurrentEpisodeIndex(0) // seta zero quando so tem uma musica na lista
    setIsPlaying(true);
  }

  function playList(list: Array<Episode>, index: number) {
    setEpisodeList(list);
    setCurrentEpisodeIndex(index)
    setIsPlaying(true);
  }

  function togglePlay() {
    setIsPlaying(!isPlaying);
  }

  function toggleLoop() { //fazendo o loop
    setIsLooping(!isLooping);
  }

  function toggleShuffle() { //fazendo o loop
    setIsShuffing(!isShuffling);
  }

  function setPlayingState(state: boolean) {
    setIsPlaying(state); // fazendo com que consiga pausar e despausar pelo teclado do computador
  }

  const hasPrevious = currentEpisodeIndex > 0;
  const hasNext = isShuffling || (currentEpisodeIndex + 1) < episodeList.length;

  function playNext() { //verificando se tem algum podcast seguinte
    if (isShuffling) {
      const nextRandomEpisodeIndex = Math.floor(Math.random() * episodeList.length) //seta um indice aleatorio para cair em qualquer episodio quando o botao de embaralhar está habilitado

      setCurrentEpisodeIndex(nextRandomEpisodeIndex);
    }
    else if (hasNext) {
      setCurrentEpisodeIndex(currentEpisodeIndex + 1)
    }
  }

  function playPrevious() { //verificando se tem algum podcast anteriors
    if (hasPrevious) {
      setCurrentEpisodeIndex(currentEpisodeIndex - 1)
    }
  }

  function clearPlayerState() { //zera a lista de podcasts dentro
    setEpisodeList([]);
    setCurrentEpisodeIndex(0);
  }

  return (
    <PlayerContext.Provider
      value={{
        episodeList,
        currentEpisodeIndex,
        isPlaying,
        togglePlay,
        setPlayingState,
        playList,
        play,
        playPrevious,
        playNext,
        hasPrevious,
        hasNext,
        isLooping,
        toggleLoop,
        toggleShuffle,
        isShuffling,
        clearPlayerState
      }}
    >
      {children}
    </PlayerContext.Provider>
  )
}
