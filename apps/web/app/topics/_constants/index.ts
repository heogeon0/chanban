import { PostTag } from "@chanban/shared-types";

export const TAG_MAP = {
  'hot': {
    id: 'hot',
    name: "인기",
    variant: 'agree' as const,
  },
  'recent': {
    id: 'recent',
    name: "최신",
    variant: 'disagree' as const,
  },
  [PostTag.POLITICS]: {
    id: PostTag.POLITICS,
    name: "정치",
    variant: 'default' as const,
  },
  [PostTag.SOCIETY]: {
    id: PostTag.SOCIETY,
    name: "사회",
    variant: 'default' as const,
  },
  [PostTag.ECONOMY]: {
    id: PostTag.ECONOMY,
    name: "경제",
    variant: 'default' as const,
  },
  [PostTag.TECHNOLOGY]: {
    id: PostTag.TECHNOLOGY,
    name: "기술",
    variant: 'default' as const,
  },
  [PostTag.ENTERTAINMENT]: {
    id: PostTag.ENTERTAINMENT,
    name: "연예",
    variant: 'default' as const,
  },
    [PostTag.SPORTS]: {
    id: PostTag.SPORTS,
    name: "스포츠",
    variant: 'default' as const,
  },
  [PostTag.OTHER]: {
    id: PostTag.OTHER,
    name: "기타",
    variant: 'default' as const,
  },
}