import Head from 'next/head'
import styles from './styles.module.css'
import {AiOutlineSearch} from 'react-icons/ai'
import React, { useState } from 'react';
import { GetServerSideProps } from 'next';
import { getSession } from 'next-auth/react';

import { Chart as ChartJS, defaults } from 'chart.js/auto';
import { Line  } from 'react-chartjs-2';



import { collection, onSnapshot, orderBy, query, where } from 'firebase/firestore';
import { db } from '@/src/services/firebaseConnecyion';

defaults.maintainAspectRatio=false;
defaults.responsive=true;

defaults.plugins.title.display=true;
defaults.plugins.title.align='start';


interface HomeProps{
  user:{
    email:string
  }
}

interface regGlicoseProps{
  id:string,
  created:Date,
  glicose:Number,
  user:string
}


export default function Chart({user}:HomeProps){
    const [inputDateInicio, setInputDateInicio]= useState('')
    const [inputDateFinal, setInputDateFinal] = useState('')  
    const [glicoses,setGlicoses] = useState<regGlicoseProps[]>([])     
    

     async function plotChart(){
    
          if (inputDateInicio === '' || inputDateFinal ==='')
          return alert('Informe a data inicial e final')

          if (inputDateInicio > inputDateFinal)
          return alert('Informe a data inicial correta - Não pode ser superior a data final')

          //transforma a data do calendário para TimeStamp
          //Soma para dar o dia 2023/xx/xx 00:00:01
          const timeStampDateInicial = (Date.parse(inputDateInicio)/1000) +  10801
          
          //Soma para dar o dia 2023/xx/xx 00:59:59
          const timeStampDateFinal =  (Date.parse(inputDateFinal)/1000) + 97199
          
                         
          //Busca do banco as glicoses no intervalo da data solicitada
          const glicoseRef = collection(db,'glicoses')
          const q = query(
            glicoseRef,
            orderBy('created','asc'),
            where ('user', '==', user?.email),
          
          )
        
          onSnapshot(q,(snapshot)=>{
            let lista = [] as regGlicoseProps[]

            
            snapshot.forEach((doc)=>{
              //Formata a data - Passa de timestampo para FRI OCT 06 2023 20:43:53 GMT-0300
              const miliseconds = doc.data().created.seconds *1000
              const createdFormat = new Date(miliseconds)


              lista.push({
                id:doc.id,
                glicose:doc.data().glicose,
                user:doc.data().user,
                created:new Date(createdFormat)
                
              })

            })
            
        
            //busca o intervalo de data selecioando
            function retornaPesquisa(data:any){

              //tranforma a data para TimeStamp - Assim faz a comparação do intervalo
              const timeStampCreated = (Date.parse(data.created)/1000)
              
              //busca os dados no  intervalo de data selecioando
              if (timeStampCreated >= timeStampDateInicial && timeStampCreated <=timeStampDateFinal) 
              return data
            
            }
          
              const glicoses = lista.filter(retornaPesquisa)
              setGlicoses(glicoses)
                    
          })
   
  }

    
   return(
    <div className={styles.container}>
        <Head>
            <title>Gráfico da Glicose</title>
        </Head>

        <main className={styles.main}>
            <h1 className={styles.title}>Gráfico da sua Glicose</h1>
            <div className={styles.date}>
                <div className={styles.dateInicial}>
                  <p>Data inicial</p>
                  <input 
                  type='date'
                  value={inputDateInicio}
                  onChange={(e) => setInputDateInicio(e.target.value)}
                  
                  />
                </div>
                
                <div className={styles.dateFinal}>
                  <p>Data Final</p>
                  <input
                   type='date'
                   value={inputDateFinal}
                   onChange={(e) => setInputDateFinal(e.target.value)}
                   
                   />
                  
                </div>
                
                <div>
                  <button className={styles.searchButton} onClick={() => plotChart()}>
                    <AiOutlineSearch
                      size={28}
                     color='#ea3140'
                    />
                  </button>
                </div>
                
            </div>
           
        </main>

        <section className={styles.chartContainer}>
            <div>
                <Line
                  data={{
                    labels:glicoses.map((data)=>data.created.toLocaleDateString()),
                    datasets:[
                              {
                                label:'Glicose',
                                data:glicoses.map((data)=>data.glicose),
                                backgroundColor:'#ea3140',
                                borderColor:'black'
                              },
                   ]
                  }}
                
                />
            </div>
        
        </section>
    </div>
   )
}

export const getServerSideProps:GetServerSideProps = async({req,params}) =>{
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
        email:session?.user?.email
      }
    }
  }
}
