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

// Map raw Supabase row (snake_case) back to camelCase BlogPost
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapRowToPost(row: any): BlogPost {
  return {
    id: row.id,
    title: row.title,
    content: row.content,
    excerpt: row.excerpt,
    category: row.category,
    date: row.date,
    author: row.author,
    status: row.status,
    image: row.image ?? undefined,
    tags: row.tags ?? [],
    series: row.series ?? undefined,
    // Try both snake_case and camelCase
    seriesOrder: row.series_order ?? row.seriesOrder ?? undefined,
    canonicalUrl: row.canonical_url ?? row.canonicalUrl ?? undefined,
    volume: row.volume ?? undefined,
  };
}

// Map raw Supabase row (snake_case) back to camelCase BlogComment
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapRowToComment(row: any): BlogComment {
  return {
    id: row.id,
    postId: row.post_id ?? row.postId,
    author: row.author,
    content: row.content,
    date: row.date,
  };
}

export const blogService = {
  getPosts: async (): Promise<BlogPost[]> => {
    const { data, error } = await supabase
      .from('blogs')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Supabase getPosts error:', error);
      console.error('Details:', error.details);
      return [];
    }
    return (data ?? []).map(mapRowToPost);
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
    return mapRowToPost(data);
  },

  savePost: async (post: BlogPost) => {
    // Map camelCase JS fields to snake_case DB columns
    const payload: Record<string, unknown> = {
      title: post.title,
      content: post.content,
      excerpt: post.excerpt,
      category: post.category,
      date: post.date,
      author: post.author,
      status: post.status,
      image: post.image ?? null,
      tags: post.tags ?? [],
      series: post.series ?? null,
      series_order: post.seriesOrder ?? null,
      canonical_url: post.canonicalUrl ?? null,
      volume: post.volume ?? null,
    };

    // Only include id if it's a valid UUID (edit). Let Supabase generate for new posts.
    if (post.id && post.id.includes('-')) {
      payload.id = post.id;
    }

    const { data, error } = await supabase
      .from('blogs')
      .upsert(payload)
      .select()
      .single();

    if (error) {
      console.error('Supabase savePost full error:', error);
      console.error('Error Message:', error.message);
      console.error('Error Details:', error.details);
      console.error('Error Hint:', error.hint);
      throw new Error(`${error.message} (code: ${error.code})`);
    }
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
      .eq('post_id', postId)
      .order('created_at', { ascending: false });
    
    if (error) return [];
    return (data ?? []).map(mapRowToComment);
  },

  addComment: async (comment: Omit<BlogComment, 'id' | 'date'>) => {
    const { data, error } = await supabase
      .from('comments')
      .insert({
        post_id: comment.postId,
        author: comment.author,
        content: comment.content,
        date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
      })
      .select()
      .single();
    
    if (error) {
      console.error('Supabase addComment full error:', error);
      console.error('Error Message:', error.message);
      console.error('Error Details:', error.details);
      throw new Error(`${error.message} (code: ${error.code})`);
    }
    return mapRowToComment(data);
  }
};
