"use client"
import React, { useState } from 'react'
import Forget from './Forget';
import { useRouter } from 'next/navigation';
import { IoMdClose } from 'react-icons/io';
import { useUser } from '@/providers/UserProvider';

const Login = ({ setLogin, setLoader }) => {

    const { asyncSinginEmailOrContact } = useUser();
    const [forgetPass, setForgetPass] = useState(false);
    const router = useRouter();

    const loginSubmitHandler = async (e) => {
        e.preventDefault();
        console.log(e.target.emailOrContact.value)
        setLoader(true)
        const res = await asyncSinginEmailOrContact(e.target.emailOrContact.value, e.target.password.value);
        setLoader(false);
        if (res) router.push("/auth");
    }

    return (
        <>
            <div className={`absolute top-0 w-full z-10 h-[100vh] flex items-center justify-center bg-[#0000001a]`}>
                <div className={`w-[11/12] md:w-[60vmax] lg:w-[30vmax] bg-white p-3 flex flex-col items-center gap-8 border rounded-xl shadow-lg shadow-[#4acd8d]`}>
                    <div className="flex items-center justify-end w-full">
                        <div onClick={() => setLogin(false)} className='cursor-pointer'><IoMdClose size={25} /></div>
                    </div>
                    <h1 className="text-[6vmax] md:text-[2vmax]">Login</h1>
                    <form onSubmit={loginSubmitHandler}>
                        <div className="w-full flex flex-col gap-5">
                            <div>
                                <label htmlFor="">Email or Contact</label>
                                <input className='w-full h-10 rounded-lg p-3 mt-1 border-2 focus:border-[#4acd8d] focus:outline-none' name='emailOrContact' placeholder="Enter Your email or contact" type="text" />
                            </div>
                            <div>
                                <label htmlFor="">Password</label>
                                <input className='w-full h-10 rounded-lg p-3 mt-1 border-2 focus:border-[#4acd8d] focus:outline-none' name='password' placeholder="Password must be Strong" type="password" autoComplete='on' />
                                <div className="w-full flex justify-end mt-2"><p className="text-cyan-400 cursor-pointer" onClick={() => setForgetPass(true)} >Forgot Password?</p></div>
                            </div>
                            <div className="flex items-center flex-col gap-2 my-3">
                                <button type='submit' className={`px-20 py-2 rounded-3xl bg-[#4acd8d]`}>Login</button>
                                <div className='flex justify-center'><h3>New User?</h3><p onClick={() => setLogin(false)} className="text-cyan-400 cursor-pointer">Register</p></div>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
            {forgetPass ? <Forget setForgetPass={setForgetPass} /> : ""}
        </>
    )
}

export default Login