import Head from "next/head";
import styles from './styles.module.css'
import { GetServerSideProps } from "next";
import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, query, where } from "firebase/firestore";
import { db } from '../../services/firebaseConnecyion'
import { Textarea } from "@/src/components/textarea";
import { ChangeEvent, FormEvent, useState } from "react";
import { useSession } from 'next-auth/react'
import { FaTrash } from "react-icons/fa";

interface GlicoseProps{
    item:{
        glicose:number
        public:boolean
        user:string
        glicoseId:string
        created:string
    }
    allObservations: ObservationProps[] 
}

interface ObservationProps{
    id:string
    observation:string
    glicoseId:string
    user:string
    name:string
}
export default function Glicose({item, allObservations}:GlicoseProps){

    const { data:session} = useSession()
    const [input, setInput] = useState('') //inicia vazia
    const [observation, setObservation] = useState<ObservationProps[]>(allObservations || []) //inicia com todas observações ou vazia

    async function handleObservation(event:FormEvent){
        event.preventDefault()
        
        if (input==='') return
        if (!session?.user?.email || !session?.user?.name) return

        try {
           const docRef = await addDoc(collection(db,'observations'),{
            observation:input,
            created:new Date(),
            user:session?.user?.email,
            name:session?.user?.name,
            glicoseID:item?.glicoseId,

           })

           const data ={
            id:docRef.id,
            observation:input,
            glicoseId:item?.glicoseId,
            user:session?.user?.email,
            name:session?.user?.name
           
       }
       
           
           setObservation((oldItems)=>[...oldItems, data])
           setInput('')
           
        } catch (error) {
            console.log(error)
        }
    }

    async function handleDeleteObservation(id:string){
        try {
            //deleta do banco
            const docRef = doc(db,'observations',id)
            await deleteDoc(docRef)
        
            //atualiza a lista de observações
            const deletObservation = observation.filter((item)=>item.id !== id)
            setObservation(deletObservation)

        } catch (error) {
            console.log(error)
        }
                
    }

    return(
        <div className={styles.container}>
            <Head>
                <title>Observações da Glicose</title>
            </Head>
            
            <main className={styles.main}>
                <h1>{item.created}</h1>
                <article className={styles.glicose}>
                    <p className={(item.glicose >140) ? styles.highGlicose:styles.normalGlicose}>
                        Glicose: {item.glicose}
                    </p>
                </article>
            </main>

            <section className={styles.observationContainer}>
                <h2>Observações</h2>
                <form onSubmit={handleObservation}>
                    <Textarea 
                    placeholder="Digite suas observações sobre a glicose"
                    value={input}
                    onChange={(event:ChangeEvent<HTMLTextAreaElement>) => setInput(event.target.value)}
                    />
                    <button className={styles.button} disabled={!session?.user}>Salvar</button>
                </form>
            </section>

            <section className={styles.observationContainer}>
                <h2>Todas as observações</h2>
                {observation.length === 0 && (
                    <span>Nenhuma observação cadastrada</span>
                )}

                {observation.map((item)=>(
                    <article key={item.id} className={styles.observation}>
                        <div className={styles.headObservation}>
                            <label className={styles.observationLabel}>{item.name}</label>
                            {item.user === session?.user?.email && (
                                <button
                                 className={styles.buttonTrash}
                                 onClick={()=>handleDeleteObservation(item.id)}
                                 >
                                    <FaTrash size={18} color='#ea3140'/>
                                </button>
                            )}
                        </div>
                        <p>{item.observation}</p>
                    </article>
                ))}
            </section>
        </div>
    )
}


export const getServerSideProps: GetServerSideProps = async({params})=>{
    const id = params?.id as string

    const docRef = doc(db, 'glicoses', id)
     
    
    //entra em observations e retorna o que tem o id na glicoseID
    const q = query(collection(db, 'observations'), where('glicoseID', '==',id))
    const snapshotObservation = await getDocs(q)

    //array para receber o resultado da snapshotObservation
    let allObservations: ObservationProps[]=[] 

    //percorrde cada item e guarda no array
    snapshotObservation.forEach((doc)=>{
        allObservations.push({
            id:doc.id,
            observation:doc.data().observation,
            user:doc.data().user,
            name:doc.data().name,
            glicoseId:doc.data().glicoseID,
        })
    })
    

    const snapshot = await getDoc(docRef)

    if (snapshot.data() === undefined){
        return{
            redirect:{
                destination:'/',
                permanent:false
            }
        }
    }

    if (!snapshot.data()?.public){
        return{
            redirect:{
                destination:'/',
                permanent:false
            }
        }
    }
    

    const miliseconds = snapshot.data()?.created?.seconds *1000
    const glicose = {
        glicose: snapshot.data()?.glicose,
        public:snapshot.data()?.public,
        user:snapshot.data()?.user,
        glicoseId:id,
        created:new Date(miliseconds).toLocaleString()
    }
    
   
    return{
        props:{
            item:glicose,
            allObservations:allObservations
        }
    }
}