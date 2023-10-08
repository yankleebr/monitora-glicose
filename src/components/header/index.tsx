import Link from 'next/link'
import styles from './styles.module.css'
import { signIn, signOut, useSession } from 'next-auth/react'

export function Header(){

    const {data:session, status} = useSession()
    return(
        <header className={styles.header}>
            <section className={styles.content}>
                <nav className={styles.nav}>
                    <Link href='/'>
                        <h1 className={styles.logo}>
                            Glicose<span>+</span>
                        </h1>
                    </Link>
                    {session?.user && (
                        <Link href='/dashboard' className={styles.link} >
                        Meu Registro
                        </Link>
                        
                    )}
                     {session?.user && (
                        <Link href='/chart' className={styles.link} >
                        Meu Gráfico
                        </Link>
                        
                    )}
                    
                </nav>

                {status ==='loading' ? (
                    <></> //se for loading não vai aparecer nada, por isso <></>
                ) :session ? (
                    <button className={styles.loginButton} onClick={ () => signOut()}>
                    Olá {session?.user?.name}
                    </button>
                ) : (
                    <button className={styles.loginButton} onClick={ () => signIn('google')}>
                    Acessar
                    </button>
                )
                }
                
                
            </section>
            
        </header>
    )
}