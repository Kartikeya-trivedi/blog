
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
}

export interface BlogComment {
  id: string;
  postId: string;
  author: string;
  content: string;
  date: string;
}

const STORAGE_KEY = 'the_editorial_blogs';
const COMMENTS_KEY = 'the_editorial_comments';

export const blogService = {
  getPosts: (): BlogPost[] => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  },

  getPostById: (id: string): BlogPost | undefined => {
    return blogService.getPosts().find(p => p.id === id);
  },

  savePost: (post: BlogPost) => {
    const posts = blogService.getPosts();
    const index = posts.findIndex(p => p.id === post.id);
    if (index >= 0) {
      posts[index] = post;
    } else {
      posts.unshift(post);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
  },

  deletePost: (id: string) => {
    const posts = blogService.getPosts().filter(p => p.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
  },

  getComments: (postId: string): BlogComment[] => {
    const stored = localStorage.getItem(COMMENTS_KEY);
    const allComments: BlogComment[] = stored ? JSON.parse(stored) : [];
    return allComments.filter(c => c.postId === postId);
  },

  addComment: (comment: Omit<BlogComment, 'id' | 'date'>) => {
    const stored = localStorage.getItem(COMMENTS_KEY);
    const allComments: BlogComment[] = stored ? JSON.parse(stored) : [];
    const newComment: BlogComment = {
      ...comment,
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    };
    allComments.unshift(newComment);
    localStorage.setItem(COMMENTS_KEY, JSON.stringify(allComments));
    return newComment;
  }
};
