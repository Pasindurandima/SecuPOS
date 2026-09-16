import React, { useEffect, useState } from 'react';
import { FaEnvelope, FaLock, FaMapMarkerAlt, FaPhone, FaUser } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { authService, userService } from '../services/apiService';

const emptyProfile = { id: '', firstName: '', lastName: '', email: '', phone: '', address: '', username: '', role: '', isActive: true, createdAt: '' };
const emptyPassword = { currentPassword: '', newPassword: '', confirmPassword: '' };

const toFormData = (user) => ({
  firstName: user.firstName || '',
  lastName: user.lastName || '',
  email: user.email || '',
  phone: user.phone || '',
  address: user.address || '',
  username: user.username || '',
});

const saveSessionUser = (user) => {
  const current = authService.getCurrentUser() || {};
  localStorage.setItem('user', JSON.stringify({ ...current, userId: user.id || current.userId, username: user.username, email: user.email, firstName: user.firstName, lastName: user.lastName, phone: user.phone, address: user.address, role: user.role, createdAt: user.createdAt }));
};

export default function Profile() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('personal');
  const [profile, setProfile] = useState(emptyProfile);
  const [formData, setFormData] = useState(toFormData(emptyProfile));
  const [passwordData, setPasswordData] = useState(emptyPassword);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    userService.getCurrent()
      .then((user) => { setProfile({ ...emptyProfile, ...user }); setFormData(toFormData(user)); saveSessionUser(user); })
      .catch((error) => {
        const localUser = authService.getCurrentUser();
        if (localUser) { setProfile({ ...emptyProfile, ...localUser, id: localUser.userId }); setFormData(toFormData(localUser)); }
        else navigate('/sign-in');
        setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to load profile' });
      })
      .finally(() => setLoading(false));
  }, [navigate]);

  const updateField = (name, value) => setFormData((current) => ({ ...current, [name]: value }));
  const updatePassword = (name, value) => setPasswordData((current) => ({ ...current, [name]: value }));

  const handleProfileSubmit = async (event) => {
    event.preventDefault();
    setSaving(true); setMessage({ type: '', text: '' });
    try {
      const updated = await userService.updateCurrent(formData);
      setProfile({ ...profile, ...updated }); setFormData(toFormData(updated)); saveSessionUser(updated);
      setMessage({ type: 'success', text: 'Profile updated successfully.' });
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to update profile' });
    } finally { setSaving(false); }
  };

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();
    if (passwordData.newPassword.length < 6) { setMessage({ type: 'error', text: 'New password must be at least 6 characters long.' }); return; }
    if (passwordData.newPassword !== passwordData.confirmPassword) { setMessage({ type: 'error', text: 'New passwords do not match.' }); return; }
    setSaving(true); setMessage({ type: '', text: '' });
    try {
      await userService.changePassword({ currentPassword: passwordData.currentPassword, newPassword: passwordData.newPassword });
      setPasswordData(emptyPassword); setMessage({ type: 'success', text: 'Password changed successfully.' });
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to change password' });
    } finally { setSaving(false); }
  };

  if (loading) return <div className="flex h-64 items-center justify-center text-gray-600">Loading profile...</div>;

  const displayName = `${profile.firstName || ''} ${profile.lastName || ''}`.trim() || profile.username || 'User';
  const initials = displayName.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase();
  const joinDate = profile.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Not available';
  const tabClass = (tab) => `w-full rounded-lg px-4 py-3 text-left transition-colors ${activeTab === tab ? 'border-l-4 border-teal-600 bg-teal-50 font-medium text-teal-700' : 'text-gray-700 hover:bg-gray-50'}`;

  return <div className="p-6">
    <div className="mb-6"><h1 className="text-2xl font-bold text-gray-800">My Profile</h1><p className="mt-2 text-gray-600">Manage your account information and security</p></div>
    {message.text && <div className={`mb-6 rounded-lg border p-4 ${message.type === 'success' ? 'border-green-200 bg-green-50 text-green-800' : 'border-red-200 bg-red-50 text-red-800'}`}>{message.text}</div>}
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
      <aside className="lg:col-span-1">
        <div className="rounded-lg bg-white p-6 shadow-md"><div className="mb-6 text-center"><div className="mx-auto flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-teal-400 to-teal-600 text-4xl font-bold text-white">{initials}</div><h2 className="mt-4 text-xl font-bold text-gray-900">{displayName}</h2><p className="text-sm capitalize text-gray-600">{profile.role || 'User'}</p><span className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-semibold ${profile.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700'}`}>{profile.isActive ? 'Active' : 'Inactive'}</span></div><div className="space-y-2"><button type="button" onClick={() => setActiveTab('personal')} className={tabClass('personal')}><FaUser className="mr-3 inline" />Personal Info</button><button type="button" onClick={() => setActiveTab('security')} className={tabClass('security')}><FaLock className="mr-3 inline" />Security</button></div></div>
        <div className="mt-6 rounded-lg bg-white p-6 shadow-md"><h3 className="mb-3 font-semibold text-gray-800">Account Info</h3><div className="space-y-3 text-sm"><div className="flex justify-between gap-3"><span className="text-gray-600">Member Since</span><strong>{joinDate}</strong></div><div className="flex justify-between gap-3"><span className="text-gray-600">Username</span><strong>{profile.username || 'Not set'}</strong></div><div className="flex justify-between gap-3"><span className="text-gray-600">User ID</span><strong>#{profile.id || 'N/A'}</strong></div></div></div>
      </aside>
      <main className="lg:col-span-3">{activeTab === 'personal' ? <form onSubmit={handleProfileSubmit} className="rounded-lg bg-white p-6 shadow-md"><h2 className="mb-6 text-lg font-semibold text-gray-800">Personal Information</h2><div className="grid grid-cols-1 gap-6 md:grid-cols-2"><Field label="First Name" value={formData.firstName} onChange={(event) => updateField('firstName', event.target.value)} required /><Field label="Last Name" value={formData.lastName} onChange={(event) => updateField('lastName', event.target.value)} required /><Field label="Email Address" type="email" icon={FaEnvelope} value={formData.email} onChange={(event) => updateField('email', event.target.value)} required /><Field label="Phone Number" icon={FaPhone} value={formData.phone} onChange={(event) => updateField('phone', event.target.value)} /><div className="md:col-span-2"><label className="mb-2 block text-sm font-medium text-gray-700">Username</label><input value={formData.username} readOnly className="w-full rounded-lg border border-gray-300 bg-gray-100 px-4 py-2 text-gray-600" /></div><div className="md:col-span-2"><label className="mb-2 block text-sm font-medium text-gray-700"><FaMapMarkerAlt className="mr-2 inline" />Address</label><textarea rows="3" value={formData.address} onChange={(event) => updateField('address', event.target.value)} className="w-full rounded-lg border border-gray-300 px-4 py-2" /></div></div><div className="mt-6 flex gap-3"><button disabled={saving} className="rounded-lg bg-teal-600 px-6 py-2 text-white hover:bg-teal-700 disabled:bg-gray-400">{saving ? 'Saving...' : 'Save Changes'}</button><button type="button" onClick={() => setFormData(toFormData(profile))} className="rounded-lg bg-gray-200 px-6 py-2 text-gray-800 hover:bg-gray-300">Cancel</button></div></form> : <form onSubmit={handlePasswordSubmit} className="rounded-lg bg-white p-6 shadow-md"><h2 className="mb-6 text-lg font-semibold text-gray-800">Change Password</h2><div className="space-y-4"><PasswordField label="Current Password" value={passwordData.currentPassword} onChange={(event) => updatePassword('currentPassword', event.target.value)} /><PasswordField label="New Password" value={passwordData.newPassword} onChange={(event) => updatePassword('newPassword', event.target.value)} /><PasswordField label="Confirm New Password" value={passwordData.confirmPassword} onChange={(event) => updatePassword('confirmPassword', event.target.value)} /></div><button disabled={saving} className="mt-6 rounded-lg bg-teal-600 px-6 py-2 text-white hover:bg-teal-700 disabled:bg-gray-400">{saving ? 'Updating...' : 'Update Password'}</button></form>}</main>
    </div>
  </div>;
}

function Field({ label, value, onChange, type = 'text', required, icon: Icon }) { return <div><label className="mb-2 block text-sm font-medium text-gray-700">{Icon && <Icon className="mr-2 inline" />}{label}{required ? ' *' : ''}</label><input type={type} value={value} onChange={onChange} required={required} className="w-full rounded-lg border border-gray-300 px-4 py-2" /></div>; }
function PasswordField({ label, value, onChange }) { return <div><label className="mb-2 block text-sm font-medium text-gray-700">{label}</label><input type="password" value={value} onChange={onChange} required className="w-full rounded-lg border border-gray-300 px-4 py-2" /></div>; }
