'use client'
import { useUser } from '@/providers/UserProvider'
import axios from '@/utils/axios'
import React, { useState } from 'react'
import { CiSearch } from 'react-icons/ci'
import { IoMdClose } from 'react-icons/io'
import InviteModal from './InviteModal'


const newChat = ({ setNewChat }) => {

    const [contacts, setContacts] = useState([]);
    const [input, setInput] = useState("");
    const [invite, setInvite] = useState(false);

    const { setFriendArray, setChatUser } = useUser();

    const sendnumberHandler = async (e) => {
        setInput(e.target.value);
        if (e.target.value.length === 0) {
            setContacts([]);
            return;
        }
        if (e.target.value.length % 3 === 0) {
            try {
                let { data } = await axios.get(`/invite/${e.target.value}`);
                setContacts(data.users);
            } catch (error) {
                console.log(error)
            }
        }
    }

    const chatHandler = async (newUser) => {
        setFriendArray((oldFriend) => [newUser, ...(oldFriend ?? [])]);
        setChatUser(newUser);
        setNewChat(false);
    }

    return (
        <div className='h-[100vh] w-[100vw] md:w-[30vw] bg-[#000000fb] relative overflow-hidden'>
            <div className='w-full'>
                <div className='w-full flex justify-end p-4'><div className='cursor-pointer' onClick={() => setNewChat(false)}><IoMdClose color='white' size={25} /></div></div>
                <h1 className='text-white m-5 text-2xl'>Serch New Person</h1>
                <div className='w-full px-4 relative inline-block mt-2'>
                    <input className='w-full h-10 rounded-xl px-4 border-none outline-none' type="text" placeholder='Type Number...' onChange={sendnumberHandler} />
                    <div className='absolute top-1/2 right-8 transform -translate-y-1/2 cursor-pointer'><CiSearch size={25} /></div>
                </div>
                <div className='w-full h-[78vh] px-4 flex flex-col gap-4 overflow-y-auto pt-2 removeScrollbar'>
                    {contacts.length === 0 ?
                        (input.length === 10 &&
                            <div className='border-black hover:bg-black rounded-xl flex items-center justify-between px-3 py-4'>
                                <h1 className='ml-5 text-2xl text-white'>{input}</h1>
                                <h1 className='text-[#4acd8d] cursor-pointer' onClick={() => setInvite(true)}>Invite</h1>
                            </div>
                        ) : (
                            contacts && contacts.map((newUser, idx) => (
                                <div key={idx} className='border-black hover:bg-black rounded-xl flex items-center justify-between px-3 py-4'>
                                    <div >
                                        <h1 className='ml-5 text-2xl text-white'>{newUser.name}</h1>
                                        <h6 className='ml-5 text-sm text-gray-300'>{newUser.contact}</h6>
                                    </div>
                                    <h1 className='text-[#4acd8d] cursor-pointer' onClick={() => chatHandler(newUser)}>Chat</h1>
                                </div>
                            ))
                        )}
                </div>
            </div>
            {invite && <InviteModal inviteLink={"hey"} setInvite={setInvite} />}
        </div>
    )
}

export default newChat