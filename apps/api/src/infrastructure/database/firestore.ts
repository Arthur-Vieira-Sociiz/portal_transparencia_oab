import { cert, getApps, initializeApp } from 'firebase-admin/app'
import { getFirestore, type Firestore } from 'firebase-admin/firestore'
import { readEnvironment } from '../../environment.js'

let clienteFirestore: Firestore | undefined

// Cria uma única conexão do Admin SDK para toda a API.
export function getFirestoreClient(): Firestore {
  if (clienteFirestore) return clienteFirestore

  // O cliente do Firestore não depende das variáveis do banco antigo.
  const { firebase } = readEnvironment(process.env, {
    requireDatabase: false,
  })
  if (!firebase) {
    throw new Error('As credenciais do Firebase não foram configuradas.')
  }

  const aplicacao =
    getApps()[0] ??
    initializeApp({
      credential: cert({
        projectId: firebase.projectId,
        clientEmail: firebase.clientEmail,
        privateKey: firebase.privateKey,
      }),
      projectId: firebase.projectId,
    })
  clienteFirestore = getFirestore(aplicacao)
  return clienteFirestore
}
