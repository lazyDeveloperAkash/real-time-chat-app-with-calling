'use client'
import React, { useEffect, useRef, useState } from 'react'
import { IoMdClose } from "react-icons/io";
import { HiMiniMinus } from "react-icons/hi2";
import { IoVideocamOff } from "react-icons/io5";
import { IoMdMicOff } from "react-icons/io";
import { HiPhoneMissedCall } from "react-icons/hi";
import { LuRectangleHorizontal } from "react-icons/lu";
import Draggable from 'react-draggable';
import { Resizable } from 'react-resizable';


const Video = (props) => {
    const { setVideo, setOnCall, callerContact, isOutgoingCall, setIsOutgoingCall, remotePeerId, peer, socket } = props;
    const [activeDrags, setActiveDrags] = useState(0);
    const [size, setSize] = useState({ width: 90, height: 90 });
    const draggableRef = useRef(null);
    // const stream = useRef(null);
    // const call = useRef(null);
    var stream = null;
    var call = null;

    const onResize = (event, { size }) => {
        setSize(size);
    };

    const onStart = () => {
        setActiveDrags((prevDrags) => prevDrags + 1);
    };

    const onStop = () => {
        setActiveDrags((prevDrags) => prevDrags - 1);
    };

    const dragHandlers = { onStart, onStop };
    //w-[${size.width}vw] h-[${size.height}vh]

    const closeHandler = () => {
        peer.destroy();
        setVideo(false);
        setOnCall(false);
        socket.emit('call-disconect', { contact: callerContact });
        stream && stream.getTracks().forEach((track) => track.stop());
    }

    useEffect(() => {
        try {
            if (typeof window !== 'undefined' && remotePeerId) {
                (async () => {
                    let localstream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                    document.querySelector("#localVideo").srcObject = localstream;
                    const call = peer.call(remotePeerId, localstream);
                    call.on('stream', (remoteStream) => {
                        document.querySelector("#remoteVideo").srcObject = remoteStream;
                    })
                })();
            }
        } catch (error) {
            console.log(error)

        }

        peer.on('call', async (Call) => {
            call = Call;
            let localstream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            stream = localstream;
            document.querySelector("#localVideo").srcObject = localstream;
            Call.answer(localstream);
            Call.on("stream", (remoteStream) => {
                document.querySelector("#remoteVideo").srcObject = remoteStream;
            })
        })

        socket.on('call-disconect', async (res) => {
            console.log(call)
            call && call.close();
            stream && stream.getTracks().forEach((track) => track.stop());
            console.log("first")
            setVideo(false);
            setOnCall(false);
        })
        return () => {
            // peer.destroy();
        }
    }, [remotePeerId])


    return (
        <>
            <Draggable handle="strong" {...dragHandlers} nodeRef={draggableRef}>
                {/* <Resizable height={size.height} width={size.width} onResize={onResize} handle={<div className="draggable-handle">Resize Handle</div>}> */}
                <div ref={draggableRef} className={`absolute h-full w-full md:w-1/2 md:h-[60%] md:rounded-2xl bg-slate-400 overflow-hidden`}>
                    <strong className="cursor-pointer">
                        <div className='w-full h-8 flex items-center justify-end'>
                            <div className='h-full w-10 hover:bg-gray-500 flex justify-center items-center rounded-sm' onClick={() => setVideo(false)}><HiMiniMinus /></div>
                            <div className='h-full w-10 hover:bg-gray-500 flex justify-center items-center rounded-sm' onClick={() => setSize({ width: 100, height: 100 })}><LuRectangleHorizontal /></div>
                            <div className='h-full w-10 hover:bg-red-600 flex justify-center items-center rounded-sm' onClick={closeHandler}><IoMdClose /></div>
                        </div>
                    </strong>
                    <div className='flex-col flex items-center justify-end w-full h-[80%] md:h-[70%] relative'>
                        <div className='md:h-[90%] h-full w-[95%] bg-black rounded-xl relative'><video className='rounded-xl' autoPlay playsInline id='remoteVideo' src="" /></div>
                        <div className='absolute h-[30%] w-[40%] md:w-[25%] bg-red-300 rounded-xl bottom-2 left-[5%] md:top-[2%] md:right-0'><video className='rounded-xl' autoPlay playsInline id='localVideo' src="" /></div>
                    </div>
                    <div className='w-full h-[15%] md:h-[20%] flex items-center justify-center'>
                        <div className='flex items-center justify-center gap-[2vmax] rounded-full h-[40%] md:h-[60%] bg-red-200 px-[10%]'>
                            <div className='h-[5vmax] w-[5vmax] md:h-[4vmax] md:w-[4vmax] lg:h-[3vmax] lg:w-[3vmax] rounded-full flex items-center justify-center bg-gray-400'><IoVideocamOff /></div>
                            <div className='h-[90%] w-[10vmax] rounded-full flex items-center justify-center bg-red-600' onClick={closeHandler}><HiPhoneMissedCall/></div>
                            <div className='h-[5vmax] w-[5vmax] md:h-[4vmax] md:w-[4vmax] lg:h-[3vmax] lg:w-[3vmax] rounded-full flex items-center justify-center bg-gray-400'><IoMdMicOff /></div>
                        </div>
                    </div>
                </div>
                {/* </Resizable> */}
            </Draggable>
        </>
    )
}

export default Video