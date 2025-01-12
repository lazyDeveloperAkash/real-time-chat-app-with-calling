'use client'
import React, { createContext, useContext, useMemo } from "react";
import socketIo from 'socket.io-client'

const SocketContext = createContext();

export const useSocket = () => {
    const socket = useContext(SocketContext);
    return socket;
}

export const SocketProvider = (props) => {
    const socket = useMemo(() => socketIo('localhost:8080'), []);
    return (
        <SocketContext.Provider value={socket}>
            {props?.children}
        </SocketContext.Provider>
    )
}