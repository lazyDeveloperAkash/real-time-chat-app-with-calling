'use client'
import { useUser } from '@/providers/UserProvider';
import Loader from './Loader';
import Login from './Login';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react'

const SignUp = () => {

    const [login, setLogin] = useState(false);
    const [loader, setLoader] = useState(false);

    const { asyncSingup } = useUser();
    const router = useRouter();

    const submitHandler = async (e) => {
        e.preventDefault();
        setLoader(!loader);
        const user = {
            name: e.target.name.value,
            email: e.target.email.value,
            contact: e.target.contact.value,
            password: e.target.password.value
        }
        const status = await asyncSingup(user);
        setLoader(!loader)
        if (status) router.push("/auth");
    }

    return (
        <div>
            <div className='w-[100vw] h-[100vh] flex items-center justify-center'>
                <div className='p-8 md:w-2/5 flex bg-white justify-center items-center flex-col rounded-2xl shadow-lg shadow-[#4acd8d]'>
                    <div className="w-full h-20 flex justify-center items-center">
                        <div className={`w-full h-4/6 rounded-xl flex justify-center items-center gap-4 cursor-pointer border-2 border-cyan-500`}>
                            <img className="h-6" src="google-logo.png" alt="" />
                            <h3>Sing up with Google</h3>
                        </div>
                    </div>
                    <div className="flex items-center justify-between w-full mt-3">
                        <div className="w-2/5 h-[1px] bg-[#545353]"></div>
                        <h1>OR</h1>
                        <div className="w-2/5 h-[1px] bg-[#4e4d4d]"></div>
                    </div>
                    <form onSubmit={submitHandler}>
                        <div className="flex flex-col gap-3 md:w-[36vw]">
                            <div>
                                <label htmlFor="">Display Name</label>
                                <input className='w-full h-10 rounded-lg	px-3 py-2 mt-1 border-2 focus:border-[#4acd8d] focus:outline-none' name='name' placeholder="John" type="text" />
                            </div>
                            <div>
                                <label htmlFor="">Contact</label>
                                <input className='w-full h-10 rounded-lg	p-3 mt-1 border-2 focus:border-[#4acd8d] focus:outline-none' name='contact' maxLength="10" placeholder="Enter Your Mobile Number" type="text" />
                            </div>
                            <div>
                                <label htmlFor="">Email</label>
                                <input className='w-full h-10 rounded-lg	p-3 mt-1 border-2 focus:border-[#4acd8d] focus:outline-none disabled:bg-slate-50 disabled:text-slate-500 disabled:border-slate-200 disabled:shadow-none invalid:border-pink-500 invalid:text-pink-600 focus:invalid:border-pink-500 focus:invalid:ring-pink-500' name='email' placeholder="Something@gmail.com" type="email" />
                            </div>
                            <div>
                                <label htmlFor="">Password</label>
                                <input className='w-full h-10 rounded-lg	p-3 mt-1 border-2 focus:border-[#4acd8d] focus:outline-none' name='password' placeholder="Password must be Strong" type="password" autoComplete='on' />
                            </div>
                            <div className="flex items-center flex-col gap-2 my-3">
                                <button type='submit' className={`px-20 py-2 rounded-3xl bg-[#4acd8d]`}>Sing Up</button>
                                <div className='w-full flex justify-center'><h3>Already Registered?</h3> <p onClick={() => setLogin(true)} className="text-cyan-400 cursor-pointer">Login</p></div>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
            {login ? <Login setLogin={setLogin} setLoader={setLoader} /> : ""}
            {loader ? <Loader /> : ""}
        </div>
    )
}

export default SignUp