import { useState, useRef } from 'react'
// firebase SDK
import firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/firestore'

// react-firebase hooks
import { useAuthState } from 'react-firebase-hooks/auth'
import { useCollectionData } from 'react-firebase-hooks/firestore'

import './App.css'

firebase.initializeApp({
  apiKey: 'AIzaSyBYmnEXNCoQhWnVDpddl5YHIeLznPX5qkc',
  authDomain: 'chat-henry-v-test.firebaseapp.com',
  projectId: 'chat-henry-v-test',
  storageBucket: 'chat-henry-v-test.appspot.com',
  messagingSenderId: '915180927713',
  appId: '1:915180927713:web:50779eeed839957653d5a0',
  measurementId: 'G-PESJEJPCPM',
})

const auth = firebase.auth()
const firestore = firebase.firestore()

function App() {
  const [user] = useAuthState(auth)

  return (
    <div className="App">
      <header>
        <h1>⚛️🔥💬</h1>
        <SignOut />
      </header>

      <section>{user ? <ChatRoom /> : <SignIn />}</section>
    </div>
  )
}

function SignIn() {
  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider()
    auth.signInWithPopup(provider)
  }

  return <button onClick={signInWithGoogle}>Sign In With GOOGLE</button>
}

function SignOut() {
  return (
    auth.currentUser && <button onClick={() => auth.signOut()}>Sign Out</button>
  )
}

function ChatRoom() {
  const dummy = useRef()

  const messagesRef = firestore.collection('messages')
  const query = messagesRef.orderBy('createdAt').limit(25)

  const [messages] = useCollectionData(query, { idField: 'id' })

  const [formValue, setFormValue] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    const { uid, photoURL } = auth.currentUser

    // writes a new document to firestore
    await messagesRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL,
    })
    setFormValue('')
    dummy.current.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <>
      <main>
        {messages &&
          messages.map((msg) => <ChatMessage key={msg.id} message={msg} />)}

        <span ref={dummy}></span>
      </main>

      <form onSubmit={handleSubmit}>
        <input
          value={formValue}
          onChange={(e) => setFormValue(e.target.value)}
          placeholder="say something nice"
        />

        <button type="submit" disabled={!formValue}>
          🕊️
        </button>
      </form>
    </>
  )
}

function ChatMessage(props) {
  const { text, uid, photoURL, id } = props.message

  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received'

  return (
    <>
      <div key={`it_${id}`} className={`message ${messageClass}`}>
        <img
          src={
            photoURL ||
            'https://miro.medium.com/max/720/1*W35QUSvGpcLuxPo3SRTH4w.png'
          }
          alt="User"
        />
        <p>{text}</p>
      </div>
    </>
  )
}

export default App
