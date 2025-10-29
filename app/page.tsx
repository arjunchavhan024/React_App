'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      router.push('/account');
    } else {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mt-5">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-8 text-center">
          <h1 className="mb-4">Welcome to Account Management</h1>
          <p className="lead mb-4">Create and manage your account with ease</p>

          <div className="d-flex gap-3 justify-content-center">
            <Link href="/login" className="btn btn-primary btn-lg">
              Login
            </Link>
            <Link href="/register" className="btn btn-outline-primary btn-lg">
              Register
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
