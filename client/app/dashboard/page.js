'use client'
import React, { useEffect, useRef, useState, lazy, Suspense, useMemo, useCallback } from 'react'
import socketIo from 'socket.io-client';
import BlankRight from '@/components/BlankRight'
import LeftSkeleton from '@/components/skeletons/LeftSkeleton'
import RightSkeleton from '@/components/skeletons/RightSkeleton'
import { useUser } from '@/providers/UserProvider';
import { useSocket } from '@/providers/SocketProviders';
import peer from '@/sevices/peer';
const Left = lazy(() => import('@/components/Left'))
const Right = lazy(() => import('@/components/Right'))
const Video = lazy(() => import('@/components/Video'))
const Audio = lazy(() => import('@/components/Audio'))
const NewChat = lazy(() => import('@/components/NewChat'))

const page = () => {
  // const ENDPOINT = 'http://localhost:8080'
  // const socket = useMemo(() => socketIo(ENDPOINT, { path: '/socket', transports: ['websocket'] }), []);

  // const [user, setUser] = useState(useSelector(state => state.userReducers.user));

  const { user, chatUser } = useUser();

  const socket = useSocket();
  if (user) socket.emit("storeClientInfo", { contact: user.contact }); // store user socket id on backend

  const [friendArr, setFriendArr] = useState(user && user.friend);
  const [audio, setAudio] = useState(false);
  const [video, setVideo] = useState(false);
  const [onCall, setOnCall] = useState(false);
  const [newChat, setNewChat] = useState(false);
  const [clickedId, setClickedId] = useState("");
  const [isOutgoingCall, setIsOutgoingCall] = useState(false); // incoming or outgoing call to send data to video component
  // const [isGroupInfoStored, setIsGroupInfoStored] = useState(false);
  const [remotePeerId, setRemotePeerId] = useState("");
  const [isPeerAvailable, setIsPeerAvailable] = useState(null);
  const [callerContact, setCallerContact] = useState("");
  const remotePeer = useRef(null);
  const [peerStream, setPeerStream] = useState(null);

  useEffect(() => {

    // incoming call
    socket.on('incoming-call', async ({ callerName, callType, callerContact }) => {
      if (window.confirm(`${caller.callType} Call from ${callerName}`)) {
        const ans = await peer.getAnsweer(offer);
        socket.emit('call-accepted', { peerId: isPeerAvailable.id, contact: caller.contact, name: user.name });
        if (callType === 'Video') setVideo(true);
        else setAudio(true);
      } else socket.emit('call-rejected', { peerId: null, contact: caller.contact, name: user.name });
    })

    // after accepting call

    return () => {
      socket.off("incoming-call");
    }
  }, [third])




  // useEffect(() => {
  //   const fetchUser = async () => {
  //     if (!user) {
  //       const userData = await dispatch(asyncCurrentUser());
  //       setUser(userData);
  //       setFriendArr(userData && userData.friend)
  //     }
  //   };

  //   fetchUser();
  // }, [user]);

  // useEffect(() => {
  //   // if (user) socket.emit("storeClientInfo", { contact: user.contact });
  //   if (!isGroupInfoStored) {
  //     let idArr = [];
  //     user && user.groups.map((e) => {
  //       idArr.push(e._id);
  //     })
  //     socket.emit("join-to-room", { rooms: idArr });
  //   }
  //   return () => socket.off("storeClientInfo");
  // }, [socket.id, user])

  // useEffect(() => {

  //   if (!isPeerAvailable) {
  //     var peer = new Peer();
  //     peer.on('open', () => {
  //       setIsPeerAvailable(peer);
  //     })
  //   }

  //   socket.on('room-status', ({ res }) => setIsGroupInfoStored(res));

  //   socket.on('incoming-call', (caller) => {
  //     if (window.confirm(`${caller.callType} Call from ${caller.name}`)) {
  //       if (caller.callType === 'Video') setVideo(true);
  //       else setAudio(true);
  //       socket.emit('call-status', { peerId: isPeerAvailable.id, contact: caller.contact, name: user.name });
  //     } else socket.emit('call-status', { peerId: null, contact: caller.contact, name: user.name });
  //   })

  //   socket.on('call-status', (data) => {
  //     if (data.peerId) {
  //       setIsOutgoingCall(true);
  //       setRemotePeerId(data.peerId);
  //       remotePeer.current = data.peerId;
  //       setCallerContact(data.contact);
  //     }
  //     else {
  //       setVideo(false);
  //       setOnCall(false);
  //       toast.info(`call rejected by ${data.name}`);
  //     }
  //   })

  //   return () => {
  //     socket.off('incoming-call');
  //     socket.off('call-status');
  //     socket.off('room-status');
  //   }
  // }, [isPeerAvailable])

  const callHandler = useCallback(async (callType) => {
    const userMedia = await navigator.mediaDevices.getUserMedia({ audio: true, video: callType === 'video' ? true : false });

    const offer = await peer.getOffer();
    socket.emit('call-init', { name: user.name, callerContact: user.contact, callType, receaver: chatUser.contact, offer });
  }, [])



  return (
    <>
      <div className='flex relative overflow-hidden'>
        {newChat ?
          <Suspense fallback={<LeftSkeleton />}>
            <NewChat setFriendArr={setFriendArr} setNewChat={setNewChat} />
          </Suspense>
          :
          <Suspense fallback={<LeftSkeleton />}>
            <Left setNewChat={setNewChat} />
          </Suspense>
        }
        {chatUser ?
          <Suspense fallback={<RightSkeleton />}>
            <Right />
          </Suspense>
          : <BlankRight />}
        {video ?
          <Suspense fallback={<div>loading...</div>}>
            <Video peerStream={peerStream} />
          </Suspense>
          : ""}
        {audio ?
          <Suspense fallback={<div>loading...</div>}>
            <Audio setAudio={setAudio} setOnCall={setOnCall} />
          </Suspense>
          : ""}
      </div>
    </>
  )
}

export default page