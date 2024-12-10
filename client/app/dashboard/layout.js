'use client'
import { useUser } from '@/providers/UserProvider'
import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react'

const layout = ({ children }) => {
  const router = useRouter();

  const { user } = useUser();
  useEffect(() => {
    if (!user) router.push("/");
  }, [user, router]);
  
  
  return (
    <div>{children}</div>
  )
}

export default layout