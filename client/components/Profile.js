'use client'
import React, { useRef, useState } from 'react'
import { IoMdClose } from 'react-icons/io'
import { MdEdit } from "react-icons/md";
import { useRouter } from 'next/navigation';
import { useUser } from '@/providers/UserProvider';
import Loader from './Loader';

const Profile = ({ setProfile }) => {

    const { user, loading, asyncSingout, asyncUpdateUser, asyncAvatar } = useUser();

    const buttonRef = useRef(null);
    const inputRef = useRef(null);

    const router = useRouter();
    const [changePassword, setChangePassword] = useState(false);
    const [profileData, setProfileData] = useState({
        name: user && user.name,
        contact: user && user.contact,
        email: user && user.email
    })
    // for write button to input tag
    const [writeable, setWriteable] = useState({
        name: false,
        email: false,
        contact: false
    });

    const submitHandler = async (e) => {
        e.preventDefault();
        await asyncUpdateUser(profileData);
        setWriteable({ name: false, contact: false, email: false });
    }

    const avatarHandler = async (e) => {
        e.preventDefault();
        if (!e.target) return;
        const formData = new FormData(e.target);
        formData.set("avatar", e.target.avatar.files[0]);
        if (formData) await asyncAvatar(formData);
    }

    const signOutHandler = async () => {
        const res = await asyncSingout();
        if (res) router.push("/");
    }

    return (
        <div onClick={(e) => e.target.id === 'profile-container' && setProfile(false) } id='profile-container' className='absolute z-10 h-[100vh] w-[100vw] flex items-center justify-center bg-[#0000007f] overflow-hidden'>
            <div className='w-full md:w-[30vmax] rounded-2xl px-4 bg-black'>
                <div className='w-full flex justify-end p-4 pb-0'>
                    <div className='flex gap-4 items-center'>
                        <button className='px-4 py-2 rounded-3xl bg-red-500' onClick={signOutHandler}>SingOut</button>
                        <div onClick={() => setProfile(false)}><IoMdClose className='cursor-pointer' color='white' size={25} /></div>
                    </div>
                </div>
                <h1 className='text-white mx-5 text-2xl'>Profile</h1>
                <div className='w-full flex items-center justify-center'>
                    <form onSubmit={avatarHandler}>
                        <div onClick={() => inputRef.current.click()}>
                            <div className='h-[30vmax] w-[30vmax] md:h-[12vmax] md:w-[12vmax] rounded-full bg-green-400 cursor-pointer overflow-hidden bg-cover'>
                                <img className='h-full' src={user && user?.avatar?.url || 'blankimage.png'} />
                            </div>
                            <input ref={inputRef} className='w-0 h-0' type="file" onChange={() => buttonRef.current.click()} />
                            <button ref={buttonRef} className='h-0 w-0' type='submit'></button>
                        </div>
                    </form>
                </div>
                <form onSubmit={submitHandler}>
                    <div className="flex flex-col gap-3 w-full text-white">
                        {writeable.name ? (<div>
                            <label htmlFor="">Display Name</label>
                            <input className='w-full h-10 rounded-lg px-3 py-2 mt-1 border-2 focus:border-[#4acd8d] focus:outline-none text-black' name='name' value={profileData.name} placeholder="John" type="text" onChange={(e) => setProfileData((profileData) => ({ ...profileData, name: e.target.value }))} />
                        </div>) : (<div className='flex items-center justify-between text-2xl'><h1>{profileData.name}</h1> <MdEdit className='cursor-pointer' onClick={() => { setWriteable((writeable) => ({ ...writeable, name: true })) }} /> </div>)}
                        {writeable.contact ? (<div>
                            <label htmlFor="">Contact</label>
                            <input className='w-full h-10 rounded-lg p-3 mt-1 border-2 focus:border-[#4acd8d] focus:outline-none text-black' name='contact' value={profileData.contact} placeholder="Enter Your Mobile Number" type="number" onChange={(e) => setProfileData((profileData) => ({ ...profileData, contact: e.target.value }))} />
                        </div>) : (<div className='flex items-center justify-between text-xl'><h1>{profileData.contact}</h1> <MdEdit className='cursor-pointer' onClick={() => { setWriteable((writeable) => ({ ...writeable, contact: true })) }} /> </div>)}
                        {writeable.email ? (<div>
                            <label htmlFor="">Email</label>
                            <input className='w-full h-10 rounded-lg	p-3 mt-1 border-2 focus:border-[#4acd8d] focus:outline-none disabled:bg-slate-50 disabled:text-slate-500 disabled:border-slate-200 disabled:shadow-none invalid:border-pink-500 invalid:text-pink-600 focus:invalid:border-pink-500 focus:invalid:ring-pink-500 text-black' name='email' value={profileData.email} placeholder="Something@gmail.com" type="email" onChange={(e) => setProfileData((profileData) => ({ ...profileData, email: e.target.value }))} />
                        </div>) : (<div className='flex items-center justify-between text-lg'><h1>{profileData.email}</h1> <MdEdit className='cursor-pointer' onClick={() => { setWriteable((writeable) => ({ ...writeable, email: true })) }} /> </div>)}
                        <div className="flex items-center flex-col gap-2 my-3">
                            <button type='submit' className={`px-20 py-2 rounded-3xl ${(writeable.name || writeable.contact || writeable.email) ? "bg-yellow-300 cursor-pointer" : "bg-yellow-200 cursor-none"}`}>Save Edit</button>
                            <div className='w-full flex justify-center'><p>Want to</p> <p onClick={() => setChangePassword(true)} className="text-red-500 cursor-pointer">Change Password</p></div>
                        </div>
                    </div>
                </form>
            </div>
            {loading && <Loader />}
        </div>
    )
}

export default Profile