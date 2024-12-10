import React from 'react'

const Forget = (props) => {

    const { setForgetPass } = props;
    const [email, setEmail] = useState("");

    const forgotHandler = (e)=> {
        e.preventDefault();
        // email ko dispatch karna ha
    }

  return (
    <div className={`absolute top-0 w-full h-[108vh] flex items-center justify-center bg-[#0000001a]`}>
            <div className={`w-[11/12] md:w-[60vmax] lg:w-[30vmax] bg-white p-3 flex flex-col items-center gap-8 border rounded-xl shadow-lg shadow-[#4acd8d]`}>
                <div className="flex items-center justify-end w-full">
                    <img onClick={() => setForgetPass(false)} className="h-6 cursor-pointer" src="https://icons.veryicon.com/png/o/miscellaneous/medium-thin-linear-icon/cross-23.png" alt="" />
                </div>
                <h1 className="text-[4vmax] md:text-[2vmax]">Forgot Password</h1>
                <form onSubmit={forgotHandler}>
                    <div className="w-full flex flex-col gap-5">
                        <div>
                            <label htmlFor="">Email</label>
                            <input className='w-full h-10 rounded-lg	p-3 mt-1 border-2 focus:border-[#4acd8d] focus:outline-none disabled:bg-slate-50 disabled:text-slate-500 disabled:border-slate-200 disabled:shadow-none invalid:border-pink-500 invalid:text-pink-600 focus:invalid:border-pink-500 focus:invalid:ring-pink-500' name='email' placeholder="Something@gmail.com" type="email" onChange={(e) => setEmail(e.target.value)} />
                        </div>
                        <div className="flex items-center flex-col gap-2 my-3">
                            <button type='submit' className={`px-20 py-2 rounded-3xl bg-red-600`}>Send Email</button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
  )
}

export default Forget