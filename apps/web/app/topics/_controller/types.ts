

export interface Topic {
  id: string;
  title: string;
  description: string;
  category: string;
  approve: number;
  disagree: number;
  commentCount: number;
  creator: Creator;
  createdAt: Date;
}


type Opinion = "agree" | "disagree";

interface Creator {
  id: string;
  name: string;
  profileImage: string;
  opinion: Opinion;
}


interface CommentCreator extends Creator {
  opinionLog: Opinion[];
}

export interface Comment {
  id: string;
  content: string;
  creator: CommentCreator;
  opinion: Opinion;
  opinionLog: Opinion[];
  createdAt: Date;
  likeCount: number;
  replies: Comment[];
}


export interface TopicDetail {
  id: string;
  title: string;
  description: string;
  category: string;
  approve: number;
  disagree: number;
  commentCount: number;
  creator: Creator;
  createdAt: Date;
  comments: Comment[];
}