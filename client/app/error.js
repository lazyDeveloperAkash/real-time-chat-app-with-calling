'use client'
import Link from 'next/link'
import React from 'react'

const error = ({ error, reset }) => {
    console.log(error)
    return (
        <div className='w-full h-full flex flex-col items-center justify-center gap-4 p-10'>
            <p className='text-xl'>There was a problem</p>
            <h1 className='text-2xl my-4'>{error.message || "Something went wrong"}</h1>
            <p className='text-lg text-gray-400'>Please try again later or hit the refresh button below</p>
            <div className='flex gap-6 items-center'>
                <button className='px-6 py-3 rounded-xl border border-[#3998c0] text-red-500' onClick={()=> reset()}>Try agin</button>
                <Link className='text-[#3998c0]' href="/">Go back home</Link>
            </div>
        </div>
    )
}

export default error