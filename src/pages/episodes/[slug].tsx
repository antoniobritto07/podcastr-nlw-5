import { GetStaticPaths, GetStaticProps } from 'next';
import { useRouter } from 'next/router';
import { api } from '../../services/api';
import { parseISO, format } from "date-fns";
import Link from 'next/link'
import { convertDurationtoTimeString } from '../../utils/convertDurationtoTimeString';
import { ptBR } from 'date-fns/locale';
import Image from 'next/image';
//Todo arquivo que está dentro de pages vai servir como uma rota dentro do esquema do Next
//com exceção dos que começam com underscore
//isso server para substituir o Routes.js

import styles from './episode.module.scss';
import { useContext } from 'react';
import { PlayerContext } from '../../contexts/PlayerContext';
import Head from 'next/head';

//não é bom criar tipagem para tudo junto, sempre bom fazer cada uma de cada arquivo separado (não é bom modularizar)
interface Episode {
  id: string;
  title: string;
  members: string;
  duration: number;
  description: string;
  durationAsString: string;
  url: string;
  publishedAt: string,
  thumbnail: string,
}

interface EpisodeProps {
  episode: Episode
}

export default function Episode({ episode }: EpisodeProps) {
  const { play } = useContext(PlayerContext);

  return (
    <div className={styles.episode}>
      <Head>
        <title>{episode.title} | Podcastr</title>
      </Head>
      <div className={styles.thumbnailContainer}>
        <Link href="/">
          <button type="button">
            <img src="/arrow-left.svg" alt="Voltar" />
          </button>
        </Link>
        <Image
          width={700}
          height={160}
          src={episode.thumbnail}
          objectFit="cover"
        />
        <button type="button">
          <img src="/play.svg" alt="Tocar episódio" onClick={() => play(episode)} />
        </button>
      </div>

      <header>
        <h1>{episode.title}</h1>
        <span>{episode.members}</span>
        <span>{episode.publishedAt}</span>
        <span>{episode.durationAsString}</span>
      </header>

      <div
        className={styles.description}
        dangerouslySetInnerHTML={{ __html: episode.description }} //server para forçar o react converter o código em html e nao imprimir os textos com as suas tags
      />
    </div>
  )
}

//temos que exportar de forma padrão também essa função para quando estamos trabalhando com SSG, porque a nossa página
//é dinâmica por receber a informação do conteúdo advinda da Home, como também é estática por manter as informações
//ali dentro e não variar bastante

//pensando em ecommerces, por exemplo, a melhor ideia seria passar no paths os produtos mais acessados para gerar estaticamente, e usando o 'blocking' deixa a pessoa ir buscando os outros produtos de forma incremental
export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [], //dentro do array vem os 'parametros' que podemos colocar para buildar de forma estática
    fallback: 'blocking' //para questoes de SEO ele é o melhor(ele vai rodar a requisição do lado do next.js)
  }
}
//toda rota que tiver esse parâmetro dinamico como é o "slug" precisa dessa GetStaticProps

export const getStaticProps: GetStaticProps = async (ctx) => {
  const { slug } = ctx.params; //esse slug é por causa do nome do arquivo que nós demos

  const { data } = await api.get(`/episodes/${slug}`)

  const episode = {
    id: data.id,
    title: data.title,
    thumbnail: data.thumbnail,
    members: data.members,
    publishedAt: format(parseISO(data.published_at), 'd MMM yy', { locale: ptBR }),
    duration: Number(data.file.duration),
    durationAsString: convertDurationtoTimeString(Number(data.file.duration)),
    description: data.description,
    url: data.file.url,
  }

  return {
    props: { episode },
    revalidate: 60 * 60 * 24, //24 horas
  }
}