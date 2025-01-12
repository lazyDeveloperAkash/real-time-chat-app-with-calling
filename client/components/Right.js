'use client'
import React, { useEffect, useState } from 'react'
import { IoIosCall } from "react-icons/io";
import { IoIosVideocam } from "react-icons/io";
import { FaPaperPlane } from "react-icons/fa";
import { useUser } from '@/providers/UserProvider';
import { useSocket } from '@/providers/SocketProviders';

const Right = () => {

    const socket = useSocket();
    const { user, chatUser, } = useUser();

    const [callType, setCallType] = useState("")
    const [message, setMessage] = useState("");

    const videoCallHandler = () => {
        socket.emit('call-init', { name: user.name, callType: "video", receaver: chatUser.contact });
    }

    const audioCallHandler = () => {
        socket.emit('call-init', { name: user.name, callType: "video", receaver: chatUser.contact });
    }
    const callTypeHandler = () => {
        if (callType === "Audio") setAudio(true);
        else setVideo(true);
    }

    // function for call initiation
    const callInit = (callType) => {
        const data = {
            receaver: chatUser.contact,
            name: chatUser.name,
            callType: callType,
            user: user.contact
        }
        socket.emit('call-init', data);
    }

    const sendMessage = (e) => {
        e.preventDefault();
        if (message.trim().length === 0) { // check null message
            setMessage("");
            return;
        } else {
            // console.log("hello")
            if (chatUser.contact) {
                console.log(message)
                socket.emit('send-message', { receaver: chatUser, message: message });
                chatUpload(false);
            }
            else {
                socket.emit('group-msg', { groupId: chatUser._id, msg: message, name: user.name, id: user._id });
                chatUpload(true);
            }
            //create div
            const parent = document.createElement("div");
            const div = document.createElement("div");
            parent.className = "flex w-full items-centre p-2";
            parent.appendChild(div);
            div.className = "font-[1.5vmax] p-[1vmax] rounded-[1.5vmax] bg-[#5757d7]";
            div.textContent = message;
            parent.appendChild(div);
            document.querySelector("#midArea").appendChild(parent);
            setMessage("");
        }
    }

    const chatUpload = (isGroup) => {
        const msg = {
            receaver: chatUser._id,
            msg: message,
            isGroup: isGroup
        }
        // dispatch(asyncChatUpload(msg));
    }

    const groupChatUpload = () => {
        const msg = {
            receaver: chatUser._id,
            msg: message,
        }
        // dispatch(asyncChatUpload(msg));
    }


    useEffect(() => {
        try {
            socket.on('new-message', ({ incomingMessage, sender }) => {
                const parent = document.createElement("div");
                const div = document.createElement("div");
                parent.className = `flex w-full items-centre justify-end p-2`;
                parent.appendChild(div);
                div.className = `font-[1.5vmax] p-[1vmax] rounded-[1.5vmax] bg-[#99999c]`;
                div.textContent = incomingMessage;
                document.querySelector("#midArea").appendChild(parent);
            })

            socket.on('group-message', ({ id, name, msg }) => {
                if (id !== user._id) {
                    const parent = document.createElement("div");
                    parent.className = `flex justify-end w-full items-centre p-2`;

                    const wrapper = document.createElement("div");
                    wrapper.className = `bg-slate-500 rounded-[1vmax]`;

                    const nameDiv = document.createElement("div");
                    nameDiv.textContent = name;
                    nameDiv.className = `text-white px-2`

                    const msgDiv = document.createElement("div");
                    msgDiv.textContent = msg;
                    msgDiv.className = `flex items-center justify-center font-[1.5vmax] px-[1vmax] py-1 rounded-[1.5vmax] bg-[#99999c]`

                    wrapper.appendChild(nameDiv);
                    wrapper.appendChild(msgDiv);

                    parent.appendChild(wrapper);
                    document.querySelector("#midArea").appendChild(parent);
                }
            })
        } catch (error) {
            console.log(error)
        }

        return () => {
            try {
                socket.off('new-message');
                socket.off('group-message');
            } catch (error) {
                console.log(error)
            }
        }
    }, [])

    useEffect(() => {

    }, [chatUser])

    return (
        <>
            {
                (<div className={`w-full h-[100vh] md:w-[70vw] md:block ${chatUser._id ? "" : "hidden"}  bg-[#312f2f]`}>
                    <div className='w-full h-[10%] flex justify-between items-center px-6'>
                        <div className='flex justify-between items-center gap-6'>
                            <div className='bg-white h-14 w-14 rounded-full cursor-pointer overflow-hidden bg-cover'><img src={chatUser && chatUser.avatar?.url} alt="" /></div>
                            <h1 className='text-xl text-white'>{chatUser && chatUser.name}</h1>
                        </div>
                        {/* {onCall ?
                        (<div className='h-[80%] w-[15vmax] rounded-full bg-slate-200 flex items-center justify-center cursor-pointer' onClick={callTypeHandler}>On {callType} Call</div>)
                        :
                        ( */}
                        <div className='flex items-center mr-6'>
                            <div className='h-12 w-12 rounded-xl hover:bg-[#4acd8d] cursor-pointer flex items-center justify-center' onClick={audioCallHandler}><IoIosCall color='white' size={25} /></div>
                            <div className='h-12 w-12 rounded-xl hover:bg-[#4acd8d] cursor-pointer flex items-center justify-center' onClick={videoCallHandler}><IoIosVideocam color='white' size={25} /></div>
                        </div>
                        {/* )
                    } */}
                    </div>
                    <div id='midArea' key={chatUser} className='h-[80%] w-full bg-[#272727] p-6 overflow-y-scroll relative removeScrollbar'>
                        {chatUser && chatUser.contact ? chatUser.chats.map((e, idx) => (
                            e.sender === user._id ?
                                (<div key={idx} className='flex w-full items-centre p-2'><div className='font-[1.5vmax] p-[1vmax] rounded-[1.5vmax] bg-[#5757d7]'>{e.msg}</div></div>)
                                : (<div key={idx} className='flex w-full items-centre p-2 justify-end'><div className='font-[1.5vmax] p-[1vmax] rounded-[1.5vmax] mr-6 bg-[#99999c]'>{e.msg}</div></div>)
                        )) : (chatUser && chatUser.chats?.map((e, idx) => (
                            e.id === user._id ?
                                (<div key={idx} className='flex w-full items-centre p-2'><div className='font-[1.5vmax] p-[1vmax] rounded-[1.5vmax] mr-6 bg-[#5757d7]'>{e.msg}</div></div>)
                                :
                                (<div key={idx} className='flex justify-end w-full items-centre p-2'>
                                    <div className='bg-slate-500 rounded-[1vmax]'>
                                        <div className='text-white px-2 text-xs'><h6>{e.name}</h6></div>
                                        <div className='flex items-center justify-center font-[1.5vmax] px-[1vmax] py-1 rounded-[1.5vmax] bg-[#99999c]'>{e.msg}</div>
                                    </div>
                                </div>)
                        )))}
                    </div>
                    <form onSubmit={sendMessage}>
                        <div className='h-[10vh] w-full flex items-center gap-4 px-[4vmax]'>
                            <textarea className='h-11 w-[60vmax] rounded-3xl border outline-none resize-none px-[2vmax] pt-[9px]' placeholder='Type your message ...' value={message} onChange={(e) => setMessage(e.target.value)}></textarea>
                            <button className='h-12 w-12 rounded-full flex items-center justify-center bg-[#4acd8d]' type='submit'><FaPaperPlane /></button>
                        </div>
                    </form>
                </div>
                )}
        </>
    )
}

export default Right