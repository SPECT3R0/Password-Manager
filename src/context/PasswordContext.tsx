import { createContext, useContext, useState } from 'react';
import { Password, PasswordContextType } from '../types';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { encryptPassword } from '../lib/utils';

const PasswordContext = createContext<PasswordContextType | null>(null);

export const PasswordProvider = ({ children }: { children: React.ReactNode }) => {
  const [passwords, setPasswords] = useState<Password[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const getPasswords = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('passwords')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPasswords(data || []);
    } catch (error) {
      console.error('Error fetching passwords:', error);
    } finally {
      setLoading(false);
    }
  };

  const addPassword = async (data: Omit<Password, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return;
    const encryptedPassword = encryptPassword(data.encrypted_password, user.id);
    
    const { error } = await supabase.from('passwords').insert({
      user_id: user.id,
      website: data.website,
      username: data.username,
      encrypted_password: encryptedPassword,
      website_icon: data.website_icon,
    });

    if (error) throw error;
    await getPasswords();
  };

  const updatePassword = async (id: string, data: Partial<Password>) => {
    if (!user) return;
    
    const updates: Partial<Password> = { ...data };
    if (data.encrypted_password) {
      updates.encrypted_password = encryptPassword(data.encrypted_password, user.id);
    }

    const { error } = await supabase
      .from('passwords')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw error;
    await getPasswords();
  };

  const deletePassword = async (id: string) => {
    if (!user) return;
    
    const { error } = await supabase
      .from('passwords')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw error;
    await getPasswords();
  };

  return (
    <PasswordContext.Provider value={{
      passwords,
      loading,
      addPassword,
      updatePassword,
      deletePassword,
      getPasswords,
    }}>
      {children}
    </PasswordContext.Provider>
  );
};

export const usePassword = () => {
  const context = useContext(PasswordContext);
  if (!context) {
    throw new Error('usePassword must be used within a PasswordProvider');
  }
  return context;
};