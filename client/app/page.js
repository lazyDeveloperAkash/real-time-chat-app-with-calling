'use client'
import SignUp from '@/components/SignUp'
import { useUser } from '@/providers/UserProvider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const page = () => {
  const router = useRouter();

  const { user } = useUser();
  useEffect(() => {
    if (user) router.push("/dashboard");
  }, [router, user])
  
  return (
    <SignUp/>
  )
}

export default page