import Head from 'next/head'
import styles from './styles.module.css'
import { GetServerSideProps } from 'next'
import { getSession } from 'next-auth/react'
import {Textarea} from '../../components/textarea'
import { FiShare2 } from 'react-icons/fi';
import { FaTrash } from 'react-icons/fa';
import React, { ChangeEvent, FormEvent, useState, useEffect} from 'react'
import { db } from '../../services/firebaseConnecyion'
import { 
    addDoc,
    collection,
    query,
    orderBy,
    where,
    onSnapshot,
    doc,
    deleteDoc,
    } from 'firebase/firestore'
import Link from 'next/link'




interface HomeProps{
    user:{
        email:string
    }
}

interface regGlicoseProps{
    id:string,
    created:Date,
    public:boolean,
    glicose:number,
    user:string
    }

export default function Dashboard({user}:HomeProps){
    const [inputGlicose, setInputGlicose] = useState('')
    const [publicGlicose,setPublicGlicose] = useState(true)
    const [regGlicoses,setRegGlicoses] = useState<regGlicoseProps[]>([])

    


    function handleChangePublic(event:ChangeEvent<HTMLInputElement>){
      
        setPublicGlicose(event.target.checked)
    }

    //registra a glicose como pública ou não
    async function handleRegisterGlicose(event:FormEvent){
        event.preventDefault()
        
        //Verifica se a input é diferente de vazio, somente number e maior que zero
        const inputGlicoseVerifica = Number(inputGlicose)     
        if (inputGlicose ==='' || Number.isInteger(inputGlicoseVerifica) === false || inputGlicoseVerifica <0) 
        return (alert('Digite sua Glicose'))
        
        

        try {
            await addDoc(collection(db, 'glicoses'),{
                glicose:inputGlicose,
                created:new Date(),
                public:publicGlicose,
                user:user?.email
            })
          
            setInputGlicose('')
            setPublicGlicose(true)
            
        } catch (error) {
            console.log(error)
        }
        
    }

    //lista as glicoses
    useEffect(()=>{
        async function loadGlicose() {
            const glicosesRef = collection(db, 'glicoses')
            const  q = query(
                glicosesRef,
                orderBy('created','desc'),
                where('user', '==', user?.email)
            )
            onSnapshot(q,(snapshot)=>{
                let lista = [] as regGlicoseProps[]
                
                snapshot.forEach((doc)=>{
                    
                    //Formatação de data retirada do Firestore - dd/mm/aaaa - hh:mm:ss
                    const miliseconds = doc.data().created.seconds *1000
                    const createdFormat = new Date(miliseconds)
                    
                    
                    
                    lista.push({
                        id:doc.id,
                        glicose:doc.data().glicose,
                        created:new Date(createdFormat),
                        user:doc.data().user,
                        public:doc.data().public                        
                    }) 
                     
                })
                
                setRegGlicoses(lista)
                
            })
        }
        loadGlicose()
    }, [user?.email])

    //copia a url para compartilhar
    async function handleShare(id:string){
        await navigator.clipboard.writeText(
            `${process.env.NEXT_PUBLIC_URL}/glicose/${id}`
        )
        alert('URL copiada para compartilhar!')
    }
    

    async function handleDeleteGlicose(id:string){
        const docRef = doc(db, 'glicoses',id)
        await deleteDoc(docRef)

    }



    return(
        <div className={styles.container}>
            <Head>
                <title>Cadastro de Glicose</title>
            </Head>

            <main className={styles.main}>
                <section className={styles.content}>
                    <div className={styles.contentForm}>
                        <h1 className={styles.title}>Qual sua glicose?</h1>
                            
                            <form onSubmit={handleRegisterGlicose}>
                                <Textarea
                                placeholder='Digite sua glicose'
                                value={inputGlicose}
                                onChange={
                                    (event:ChangeEvent<HTMLTextAreaElement>)=>
                                    setInputGlicose(event.target.value)
                                }   
                                
                                />
                                
                                <div className={styles.checkboxArea}>
                                    <input
                                        type='checkbox'
                                        className={styles.checkbox}
                                        checked={publicGlicose}
                                        onChange={handleChangePublic}
                                    />
                                    <label>Deixar Glicose pública</label>
                                </div>
                                <button
                                className={styles.button}
                                type='submit'
                                >Cadastar</button>
                            </form>
                    </div>
                </section>

                <section className={styles.glicoseContainer}>
                    <h1>Registro de Glicose</h1>
                        {regGlicoses.map((item)=> (
                            <article key={item.id} className={styles.glicose}>
                            {item.public && (
                                <div className={styles.tagContainer}>
                                <label  className={styles.tag}>Público</label>
                                <button className={styles.shareButton} onClick={()=>handleShare(item.id)}>
                                    <FiShare2
                                        size={22}
                                        color='#3183ff'
                                    />  
                                </button>
                            </div>
                            )}

                            <div className={styles.glicoseContent}>
                                {item.public ?(
                                    <Link href={`/glicose/${item.id}`}>
                                        <p>
                                           <text className={styles.data}>{item.created.toLocaleDateString()}</text>
                                           <text className={styles.time}>{item.created.toLocaleTimeString()}</text>
                                           <text className={(item.glicose > 140) ? styles.highGlicose : styles.normalGlicose}>{item.glicose}</text>
                                           
                                        </p>
                                    </Link>
                                ):(
                                    <p>
                                        <text className={styles.data}>{item.created.toLocaleDateString()}</text>
                                        <text className={styles.time}>{item.created.toLocaleTimeString()}</text>
                                        <text className={(item.glicose > 140) ? styles.highGlicose : styles.normalGlicose}>{item.glicose}</text>
                                    </p>
                                )}
                                <button className={styles.trashButton} onClick={()=> handleDeleteGlicose(item.id)}>
                                    <FaTrash
                                     size={24}
                                     color='#ea3140'
                                     />
                                </button>
                            </div>
                        </article>
                        ))
                            
                        }

                </section>
            </main>
        </div>
    )
}

export const getServerSideProps:GetServerSideProps = async ({req,params}) =>{
    const session = await getSession({req})
    
    if (!session?.user){
        return{
            redirect:{
                destination:'/',
                permanent:false
            }
        }
    }

  
    return{
        props:{
            user:{
                email:session?.user?.email,
            
            }
  
            
            
        }
    }

   
}