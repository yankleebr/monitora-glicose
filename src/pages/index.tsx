import Head from 'next/head'
import styles from '../../styles/Home.module.css'
import Image from 'next/image'
import heroImg from '../../public/assets/hero.png'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '../services/firebaseConnecyion'
import { GetStaticProps } from 'next'

interface HomeProps{
  registerGlicose:number
  registerObservations:number
}

export default function Home({registerGlicose,registerObservations}:HomeProps) {
  return (
   <div className={styles.container}>
    <Head>
      <title>Monitore sua Glicose</title>
    </Head>
    
    <main className={styles.main}>
      <div className={styles.logoContent}>
        <Image
          className={styles.hero}
          alt='Logo Monitore-Glicose'
          src={heroImg}
          priority
        />
      </div>
      <h1 className={styles.title}>
        Monitore sua Glicose
      </h1>

      <div className={styles.infoContent}>
        <section className={styles.box}>
          <span>+{registerGlicose} Registros</span>
        </section>
        <section className={styles.box}>
          <span>+{registerObservations} Comentários</span>
        </section>
      </div>
    </main>
   </div>
  )}

  export const getStaticProps:GetStaticProps = async () =>{
    //busca a quantidade de registros de observações e glicoses
    const observationRef = collection(db,'observations')
    const glicoseRef = collection(db,'glicoses')

    const observationSnapshot = await getDocs(observationRef)
    const glicoseSnapshot = await getDocs(glicoseRef)

    return {
      props:{
        registerGlicose:glicoseSnapshot.size || 0,
        registerObservations:observationSnapshot.size || 0
      },
      revalidate:60 //atualiza a cada 60s
    }
  }
