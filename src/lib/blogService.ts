import { supabase } from './supabase';

export interface BlogPost {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  category: string;
  date: string;
  author: string;
  status: 'DRAFT' | 'PUBLISHED';
  image?: string;
  tags?: string[];
  series?: string;
  seriesOrder?: number;
  canonicalUrl?: string;
  volume?: string;
}

export interface BlogComment {
  id: string;
  postId: string;
  author: string;
  content: string;
  date: string;
}

export const blogService = {
  getPosts: async (): Promise<BlogPost[]> => {
    const { data, error } = await supabase
      .from('blogs')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching posts:', error);
      return [];
    }
    return data as BlogPost[];
  },

  getPostById: async (id: string): Promise<BlogPost | undefined> => {
    const { data, error } = await supabase
      .from('blogs')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching post:', error);
      return undefined;
    }
    return data as BlogPost;
  },

  savePost: async (post: BlogPost) => {
    const { data, error } = await supabase
      .from('blogs')
      .upsert({
        ...post,
        // Ensure ID is valid UUID or let Supabase generate it
        id: post.id.includes('-') ? post.id : undefined 
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  deletePost: async (id: string) => {
    const { error } = await supabase
      .from('blogs')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  getComments: async (postId: string): Promise<BlogComment[]> => {
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .eq('postId', postId)
      .order('created_at', { ascending: false });
    
    if (error) return [];
    return data as BlogComment[];
  },

  addComment: async (comment: Omit<BlogComment, 'id' | 'date'>) => {
    const { data, error } = await supabase
      .from('comments')
      .insert({
        ...comment,
        date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};
