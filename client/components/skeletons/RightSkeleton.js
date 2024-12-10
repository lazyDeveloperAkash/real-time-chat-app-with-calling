import React from 'react'

const RightSkeleton = () => {
    return (
        <div class="w-full h-screen md:w-70 md:block hidden bg-[#312F2F]">
            <div className="w-full h-20 flex justify-between items-center px-6 animate-pulse">
                <div className='flex items-center gap-6'>
                    <div className="h-14 w-14 rounded-full bg-gray-200"></div>
                    <div className="h-6 w-24 bg-gray-200 rounded"></div>
                </div>
                <div className='w-24 h-12 bg-gray-200 rounded-lg'>
                </div>
            </div>
            <div id='midArea' className='h-[78%] w-full bg-[#272727] p-6 relative'>
                <div className='flex w-full items-center p-2 animate-pulse'>
                    <div className='h-6 w-48 rounded bg-gray-200 mr-4'></div>
                </div>
                <div className='flex justify-end w-full items-center p-2 animate-pulse'>
                    <div className='h-6 w-48 rounded bg-gray-200'></div>
                </div>
                <div className='flex w-full items-center p-2 animate-pulse'>
                    <div className='h-6 w-48 rounded bg-gray-200 mr-4'></div>
                </div>
                <div className='flex justify-end w-full items-center p-2 animate-pulse'>
                    <div className='h-6 w-48 rounded bg-gray-200'></div>
                </div>
                <div className='flex w-full items-center p-2 animate-pulse'>
                    <div className='h-6 w-48 rounded bg-gray-200 mr-4'></div>
                </div>
                <div className='flex w-full items-center p-2 animate-pulse'>
                    <div className='h-6 w-48 rounded bg-gray-200 mr-4'></div>
                </div>
                <div className='flex justify-end w-full items-center p-2 animate-pulse'>
                    <div className='h-6 w-48 rounded bg-gray-200'></div>
                </div>
            </div>
                <div className="h-20 w-full flex items-center gap-4 px-4 animate-pulse">
                    <div className="h-11 w-[70%] rounded-full bg-gray-200"></div>
                    <div className="h-12 w-12 rounded-full bg-gray-200"></div>
                </div>
        </div>
    )
}

export default RightSkeleton