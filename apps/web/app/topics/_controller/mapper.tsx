import { Topic } from "./types";


export const GENERATE_DUMMY_TOPIC = ():Topic => {
  return {
    id: crypto.randomUUID(),
    title: "대통령 선거",
    description: "대통령 선거 토픽",
    approve: 4,
    reject: 1,
    commentCount: 10,
    creator: "user1",
    createdAt: new Date(),
  };
};


export const topicMapper = (topicResponse: unknown): Topic => {
  return GENERATE_DUMMY_TOPIC();
};