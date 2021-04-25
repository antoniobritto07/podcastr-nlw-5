// Formas de consumir API
//SPA => fetch, usando useEffect
//SSR => usando props e a função do getServer
//SSG => bem parecido com o modelo SSG, mas com algumas coisas melhores
//Nessa api está sendo usada dessa forma ("SSG")

//OBS: o método SSR e SSG só funcionam com aplicações que estão usando o next
//são melhores quando se fala de SSO também

import { GetStaticProps } from 'next' //tipando toda a função
import { api } from '../services/api'
import ptBR from 'date-fns/locale/pt-BR'
import Link from 'next/link';
import Head from 'next/head';
//Esse Image é uma funciocalidade do next que faz de forma automatizada a tratativa da imagem para que ela
//venha num formato mais leve do que o que a api está mandando. Só está sendo feita na que vem de lá, porque
//as que estão na pasta public já foram impertadas muito levemente
import Image from "next/image";
import { parseISO, format } from 'date-fns'
import { convertDurationtoTimeString } from '../utils/convertDurationtoTimeString';

import styles from './home.module.scss';
import { useContext } from 'react';
import { PlayerContext } from '../contexts/PlayerContext';

interface Episode {
  id: string;
  title: string;
  members: string;
  duration: number;
  durationAsString: string;
  url: string;
  publishedAt: string,
  thumbnail: string,
}
//outra forma de faze rseria usando o type, que no caso ficaria:
// type Episode = {
//   id: string;
//   title: string;
//   members: string;
//   description: string;
//   duration: number;
//   durationAsString: string;
//   url: string;
//   publishedAt: string,
//   thumbnail: string,
// }

interface HomeProps { //usando interface dá no mesmo, serve para a mesma coisa (type = é a mesma coisa)
  latestEpisodes: Array<Episode>, //poderia declarar também como Episode[]
  allEpisodes: Array<Episode>
}

export default function Home({ latestEpisodes, allEpisodes }: HomeProps) {
  const { playList } = useContext(PlayerContext);

  const episodeList = [...latestEpisodes, ...allEpisodes]; //adiocina todos os elementos em um arrz só usando o operador rest

  return (
    <div className={styles.homepage}>
      <Head>
        {/* //esse head é importado de dentro do next e serve para a gente mudar o cabeçalho que fica na aba do navegador, e fazemos isso para cada página */}
        <title>Home | Poscastr</title>
      </Head>

      <section className={styles.latestEpisodes}>
        <h2>Últimos lançamentos</h2>

        <ul>
          {latestEpisodes.map((episode, index) => {
            return (
              <li style={{ minWidth: "460px" }} key={episode.id}>
                <div className={styles.latestEpisodesImage}>
                  <Image
                    width={192} //largura que ela está sendo importada, e não o que está sendo mostrada
                    height={192} //altura que ela está sendo importada, e não o que está sendo mostrada
                    src={episode.thumbnail}
                    alt={episode.title}
                    objectFit="cover" //posicionamento da imagem na tela (naturalmente ela vem bastante distorcida)
                  />
                </div>

                <div className={styles.episodeDetails}>
                  <Link href={`/episodes/${episode.id}`}>
                    <a>{episode.title}</a>
                  </Link>
                  <p>{episode.members}</p>
                  <span>{episode.publishedAt}</span>
                  <span>{episode.durationAsString}</span>
                </div>

                <button type="button" onClick={() => playList(episodeList, index)}>
                  <img src="/play-green.svg" alt="Tocar episódio" />
                </button>
              </li>
            )
          })}
        </ul>
      </section>

      <section className={styles.allEpisodes}>
        <h2>Todos episódios</h2>

        <table cellSpacing={0}>
          <thead>
            <tr>
              <th></th>
              <th>Podcast</th>
              <th>Integrantes</th>
              <th>Data</th>
              <th>Duração</th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            {allEpisodes.map((episode, index) => {
              return (
                <tr key={episode.id}>
                  <td style={{ minWidth: 110 }}>
                    <Image
                      width={120}
                      height={120}
                      src={episode.thumbnail}
                      alt={episode.title}
                      objectFit="cover"
                    />

                  </td>
                  <td style={{ minWidth: 110 }}>
                    <Link href={`/episodes/${episode.id}`}>
                      <a>{episode.title}</a>
                    </Link>
                  </td>
                  <td style={{ minWidth: 110 }}>
                    <a href="">{episode.members}</a>
                  </td>
                  <td style={{ minWidth: 110 }}>
                    <a href="">{episode.publishedAt}</a>
                  </td>
                  <td style={{ minWidth: 110 }}>
                    <a href="">{episode.durationAsString}</a>
                  </td>
                  <td>
                    <a href="#player">
                      <button type="button">
                        <img
                          src="/play-green.svg"
                          alt="Tocar episódio"
                          onClick={() => {
                            playList(episodeList, index + latestEpisodes.length); //essa soma no final é para esses elementos ficarem com o index+2, levando em consideração que tem os dois primeiros que precisam estar ali dentro do array
                          }}
                        />
                      </button>
                    </a>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </section>
    </div>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const response = await api.get('episodes', {
    params: {
      _limit: 12,
      _sort: 'published_at',
      _order: 'desc'
    }
  })
  //poderia desestruturar também e já pegar o data direto: [data] = ...
  const data = response.data;

  const episodes = data.map(episode => {
    return {
      id: episode.id,
      title: episode.title,
      thumbnail: episode.thumbnail,
      members: episode.members,
      publishedAt: format(parseISO(episode.published_at), 'd MMM yy', { locale: ptBR }),
      duration: Number(episode.file.duration),
      durationAsString: convertDurationtoTimeString(Number(episode.file.duration)),
      url: episode.file.url,
    }
  })

  const latestEpisodes = episodes.slice(0, 2);
  const allEpisodes = episodes.slice(2, episodes.length);

  return { // configurações de next => SSG
    props: {
      latestEpisodes,
      allEpisodes
    },
    revalidate: 60 * 60 * 8,
  }
}
