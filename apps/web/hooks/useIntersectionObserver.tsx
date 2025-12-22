import { RefObject, useEffect, useRef, useState } from "react";

type Elem = Element | null


const DefaultOptions: IntersectionObserverInit = {
  threshold: 0,
}


const useIntersectionObserver = (elemRef: RefObject<Elem | Elem[]>, options: IntersectionObserverInit = DefaultOptions) => {

  const observerRef = useRef<IntersectionObserver | null>(null)
  const [entries, setEntries] = useState<IntersectionObserverEntry[]>([])


  useEffect(() => {
    const node = elemRef.current

    const handleIntersect = (entries: IntersectionObserverEntry[]) => {
      setEntries(prev => {

        return Array.from(new Map(prev.concat(entries).map(e => [e.target, e])).values()).filter(e => e.isIntersecting)
      })
    }


    if (!node) return

    const observer = new IntersectionObserver(handleIntersect, options)
    observerRef.current = observer

    if (Array.isArray(node)) node.forEach(n => n && observer.observe(n))
    else observer.observe(node)

    return () => {
      observerRef.current?.disconnect()
    }
  }, [elemRef, options])

  return { entries, observerRef: observerRef.current }
}


export default useIntersectionObserver