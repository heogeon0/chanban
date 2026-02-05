"use client"

import * as AvatarPrimitive from "@radix-ui/react-avatar"
import * as React from "react"

import { cn } from "@/shared/ui/lib/utils"

function Avatar({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Root>) {
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      className={cn(
        "relative flex size-8 shrink-0 overflow-hidden rounded-full",
        className
      )}
      {...props}
    />
  )
}

function AvatarImage({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Image>) {
  return (
    <AvatarPrimitive.Image
      data-slot="avatar-image"
      className={cn("aspect-square size-full object-cover", className)}
      {...props}
    />
  )
}

function AvatarFallback({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Fallback>) {
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={cn(
        "bg-muted flex size-full items-center justify-center rounded-full",
        className
      )}
      {...props}
    />
  )
}

interface UserAvatarProps {
  user: {
    nickname: string
    profileImageUrl?: string | null
  } | null
  size?: "sm" | "md" | "lg"
  className?: string
}

const sizeClasses = {
  sm: "size-8 text-xs",
  md: "size-10 text-sm",
  lg: "size-12 text-base",
}

/**
 * 유저 정보를 받아 아바타를 렌더링하는 컴포넌트
 * @param user - 유저 정보 (nickname, profileImageUrl). null인 경우 기본 아바타 표시
 * @param size - 아바타 크기 (sm: 32px, md: 40px, lg: 48px)
 */
function UserAvatar({ user, size = "md", className }: UserAvatarProps) {
  const hasUser = user && user.nickname
  const fallbackText = hasUser ? user.nickname.slice(0, 2).toUpperCase() : ""
ㅓ
  return (
    <Avatar className={cn(sizeClasses[size], className)}>
      {user?.profileImageUrl && (
        <AvatarImage src={user.profileImageUrl} alt={user.nickname} />
      )}
      <AvatarFallback
        className={cn(
          "font-bold",
          hasUser
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-muted-foreground"
        )}
      >
        {fallbackText}
      </AvatarFallback>
    </Avatar>
  )
}

export { Avatar, AvatarFallback, AvatarImage, UserAvatar }

