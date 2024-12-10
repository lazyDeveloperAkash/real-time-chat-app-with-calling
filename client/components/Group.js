'use client'
// import { asyncAllUser, asynccreateGroup } from '@/store/Actions/userActions';
import axios from '@/utils/axios'
import React, { useState } from 'react'
import { CiSearch } from 'react-icons/ci';
import { FaPlus } from 'react-icons/fa6';
import { IoMdClose } from 'react-icons/io';
import { useDispatch, useSelector } from 'react-redux';

const group = ({ setgroup }) => {

    const { user, asynccreateGroup } = userProvider();
    const [nameArr, setNameArr] = useState([{ name: user.name, id: user._id }]);
    const [contacts, setContacts] = useState([]);
    const dispatch = useDispatch();

    const createGroup = async () => {
        const groupName = window.prompt("Enter Group Name");
        const groupInfo = {
            userArr: nameArr.map(({ id }) => id),
            name: groupName
        }
        await asynccreateGroup(groupInfo);
        setgroup(false);
    }

    const enterGroup = (id, name) => {
        setNameArr((preArr) => [...preArr, { name, id }]);
    }

    const removeGroup = (id) => {
        setNameArr((prevArray) => prevArray.filter((item) => item.id !== id));
    }

    const sendnumberHandler = async (e) => {
        if (e.target.value.length % 3 === 0) {
            try {
                const { data } = await axios.post("/invite", { contact: e.target.value });
                setContacts(data.user);
            } catch (error) {
                console.log(error);
            }
        }
    }


    return (
        <div className='h-[100vh] w-[100vw] md:w-[30vw] bg-[#000000d3] relative overflow-hidden'>
            <div className='w-full flex justify-end p-4'><div className='cursor-pointer' onClick={() => setgroup(false)}><IoMdClose color='white' size={25} /></div></div>
            <div className='flex items-center justify-between w-full p-3'>
                <h1 className='text-white text-2xl'>Create Group</h1>
                <button className='px-4 py-2 bg-[#4acd8d] rounded-2xl' onClick={createGroup}>Create</button>
            </div>
            <div className='flex m-3 text-white'>{nameArr.map((e, idx) => (<h3 key={idx}>{user._id != e.id ? (e.name + (idx < nameArr.length - 1 ? `, ` : "")) : "You, "}</h3>))}</div>
            <div className='w-full px-4 relative inline-block mt-2'>
                <input className='w-full h-10 rounded-xl px-4 border-none outline-none' type="text" placeholder='Search Number' onChange={sendnumberHandler} />
                <div className='absolute top-1/2 right-8 transform -translate-y-1/2 cursor-pointer'><CiSearch size={25} /></div>
            </div>
            <div className='w-full h-[78%] px-4 flex flex-col gap-4 overflow-y-auto pt-2 removeScrollbar'>
                {user && user.friend.map((e, idx) =>
                    <div key={idx} className='border-black hover:bg-black rounded-xl flex items-center justify-between px-3 py-4'>
                        <h1 className='ml-5 text-2xl text-white'>{e.name}</h1>
                        <h1 className='text-[#4acd8d] cursor-pointer'>{nameArr.some(pre => pre.id === e._id) ? <IoMdClose color='white' size={20} onClick={() => removeGroup(e._id)} /> : <FaPlus color='white' size={20} onClick={() => enterGroup(e._id, e.name)} />}</h1>
                    </div>
                )}
                {contacts && contacts.map((e, idx) => (
                    <div key={idx} className='border-black hover:bg-black rounded-xl flex items-center justify-between px-3 py-4'>
                        <h1 className='ml-5 text-2xl text-white'>{e.name}</h1>
                        <h1 className='text-[#4acd8d] cursor-pointer' onClick={() => enterGroup(e._id, e.name)}><FaPlus color='white' size={20} /></h1>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default group