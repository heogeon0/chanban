import { useQuery } from "@tanstack/react-query";
import { GENERATE_DUMMY_TOPIC } from "../_controller/mapper";
import { Topic } from "../_controller/types";


/** todo: 임시코드 */
const useTopic = (selector: (data: unknown) => Topic) => {
  return useQuery({
    /** todo: 쿼리키는 추후 정리 */
    queryKey: ["topic"],
    queryFn: () => selector(GENERATE_DUMMY_TOPIC()),
  });
};

export default useTopic;