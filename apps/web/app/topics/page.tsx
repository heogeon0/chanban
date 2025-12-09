import { Badge } from "@workspace/ui/components/badge"
import Link from "next/link"

const DUMMY_CATEGORIES  = [
  { id: 'c1', title: 'Italian', color: '#f5428d' },
  { id: 'c2', title: 'Quick & Easy', color: '#f5a442' },
  { id: 'c3', title: 'Hamburgers', color: '#f5d142' },
  { id: 'c4', title: 'German', color: '#368dff' },
  { id: 'c5', title: 'Light & Lovely', color: '#41d95d' },
  { id: 'c6', title: 'Exotic', color: '#9eecff' },
  { id: 'c7', title: 'Breakfast', color: '#b9ffb0' },
  { id: 'c8', title: 'Asian', color: '#ffc7ff' },
  { id: 'c9', title: 'French', color: '#47c1ff' },
]

export default function TopicsPage() {
  return (
    <div>
      <h1>Topics</h1>
      <ul>
        {DUMMY_CATEGORIES.map((category) => (
          <li key={category.id}>
            <Badge asChild>
              <Link href={`/topics/${category.id}`}>
              
            {category.title}
              </Link>
            </Badge>
          </li>
        ))}
      </ul>
    </div>
  )
}