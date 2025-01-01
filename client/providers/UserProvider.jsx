'use client'
import React, { createContext, useContext, useEffect, useState } from 'react';
import Axios from '@/utils/axios';
import { toast } from 'react-toastify';

const UserContext = createContext();

export const UserProvider = (props) => {
    const [user, setUser] = useState(null);
    const [chatUser, setChatUser] = useState(null);
    const [friendArray, setFriendArray] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!user) asyncCurrentUser();
    }, [])


    const asyncCurrentUser = async () => {
        try {
            setLoading(true);
            const { data } = await Axios.get("/user");
            setUser(data);
            setFriendArray(data.friends);
            return data;
        } catch (error) {
            console.log(error.response);
        } finally {
            setLoading(false);
        }
    }

    const asyncgetChat = async (id) => {
        try {
            setLoading(true);
            const { data } = await Axios.post("/chat", { id });
            setChatUser(data);
        } catch (error) {
            console.log(error.response?.data?.message && error.response?.data?.message)
        } finally {
            setLoading(false);
        }
    }

    const asyncSingup = async (user) => {
        try {
            setLoading(true);
            const { data } = await Axios.post("/signup", user);
            setUser(data.user);
            toast.success("Signup Succesfull");
            return true;
        } catch (error) {
            if (error.response?.data?.message != "Please login to eccess the resource") toast.error(error.response?.data?.message && error.response?.data?.message);
            return false;
        } finally {
            setLoading(false);
        }
    }

    const asyncSinginEmailOrContact = async (emailOrContact, password) => {
        try {
            setLoading(true);
            const { data } = await Axios.post("/signin", { emailOrContact, password });
            setUser(data.user);
            toast.success("Login Succesfull");
            return true;
        } catch (error) {
            toast.error(error.response?.data?.message && error.response?.data?.message);
            return false;
        } finally {
            setLoading(false);
        }
    }

    const asynccreateGroup = async (groupInfo) => {
        try {
            setLoading(true);
            await Axios.post("/createGroup", groupInfo);
            toast.success("Group Created Succesfully");
            asyncCurrentUser();
        } catch (error) {
            console.log(error.response?.data?.message)
        } finally {
            setLoading(false);
        }
    }

    const asyncGroupDetails = async (id) => {
        try {
            setLoading(true);
            const { data } = await Axios.post('/group-info', { id });
            setChatUser(data);
        } catch (error) {
            console.log(error.response?.data?.message && error.response?.data?.message)
        } finally {
            setLoading(false);
        }
    }

    const asyncSingout = async () => {
        try {
            setLoading(true);
            const { data } = await Axios.get("/singout");
            setUser(null);
            toast.info(data?.message && data?.message);
            return true;
        } catch (error) {
            toast.error(error.response?.data?.message && error.response?.data?.message);
            return false;
        } finally {
            setLoading(false);
        }
    }

    const asyncUpdateUser = async (user) => {
        try {
            setLoading(true);
            const { data } = await Axios.post("/update-profile", user);
            asyncCurrentUser();
            toast.success(data?.message && data?.message);
        } catch (error) {
            toast.error(error.response?.data?.message && error.response?.data?.message);
        } finally {
            setLoading(false);
        }
    }

    const asyncAvatar = async (avatar) => {
        try {
            setLoading(true);
            const { data } = await Axios.post("/upload-profile-picture", avatar);
            asyncCurrentUser();
            toast.success(data?.message && data?.message);
        } catch (error) {
            toast.error(error.response?.data?.message && error.response?.data?.message);
        } finally {
            setLoading(false);
        }
    }

    const asyncResetPassword = async (password) => {
        try {
            setLoading(true);
            const { data } = await Axios.post("/update-password", password);
            asyncCurrentUser();
            toast.success(data?.message && data?.message);
        } catch (error) {
            toast.error(error.response?.data?.message && error.response?.data?.message);
        } finally {
            setLoading(false);
        }
    }

    const asyncDelete = async () => {
        try {
            setLoading(true);
            const { data } = await Axios.get("/delete");
            setChatUser(null);
            setUser(null);
            toast.warning(data?.message && data?.message);
        } catch (error) {
            toast.error(error.response?.data?.message && error.response?.data?.message);
        } finally {
            setLoading(false);
        }
    }

    const asyncSendEmail = async (email) => {
        try {
            setLoading(true);
            const { data } = await Axios.post("/send-email", email);
            asyncCurrentUser();
            toast.info(data?.message);
        } catch (error) {
            toast.error(error.response?.data?.message);
        } finally {
            setLoading(false);
        }
    }

    const asyncOtpVarification = async (OTP) => {
        try {
            setLoading(true);
            const { data } = await Axios.post("/otp-varification", OTP);
            asyncCurrentUser();
            toast.info(data?.message);
        } catch (error) {
            toast.error(error.response?.data?.message);
        } finally {
            setLoading(false);
        }
    }

    const asyncForgetPassChange = async (newPass) => {
        try {
            setLoading(true);
            const { data } = await Axios.post("/forget-password-change", newPass);
            asyncCurrentUser();
            toast.success(data?.message);
        } catch (error) {
            toast.error(error.response?.data?.message);
        } finally {
            setLoading(false);
        }
    }

    // end of CRED operations

    const asyncNewChat = async (id) => {
        try {
            setLoading(true);
            const { data } = await Axios.post("/new-chat", { id });
            dispatch(chatUser(data));
            asyncCurrentUser();
        } catch (error) {
            toast.error(error.response?.data?.message);
        } finally {
            setLoading(false);
        }
    }

    const asyncChatUpload = async (msg) => {
        try {
            await Axios.post("/msg-upload", msg);
        } catch (error) { }
    }

    return (
        <UserContext.Provider
            value={{ 
                user,
                friendArray,
                chatUser,
                setChatUser,
                setFriendArray, 
                asyncChatUpload, 
                asyncNewChat, 
                asyncForgetPassChange, 
                asyncOtpVarification, 
                asyncSendEmail, 
                asyncDelete, 
                asyncResetPassword, 
                asyncAvatar, 
                asyncUpdateUser, 
                asyncGroupDetails, 
                asynccreateGroup, 
                asyncSinginEmailOrContact, 
                asyncSingout, 
                asyncgetChat, 
                asyncSingup, 
                loading }}>
            {props?.children}
        </UserContext.Provider>
    );
};

export const useUser = () => {
    return useContext(UserContext);
}