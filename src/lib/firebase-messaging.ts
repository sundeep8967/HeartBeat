import { db } from './firebase';
import { doc, collection, addDoc, getDoc, getDocs, query, where, orderBy, onSnapshot, updateDoc, serverTimestamp, deleteDoc } from 'firebase/firestore';

// Message types
export interface Message {
  id?: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: any;
  read: boolean;
  type: 'text' | 'image' | 'system';
  metadata?: {
    imageUrl?: string;
    fileName?: string;
    fileSize?: number;
  };
}

export interface Conversation {
  id?: string;
  participants: string[];
  lastMessage?: string;
  lastMessageTime?: any;
  unreadCount: number;
  createdAt: any;
  updatedAt: any;
}

// Firebase Messaging Service
export const firebaseMessaging = {
  // Send a message
  async sendMessage(message: Omit<Message, 'id' | 'timestamp' | 'read'>): Promise<string> {
    try {
      const messageData = {
        ...message,
        timestamp: serverTimestamp(),
        read: false,
      };

      const docRef = await addDoc(collection(db, 'messages'), messageData);
      return docRef.id;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  },

  // Get messages between two users
  async getMessages(userId1: string, userId2: string): Promise<Message[]> {
    try {
      const q = query(
        collection(db, 'messages'),
        where('senderId', 'in', [userId1, userId2]),
        where('receiverId', 'in', [userId1, userId2]),
        orderBy('timestamp', 'asc')
      );

      const querySnapshot = await getDocs(q);
      const messages: Message[] = [];

      querySnapshot.forEach((doc) => {
        messages.push({
          id: doc.id,
          ...doc.data(),
        } as Message);
      });

      return messages;
    } catch (error) {
      console.error('Error getting messages:', error);
      throw error;
    }
  },

  // Listen to real-time messages
  listenToMessages(userId1: string, userId2: string, callback: (messages: Message[]) => void) {
    const q = query(
      collection(db, 'messages'),
      where('senderId', 'in', [userId1, userId2]),
      where('receiverId', 'in', [userId1, userId2]),
      orderBy('timestamp', 'asc')
    );

    return onSnapshot(q, (querySnapshot) => {
      const messages: Message[] = [];
      querySnapshot.forEach((doc) => {
        messages.push({
          id: doc.id,
          ...doc.data(),
        } as Message);
      });
      callback(messages);
    });
  },

  // Mark messages as read
  async markMessagesAsRead(senderId: string, receiverId: string): Promise<void> {
    try {
      const q = query(
        collection(db, 'messages'),
        where('senderId', '==', senderId),
        where('receiverId', '==', receiverId),
        where('read', '==', false)
      );

      const querySnapshot = await getDocs(q);
      
      const updatePromises = querySnapshot.docs.map((doc) => 
        updateDoc(doc.ref, { read: true })
      );

      await Promise.all(updatePromises);
    } catch (error) {
      console.error('Error marking messages as read:', error);
      throw error;
    }
  },

  // Get unread message count
  async getUnreadCount(userId: string): Promise<number> {
    try {
      const q = query(
        collection(db, 'messages'),
        where('receiverId', '==', userId),
        where('read', '==', false)
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.size;
    } catch (error) {
      console.error('Error getting unread count:', error);
      throw error;
    }
  },

  // Get conversations for a user
  async getConversations(userId: string): Promise<Conversation[]> {
    try {
      const q = query(
        collection(db, 'conversations'),
        where('participants', 'array-contains', userId),
        orderBy('updatedAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const conversations: Conversation[] = [];

      querySnapshot.forEach((doc) => {
        conversations.push({
          id: doc.id,
          ...doc.data(),
        } as Conversation);
      });

      return conversations;
    } catch (error) {
      console.error('Error getting conversations:', error);
      throw error;
    }
  },

  // Create or update conversation
  async upsertConversation(participants: string[], lastMessage?: string): Promise<string> {
    try {
      const conversationId = this.generateConversationId(participants);
      const conversationRef = doc(db, 'conversations', conversationId);
      
      const conversationDoc = await getDoc(conversationRef);
      
      if (conversationDoc.exists()) {
        // Update existing conversation
        await updateDoc(conversationRef, {
          lastMessage,
          lastMessageTime: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        return conversationId;
      } else {
        // Create new conversation
        await updateDoc(conversationRef, {
          participants,
          lastMessage,
          lastMessageTime: serverTimestamp(),
          unreadCount: 0,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        return conversationId;
      }
    } catch (error) {
      console.error('Error upserting conversation:', error);
      throw error;
    }
  },

  // Listen to conversations
  listenToConversations(userId: string, callback: (conversations: Conversation[]) => void) {
    const q = query(
      collection(db, 'conversations'),
      where('participants', 'array-contains', userId),
      orderBy('updatedAt', 'desc')
    );

    return onSnapshot(q, (querySnapshot) => {
      const conversations: Conversation[] = [];
      querySnapshot.forEach((doc) => {
        conversations.push({
          id: doc.id,
          ...doc.data(),
        } as Conversation);
      });
      callback(conversations);
    });
  },

  // Delete a message
  async deleteMessage(messageId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'messages', messageId));
    } catch (error) {
      console.error('Error deleting message:', error);
      throw error;
    }
  },

  // Generate conversation ID from participant IDs
  generateConversationId(participants: string[]): string {
    const sortedParticipants = [...participants].sort();
    return sortedParticipants.join('_');
  },

  // Send system message
  async sendSystemMessage(receiverId: string, content: string): Promise<string> {
    try {
      const systemMessage: Omit<Message, 'id' | 'timestamp' | 'read'> = {
        senderId: 'system',
        receiverId,
        content,
        type: 'system',
      };

      return await this.sendMessage(systemMessage);
    } catch (error) {
      console.error('Error sending system message:', error);
      throw error;
    }
  },

  // Get typing status
  async setTypingStatus(userId: string, conversationId: string, isTyping: boolean): Promise<void> {
    try {
      const typingRef = doc(db, 'typing', conversationId);
      await updateDoc(typingRef, {
        [userId]: {
          isTyping,
          timestamp: serverTimestamp(),
        },
      });
    } catch (error) {
      console.error('Error setting typing status:', error);
      throw error;
    }
  },

  // Listen to typing status
  listenToTypingStatus(conversationId: string, callback: (typingStatus: Record<string, any>) => void) {
    const typingRef = doc(db, 'typing', conversationId);
    
    return onSnapshot(typingRef, (doc) => {
      if (doc.exists()) {
        callback(doc.data());
      } else {
        callback({});
      }
    });
  },
};

// React hook for Firebase messaging
import { useState, useEffect } from 'react';

export function useFirebaseMessaging(userId: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    // Load initial data
    const loadInitialData = async () => {
      try {
        const [conversationsData, unreadCountData] = await Promise.all([
          firebaseMessaging.getConversations(userId),
          firebaseMessaging.getUnreadCount(userId),
        ]);
        
        setConversations(conversationsData);
        setUnreadCount(unreadCountData);
      } catch (error) {
        console.error('Error loading initial data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();

    // Listen to conversations
    const unsubscribeConversations = firebaseMessaging.listenToConversations(
      userId,
      (updatedConversations) => {
        setConversations(updatedConversations);
      }
    );

    return () => {
      unsubscribeConversations();
    };
  }, [userId]);

  const getConversationMessages = async (otherUserId: string) => {
    try {
      const messagesData = await firebaseMessaging.getMessages(userId, otherUserId);
      setMessages(messagesData);
      
      // Mark messages as read
      await firebaseMessaging.markMessagesAsRead(otherUserId, userId);
      
      // Update unread count
      const newUnreadCount = await firebaseMessaging.getUnreadCount(userId);
      setUnreadCount(newUnreadCount);
      
      return messagesData;
    } catch (error) {
      console.error('Error getting conversation messages:', error);
      throw error;
    }
  };

  const sendMessage = async (receiverId: string, content: string) => {
    try {
      const messageId = await firebaseMessaging.sendMessage({
        senderId: userId,
        receiverId,
        content,
        type: 'text',
      });

      // Update conversation
      await firebaseMessaging.upsertConversation([userId, receiverId], content);
      
      return messageId;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  };

  const listenToConversation = (otherUserId: string, callback: (messages: Message[]) => void) => {
    return firebaseMessaging.listenToMessages(userId, otherUserId, callback);
  };

  return {
    messages,
    conversations,
    unreadCount,
    loading,
    getConversationMessages,
    sendMessage,
    listenToConversation,
  };
}