'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

interface Profile {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  bio: string;
  created_at: string;
  updated_at: string;
}

export default function AccountPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    bio: ''
  });

  useEffect(() => {
    checkUserAndLoadProfile();
  }, []);

  const checkUserAndLoadProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }

      const { data, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (profileError) throw profileError;

      if (data) {
        setProfile(data);
        setFormData({
          full_name: data.full_name || '',
          phone: data.phone || '',
          bio: data.bio || ''
        });
      }
    } catch (err: any) {
      setError(err.message || 'Error loading profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }

      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          phone: formData.phone,
          bio: formData.bio
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      setSuccess('Profile updated successfully!');
      setIsEditing(false);
      await checkUserAndLoadProfile();
    } catch (err: any) {
      setError(err.message || 'Error updating profile');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const cancelEdit = () => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        phone: profile.phone || '',
        bio: profile.bio || ''
      });
    }
    setIsEditing(false);
    setError('');
    setSuccess('');
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

  if (!profile) {
    return (
      <div className="container mt-5">
        <div className="alert alert-warning">Profile not found</div>
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="card-title mb-0">Account Information</h2>
                <button
                  className="btn btn-outline-secondary"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </div>

              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}

              {success && (
                <div className="alert alert-success" role="alert">
                  {success}
                </div>
              )}

              {!isEditing ? (
                <div>
                  <div className="mb-3">
                    <label className="form-label fw-bold">Email</label>
                    <p className="form-control-plaintext">{profile.email}</p>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-bold">Full Name</label>
                    <p className="form-control-plaintext">{profile.full_name || 'Not provided'}</p>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-bold">Phone Number</label>
                    <p className="form-control-plaintext">{profile.phone || 'Not provided'}</p>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-bold">Bio</label>
                    <p className="form-control-plaintext">{profile.bio || 'Not provided'}</p>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-bold">Account Created</label>
                    <p className="form-control-plaintext">
                      {new Date(profile.created_at).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-bold">Last Updated</label>
                    <p className="form-control-plaintext">
                      {new Date(profile.updated_at).toLocaleDateString()}
                    </p>
                  </div>

                  <button
                    className="btn btn-primary"
                    onClick={() => setIsEditing(true)}
                  >
                    Edit Profile
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label fw-bold">Email</label>
                    <p className="form-control-plaintext text-muted">{profile.email}</p>
                    <small className="text-muted">Email cannot be changed</small>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="full_name" className="form-label">Full Name</label>
                    <input
                      type="text"
                      className="form-control"
                      id="full_name"
                      name="full_name"
                      value={formData.full_name}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="phone" className="form-label">Phone Number</label>
                    <input
                      type="tel"
                      className="form-control"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="bio" className="form-label">Bio</label>
                    <textarea
                      className="form-control"
                      id="bio"
                      name="bio"
                      rows={3}
                      value={formData.bio}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="d-flex gap-2">
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={saving}
                    >
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={cancelEdit}
                      disabled={saving}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
