import { createContext, useContext, useState } from 'react';
import { Password, PasswordContextType } from '../types';
import { useAuth } from './AuthContext';
import { encryptPassword } from '../lib/utils';
import { db } from '../lib/firebase';
import { collection, query, where, orderBy, getDocs, addDoc, updateDoc, deleteDoc, doc, Timestamp } from 'firebase/firestore';

const PasswordContext = createContext<PasswordContextType | null>(null);

export const PasswordProvider = ({ children }: { children: React.ReactNode }) => {
  const [passwords, setPasswords] = useState<Password[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const getPasswords = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const passwordsRef = collection(db, 'passwords');
      const q = query(
        passwordsRef,
        where('user_id', '==', user.id),
        orderBy('created_at', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const data: Password[] = [];
      querySnapshot.forEach((docSnap) => {
        const passwordData = docSnap.data();
        data.push({
          id: docSnap.id,
          ...passwordData,
          created_at: passwordData.created_at.toDate().toISOString(),
          updated_at: passwordData.updated_at.toDate().toISOString(),
        } as Password);
      });
      setPasswords(data);
    } catch (error) {
      console.error('Error fetching passwords:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const addPassword = async (data: Omit<Password, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) throw new Error('Not authenticated');

    const now = Timestamp.now();
    const passwordData = {
      ...data,
      user_id: user.id,
      encrypted_password: encryptPassword(data.encrypted_password, user.id),
      created_at: now,
      updated_at: now,
    };

    try {
      const docRef = await addDoc(collection(db, 'passwords'), passwordData);
      await getPasswords(); // Refresh the list
    } catch (error) {
      console.error('Error adding password:', error);
      throw error;
    }
  };

  const updatePassword = async (id: string, data: Partial<Password>) => {
    if (!user) throw new Error('Not authenticated');

    const passwordRef = doc(db, 'passwords', id);
    const updateData: any = { ...data, updated_at: Timestamp.now() };

    if (data.encrypted_password) {
      updateData.encrypted_password = encryptPassword(data.encrypted_password, user.id);
    }

    try {
      await updateDoc(passwordRef, updateData);
      await getPasswords(); // Refresh the list
    } catch (error) {
      console.error('Error updating password:', error);
      throw error;
    }
  };

  const deletePassword = async (id: string) => {
    if (!user) throw new Error('Not authenticated');

    try {
      await deleteDoc(doc(db, 'passwords', id));
      await getPasswords(); // Refresh the list
    } catch (error) {
      console.error('Error deleting password:', error);
      throw error;
    }
  };

  return (
    <PasswordContext.Provider
      value={{
        passwords,
        loading,
        addPassword,
        updatePassword,
        deletePassword,
        getPasswords,
      }}
    >
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
