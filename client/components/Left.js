'use client'
import React, { useEffect, useState } from 'react'
import { CiSearch } from "react-icons/ci";
import { TbMessage2Plus } from "react-icons/tb";
import Profile from './Profile';
// import { useDispatch, useSelector } from 'react-redux';
// import { asyncChatUser, asyncGroupDetails } from '@/store/Actions/userActions';
import { FaPlus } from "react-icons/fa6";
import { useUser } from '@/providers/UserProvider';
import Group from './Group'

const left = (props) => {

  const { user, chatUser } = useUser();

  const { setNewChat, setClickedId, clickedId, friendArr } = props;

  const [profile, setProfile] = useState(false);
  const [group, setgroup] = useState(false);
  // const [isVisible, setIsVisible] = useState(clickedId ? false : true)
  // const dispatch = useDispatch();

  const chatHandler = (user) => {
    // setClickedId(user._id);
    
  }

  const groupChatHandler = (id) => {
      dispatch(asyncGroupDetails(id));
      setClickedId(id);
  }

  // useEffect(() => {}, [user]);
  

  return (
    <div className={`h-[100vh] w-[100vw] min-w-[30vmax] md:w-[30vw] bg-[#000000d3] relative`}>
      {profile ? <Profile setProfile={setProfile} /> : ""}
      {group ? <Group setgroup={setgroup} user={user} /> : ""}
      <div className='w-full h-[22%] pt-5'>
        <div className='w-full flex items-center px-4 justify-between'>
          <div className='w-full flex items-center'>
            <div className='bg-white h-[56px] w-[56px] rounded-full cursor-pointer overflow-hidden bg-cover' onClick={() => setProfile(true)}>
              <img src={user && user.avatar.url} alt="" />
            </div>
            <h1 className='ml-5 text-xl text-white'>hey, {user && user.name}</h1>
          </div>
          <div className='flex items-center cursor-pointer' onClick={() => setgroup(true)}><FaPlus color='white' size={20} /></div>
        </div>
        <div className='w-full px-4 relative inline-block mt-2'>
          <input className='w-full h-10 rounded-xl px-4 border-none outline-none' type="text" placeholder='Search' />
          <div className='absolute top-1/2 right-8 transform -translate-y-1/2 cursor-pointer'><CiSearch size={25} /></div>
        </div>
      </div>
      <div className={`w-full h-[78%] px-4 flex flex-col gap-4 overflow-y-auto pt-2 removeScrollbar`}>
        {friendArr && friendArr.map((e, idx) => (
          <div key={idx} className={`hover:bg-black cursor-pointer rounded-xl flex items-center px-3 py-2 ${e._id === clickedId ? 'bg-black' : ""}`} onClick={() => chatHandler(e)}>
            <div className='bg-white h-12 w-12 rounded-full cursor-pointer overflow-hidden bg-cover'><img src={e.avatar?.url} alt="" /></div>
            <h1 className='ml-5 text-xl text-white'>{e.name}</h1>
          </div>
        ))}
        {/* {user && user.groups.map((e, idx) => (
          <div key={idx} className={`hover:bg-black cursor-pointer rounded-xl flex items-center px-3 py-2 ${e._id === clickedId ? 'bg-black' : ""}`} onClick={() => groupChatHandler(e._id)}>
            <div className='bg-white h-12 w-12 rounded-full cursor-pointer overflow-hidden bg-cover'><img src={e.avatar?.url} alt="" /></div>
            <h1 className='ml-5 text-xl text-white'>{e.name}</h1>
          </div>
        ))} */}
      </div>
      <div className='absolute top-[80%] right-[10%] flex items-center justify-center w-16 h-16 rounded-full bg-[#4acd8d] cursor-pointer' onClick={() => setNewChat(true)}><TbMessage2Plus color='white' size={30} /></div>
    </div>
  )
}

export default left