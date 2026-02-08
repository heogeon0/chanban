import cx from "classnames";
import Link from "next/link";

type Props = {
  selectedTag: string;
  selectedSort: string;
}

const LinkButtonClassName = {
  default: "px-3 py-1 text-[10px] desktop:text-xs font-bold rounded transition-colors",
  active: "bg-card shadow-sm text-primary",
  inactive: "text-muted-foreground hover:text-foreground",
};

const ListToggle = ({ selectedTag, selectedSort }: Props) => {
  return (
    <div className="flex bg-muted p-1 rounded-lg">
      <Link
        href={`/topics?tag=${selectedTag}&sort=latest`}
        className={cx(LinkButtonClassName.default, {
          [LinkButtonClassName.active]: selectedSort === "latest",
          [LinkButtonClassName.inactive]: selectedSort !== "latest",
        })}
      >
        최신
      </Link>
      <Link
        href={`/topics?tag=${selectedTag}&sort=popular`}
        className={cx(LinkButtonClassName.default, {
          [LinkButtonClassName.active]: selectedSort === "popular",
          [LinkButtonClassName.inactive]: selectedSort !== "popular",
        })}
      >
        인기
      </Link>
    </div>
  )
}

export default ListToggle;