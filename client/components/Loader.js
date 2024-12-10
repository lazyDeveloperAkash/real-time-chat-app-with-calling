import React from 'react'

const Loader = () => {
  return (
    <div className='absolute top-0 left-0 z-20 w-full h-[100vh] bg-white flex items-center justify-center'>
        <img src="loader.gif" alt="" />
    </div>
  )
}

export default Loader