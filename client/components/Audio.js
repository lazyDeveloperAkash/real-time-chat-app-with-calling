'use client'
import React, { useRef, useState } from 'react'
import Draggable from 'react-draggable';
import { HiPhoneMissedCall } from 'react-icons/hi';
import { HiMiniMinus } from 'react-icons/hi2';
import { IoMdClose, IoMdMicOff } from 'react-icons/io';
import { LuRectangleHorizontal } from 'react-icons/lu';

const Audio = (props) => {

    const { setAudio, setOnCall } = props;

    const [activeDrags, setActiveDrags] = useState(0);
    const draggableRef = useRef(null);

    const onStart = () => {
        setActiveDrags((prevDrags) => prevDrags + 1);
    };

    const onStop = () => {
        setActiveDrags((prevDrags) => prevDrags - 1);
    };

    const dragHandlers = { onStart, onStop };

    const closeHandler = () => {
        setAudio(false);
        setOnCall(false);
        // audio katna and backend baki ha
    }

    return (
        <>
            <Draggable handle="strong" {...dragHandlers} nodeRef={draggableRef}>
                <div ref={draggableRef} className='absolute h-full w-full md:w-[30vmax] md:h-[30vmax] rounded-2xl bg-slate-200'>
                    <strong className="cursor-pointer">
                        <div className='w-full h-8 flex items-center justify-end'>
                            <div className='h-full w-10 hover:bg-gray-500 flex justify-center items-center rounded-sm' onClick={() => setAudio(false)}><HiMiniMinus /></div>
                            <div className='h-full w-10 hover:bg-gray-500 flex justify-center items-center rounded-sm' onClick={() => setSize({ width: 100, height: 100 })}><LuRectangleHorizontal /></div>
                            <div className='h-full w-10 hover:bg-red-600 flex justify-center items-center rounded-sm' onClick={closeHandler}><IoMdClose /></div>
                        </div>
                    </strong>
                    <div className='flex-col flex items-center justify-center w-full h-[80%] md:h-[70%] relative bg-black'>
                        <div className='h-[35vmax] w-[35vmax] md:h-[12vmax] md:w-[12vmax] rounded-full bg-green-400'></div>
                    </div>
                    <div className='w-full h-[15%] md:h-[20%] flex items-center justify-center'>
                        <div className='flex items-center justify-center gap-[2vmax] rounded-full h-[40%] md:h-[60%] bg-red-200 px-[10%]'>
                            <div className='h-[5vmax] w-[5vmax] md:h-[3vmax] md:w-[3vmax] lg:h-[2.5vmax] lg:w-[2.5vmax] rounded-full flex items-center justify-center bg-gray-400'><IoMdMicOff /></div>
                            <div className='h-[90%] w-[10vmax] rounded-full flex items-center justify-center bg-red-600'><HiPhoneMissedCall /></div>
                        </div>
                    </div>
                </div>
            </Draggable>
        </>
    )
}

export default Audio