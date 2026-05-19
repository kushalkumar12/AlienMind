import React, { useRef, useState } from 'react';
import { X, Save, Camera, Plus, Sparkles } from 'lucide-react';
import type { CandidateDashboardData } from '../../../types';
import Avatar from '../../Avatar';
import { useProfileImage } from '../../../hooks/useProfileImage';

interface ProfileEditorProps {
  data: CandidateDashboardData;
  onSave: (updated: Partial<CandidateDashboardData>) => void;
  onClose: () => void;
}

export default function ProfileEditor({ data, onSave, onClose }: ProfileEditorProps) {
  const [formData, setFormData] = useState({
    fullName: data.fullName,
    currentLevel: data.currentLevel,
    summary: data.summary,
    skills: [...data.skills]
  });

  const [newSkill, setNewSkill] = useState('');
  const [avatar, setAvatar] = useProfileImage(data.userId);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addSkill = () => {
    if (newSkill && !formData.skills.includes(newSkill)) {
      setFormData({ ...formData, skills: [...formData.skills, newSkill] });
      setNewSkill('');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (JPG, PNG, WebP, etc.)');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      alert('Image must be smaller than 2 MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setAvatar(reader.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(8px)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div className="glass-card" style={{ width: '100%', maxWidth: '640px', padding: '0', overflow: 'hidden' }}>

        {/* Header */}
        <div style={{ padding: '24px', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '20px' }}>Professional Identity</h2>
          <X size={20} style={{ cursor: 'pointer', color: '#64748B' }} onClick={onClose} />
        </div>

        <div style={{ padding: '32px', overflowY: 'auto', maxHeight: '70vh' }}>

          {/* Avatar Upload */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '32px' }}>
            {/* Live preview using Avatar component */}
            <Avatar
              userId={data.userId}
              name={formData.fullName}
              size={100}
              radius="32px"
              fontSize={40}
            />

            <div>
              {/* Hidden real file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />
              <button
                type="button"
                className="btn-primary"
                style={{ borderRadius: '12px', fontSize: '13px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}
                onClick={() => fileInputRef.current?.click()}
              >
                <Camera size={16} /> Upload Photo
              </button>
              {avatar && (
                <button
                  type="button"
                  className="btn-ghost"
                  style={{ borderRadius: '10px', fontSize: '12px', color: '#EF4444', border: '1px solid #FEE2E2', display: 'flex', alignItems: 'center', gap: '6px' }}
                  onClick={() => setAvatar(null)}
                >
                  <X size={12} /> Remove Photo
                </button>
              )}
              <p style={{ fontSize: '12px', color: '#94A3B8', marginTop: '8px' }}>
                JPG, PNG or WebP · Max 2 MB
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={e => { e.preventDefault(); onSave(formData); }} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '13px', fontWeight: 700, color: '#475569' }}>FULL NAME</label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                  style={{ padding: '12px 16px', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', fontSize: '14px' }}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '13px', fontWeight: 700, color: '#475569' }}>HEADLINE</label>
                <input
                  type="text"
                  value={formData.currentLevel}
                  onChange={e => setFormData({ ...formData, currentLevel: e.target.value })}
                  style={{ padding: '12px 16px', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', fontSize: '14px' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <label style={{ fontSize: '13px', fontWeight: 700, color: '#475569' }}>ABOUT</label>
                <span style={{ fontSize: '11px', color: '#155EEF', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Sparkles size={12} /> AI Rewrite
                </span>
              </div>
              <textarea
                value={formData.summary}
                rows={4}
                onChange={e => setFormData({ ...formData, summary: e.target.value })}
                style={{ padding: '12px 16px', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', fontSize: '14px', resize: 'none', fontFamily: 'inherit' }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <label style={{ fontSize: '13px', fontWeight: 700, color: '#475569' }}>SKILLS & EXPERTISE</label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <input
                  type="text"
                  value={newSkill}
                  placeholder="e.g. System Design"
                  onChange={e => setNewSkill(e.target.value)}
                  onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                  style={{ flex: 1, padding: '12px 16px', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', fontSize: '14px' }}
                />
                <button type="button" onClick={addSkill} className="btn-primary" style={{ padding: '12px' }}><Plus size={20} /></button>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {formData.skills.map(skill => (
                  <div key={skill} style={{ padding: '6px 12px', background: '#F1F5F9', borderRadius: '8px', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {skill} <X size={12} style={{ cursor: 'pointer', color: '#94A3B8' }} onClick={() => setFormData({ ...formData, skills: formData.skills.filter(s => s !== skill) })} />
                  </div>
                ))}
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div style={{ padding: '24px 32px', borderTop: '1px solid #F1F5F9', background: '#F8FAFC', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button className="btn-ghost" onClick={onClose} style={{ fontWeight: 700 }}>Cancel</button>
          <button className="btn-primary" onClick={() => onSave(formData)} style={{ fontWeight: 700 }}>
            <Save size={18} /> Update Profile
          </button>
        </div>
      </div>
    </div>
  );
}
