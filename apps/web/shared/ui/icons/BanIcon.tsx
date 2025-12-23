interface BanIconProps {
  className?: string;
  size?: number;
}

/**
 * 반대(비동의) 아이콘 컴포넌트
 *
 * @param className - 추가 CSS 클래스
 * @param size - 아이콘 크기 (기본값: 24)
 */
export function BanIcon({ className, size = 24 }: BanIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect
        x="1.25"
        y="1.25"
        width="21.5"
        height="21.5"
        rx="10.75"
        stroke="currentColor"
        strokeWidth="2.5"
      />
      <path
        d="M7.774 6.936H10.749V4.845H13.418V13.192H5.105V4.845H7.774V6.936ZM8.488 14.382V17.17H18.399V19.227H5.819V14.382H8.488ZM18.229 9.588V14.824H15.56V4.675H18.229V7.514H19.708V9.588H18.229ZM10.749 9.01H7.774V11.118H10.749V9.01Z"
        fill="currentColor"
      />
    </svg>
  );
}
