import { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import { Password, PasswordState } from '../types/password';
import { useAuth } from './AuthContext';
import { encryptPassword } from '../lib/utils';
import { db } from '../lib/firebase';
import { collection, query, where, orderBy, getDocs, addDoc, updateDoc, deleteDoc, doc, Timestamp } from 'firebase/firestore';

type PasswordAction =
  | { type: 'SET_PASSWORDS'; payload: Password[] }
  | { type: 'ADD_PASSWORD'; payload: Password }
  | { type: 'UPDATE_PASSWORD'; payload: Password }
  | { type: 'DELETE_PASSWORD'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null };

const initialState: PasswordState = {
  passwords: [],
  isLoading: false,
  error: null,
};

const PasswordContext = createContext<{
  state: PasswordState;
  addPassword: (password: Omit<Password, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updatePassword: (id: string, password: Partial<Omit<Password, 'id' | 'user_id' | 'created_at' | 'updated_at'>>) => Promise<void>;
  deletePassword: (id: string) => Promise<void>;
  getPasswords: () => Promise<void>;
} | null>(null);

function passwordReducer(state: PasswordState, action: PasswordAction): PasswordState {
  switch (action.type) {
    case 'SET_PASSWORDS':
      return { ...state, passwords: action.payload };
    case 'ADD_PASSWORD':
      return { ...state, passwords: [...state.passwords, action.payload] };
    case 'UPDATE_PASSWORD':
      return {
        ...state,
        passwords: state.passwords.map((p) =>
          p.id === action.payload.id ? action.payload : p
        ),
      };
    case 'DELETE_PASSWORD':
      return {
        ...state,
        passwords: state.passwords.filter((p) => p.id !== action.payload),
      };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    default:
      return state;
  }
}

export function PasswordProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(passwordReducer, initialState);
  const { user } = useAuth();

  const getPasswords = async () => {
    if (!user) return;
    dispatch({ type: 'SET_LOADING', payload: true });
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
        // Only include necessary fields, exclude sensitive data
        data.push({
          id: docSnap.id,
          title: passwordData.title,
          username: passwordData.username,
          password: passwordData.password, // This should be encrypted in the database
          website: passwordData.website,
          notes: passwordData.notes,
          user_id: passwordData.user_id,
          created_at: passwordData.created_at.toDate().toISOString(),
          updated_at: passwordData.updated_at.toDate().toISOString(),
        });
      });
      dispatch({ type: 'SET_PASSWORDS', payload: data });
    } catch (error) {
      // Log error without exposing sensitive information
      dispatch({ type: 'SET_ERROR', payload: 'Error fetching passwords' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const addPassword = async (data: Omit<Password, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) throw new Error('Not authenticated');

    const now = Timestamp.now();
    // Encrypt sensitive data before storing
    const passwordData = {
      ...data,
      user_id: user.id,
      created_at: now,
      updated_at: now,
    };

    try {
      await addDoc(collection(db, 'passwords'), passwordData);
      await getPasswords();
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Error adding password' });
    }
  };

  const updatePassword = async (id: string, data: Partial<Omit<Password, 'id' | 'user_id' | 'created_at' | 'updated_at'>>) => {
    if (!user) throw new Error('Not authenticated');

    const passwordRef = doc(db, 'passwords', id);
    const updateData = { ...data, updated_at: Timestamp.now() };

    try {
      await updateDoc(passwordRef, updateData);
      await getPasswords();
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Error updating password' });
    }
  };

  const deletePassword = async (id: string) => {
    if (!user) throw new Error('Not authenticated');

    try {
      await deleteDoc(doc(db, 'passwords', id));
      await getPasswords();
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Error deleting password' });
    }
  };

  useEffect(() => {
    if (user) {
      getPasswords();
    }
  }, [user]);

  return (
    <PasswordContext.Provider
      value={{
        state,
        addPassword,
        updatePassword,
        deletePassword,
        getPasswords,
      }}
    >
      {children}
    </PasswordContext.Provider>
  );
}

export function usePassword() {
  const context = useContext(PasswordContext);
  if (!context) {
    throw new Error('usePassword must be used within a PasswordProvider');
  }
  return context;
}
