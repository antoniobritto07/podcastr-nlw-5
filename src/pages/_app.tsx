import '../styles/global.scss';
import styles from '../styles/app.module.scss';

import Header from '../components/Header';
import Player from '../components/Player';
import { PlayerContextProvider } from '../contexts/PlayerContext';

// Foi instalada uma dependencia chamada Json-Server para nos ajudar a simular um banco de dados de forma mais real, já que estamos usando uma api "fictícia" por enquanto
// Tem um script no packageJson só para isso chamada server
function MyApp({ Component, pageProps }) {
  return (
    <PlayerContextProvider>
      <div className={styles.wrapper}>
        <main>
          <Header />
          <Component {...pageProps} />
        </main>
        <Player />
      </div>
    </PlayerContextProvider>
  )
}

export default MyApp
