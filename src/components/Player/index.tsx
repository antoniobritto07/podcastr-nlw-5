import { useContext, useEffect, useRef, useState } from 'react';
import { PlayerContext } from '../../contexts/PlayerContext';
import Image from 'next/image';
import Slider from 'rc-slider'; //para mexer com a parte do slider vamos usar uma lib chamada 'rc-slider' 
import 'rc-slider/assets/index.css'; //importando estilização da slider porque só aqui que essa slider vai ser de fato usada
import styles from './styles.module.scss';
import { convertDurationtoTimeString } from '../../utils/convertDurationtoTimeString';

export default function Player() {
  const audioRef = useRef<HTMLAudioElement>(null) //criando referenciação para conseguir manipular o audio, que é uma tag html
  const [progress, setProgress] = useState(0); // essa variável criamos aqui porque ela vai ser acessada exclusivamente pelo Player, dessa forma nao precisamos criá-la no Context
  const {
    episodeList,
    currentEpisodeIndex,
    isPlaying,
    togglePlay,
    setPlayingState,
    playNext,
    playPrevious,
    hasNext,
    hasPrevious,
    isLooping,
    toggleLoop,
    isShuffling,
    toggleShuffle,
    clearPlayerState
  } = useContext(PlayerContext);

  useEffect(() => { //fazendo o botão de start e pause funcionar
    if (!audioRef.current) {
      return;
    }
    if (isPlaying) {
      audioRef.current.play();
    }
    else {
      audioRef.current.pause();
    }
  }, [isPlaying])

  function setupProgressListener() {
    audioRef.current.currentTime = 0; // sempre que mudar de um player para outro ele vai voltar para a estaca 0

    audioRef.current.addEventListener('timeupdate', () => {
      setProgress(Math.floor(audioRef.current.currentTime)); //isso aqui vai retornar o tempo atual do Player
    })
  }

  function handleSeek(amount: number) {
    audioRef.current.currentTime = amount; //vai colocar a bolinha na posição que a pessoa colocar
    setProgress(amount);  // setar o tempo no local onde a pessoa colocar a bolinha
  }

  function handleEpisodeEnded() {
    if (hasNext) {
      playNext()
    }
    else {
      clearPlayerState();
    }
  }

  const episode = episodeList[currentEpisodeIndex];

  return (
    <div id="#player" className={styles.playerContainer}>
      <header style={{ marginBottom: "1rem" }}>
        <img src="/playing.svg" alt="Tocando agora" />
        <strong>Tocando agora</strong>
        {/* {episode?.title} */}
        {/* essa interrogação serve para ver se tem algum episodio tocando primeiro e nao esperar que tenha de fato algum para nao crashar a página */}
      </header>

      { episode ? (
        <div className={styles.currentEpisode}>
          <Image
            width={592}
            height={592}
            src={episode.thumbnail}
            objectFit="cover"
          />
          <strong>{episode.title}</strong>
          <span>{episode.members}</span>
        </div>
      ) : (
        <div className={styles.emptyPlayer}>
          <strong>Selecione um podcast para ouvir</strong>
        </div>
      )}

      <footer className={styles.empty}>
        <div className={styles.progress}>
          <span>
            {convertDurationtoTimeString(progress)}
          </span>
          <div className={styles.slider}>
            {episode ? (
              <Slider
                max={episode.duration} //em segundos
                onChange={handleSeek} //essaf unção faz algo monitorando quando o usuário arrastar ali a bolinha
                value={progress} //valor da bolinha vai ficar sendo atualizada de acordo com o valor que a gente esta ouvindo
                trackStyle={{ backgroundColor: '#04d361' }} // muda a cor da linha do progresso que já aconteceu
                railStyle={{ backgroundColor: '#9f75ff' }} // muda a cor da linha de progresso que ainda falta
                handleStyle={{ borderColor: '#04d361', borderWidth: 4 }} //estiliza a bolinha de arraste e progresso
              />
            ) : (
              <div className={styles.emptySlider} />
            )
            }
          </div>
          <span>
            {
              convertDurationtoTimeString(episode?.duration ?? 0)
              //se nao tiver o episode.duration ele nao vai crashar a página por causa da '?', e também vai setar o valor de '0'
            }
          </span>
        </div>

        {episode && (
          <audio
            src={episode.url}
            ref={audioRef} //todo elemento ref a gente pode usar essa propriedade ref
            autoPlay
            onEnded={handleEpisodeEnded} //função que é executada quando o audio chega no final
            loop={isLooping} //propriedade nativa do audio, que quando true ele já faz o loop do audio
            onPlay={() => setPlayingState(true)}
            onPause={() => setPlayingState(false)}
            onLoadedMetadata={setupProgressListener} //evento dispara assim que o player conseguir carregar os dados do episodio
          />
        )}

        <div className={styles.buttons}>
          {/* caso nao tenha episode coloca o estilo, caso tenha, retira a estilização */}
          <button
            type="button"
            disabled={!episode || (episodeList.length + 1) === 1} //lógica para nao habilitar o botao de embaralhar quando só estiver um podcast na lista, quando estamos na página de slug, ou quando nao há nenhum podcast tocando
            onClick={toggleShuffle}
            className={isShuffling ? styles.isActive : ""}
          >
            {/* verifica se tem alguma antes dele, pois caso nao hasPrevioustenha vai desabilizar o botao de voltar */}
            <img src="shuffle.svg" alt="Emabaralhar" />
          </button>
          <button
            type="button"
            disabled={!episode || !hasPrevious}
            onClick={playPrevious}
          >
            <img src="play-previous.svg" alt="Tocar anterior" />
          </button>
          <button
            type="button"
            className={styles.playButton}
            disabled={!episode}
            onClick={togglePlay}
          >
            {isPlaying ?
              <img src="pause.svg" alt="Pausar" />
              :
              <img src="play.svg" alt="Tocar" />
            }
          </button>
          <button
            type="button"
            disabled={!episode || !hasNext}
            onClick={playNext}
          >
            <img src="play-next.svg" alt="Tocar próxima" />
          </button>
          <button
            type="button"
            disabled={!episode}
            onClick={toggleLoop}
            className={isLooping ? styles.isActive : ""}
          >
            <img src="repeat.svg" alt="Repetir" />
          </button>
        </div>
      </footer>
    </div>
  )
}