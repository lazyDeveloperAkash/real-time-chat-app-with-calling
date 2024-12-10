import React from 'react'

const LeftSkeleton = () => {
    return (
        <div className="h-[100vh] w-[100vw] min-w-[30vmax] md:w-[30vw] bg-black bg-opacity-75 relative">
            <div className='w-full h-1/5 pt-5'>
                <div className='w-full flex items-center px-4 justify-between animate-pulse'>
                    <div className='w-full flex items-center'>
                        <div className='bg-gray-200 h-14 w-14 rounded-full cursor-pointer overflow-hidden'>
                        </div>
                        <div className='w-32 h-6 bg-gray-200 ml-5 rounded-md'></div>
                    </div>
                    <div className='flex items-center cursor-pointer'><div className="bg-gray-200 h-5 w-5 rounded-full"></div></div>
                </div>
            </div>
                <div className='w-full px-4 relative inline-block mt-2'>
                    <div className='w-full h-10 rounded-xl px-4 bg-gray-200 animate-pulse'></div>
                </div>
            <div className="w-full h-4/5 px-4 flex flex-col gap-4 overflow-y-auto pt-2 removeScrollbar">
                <div className="rounded-xl flex items-center px-3 py-2 animate-pulse">
                    <div className='bg-gray-200 h-12 w-12 rounded-full'></div>
                    <div className='w-32 h-6 bg-gray-200 ml-5 rounded-md'></div>
                </div>
                <div className="rounded-xl flex items-center px-3 py-2 animate-pulse">
                    <div className='bg-gray-200 h-12 w-12 rounded-full'></div>
                    <div className='w-32 h-6 bg-gray-200 ml-5 rounded-md'></div>
                </div>
            </div>
            <div className='absolute top-[80%] right-[10%] flex items-center justify-center w-16 h-16 rounded-full bg-gray-200 animate-pulse'></div>
        </div>
    )
}

export default LeftSkeleton