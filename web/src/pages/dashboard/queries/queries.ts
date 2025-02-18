
import {useQuery} from '@tanstack/react-query';
import {listScenes} from "@/request/scene.ts";

export const useListScenes = () => {
  return useQuery({
    queryKey: ['scenes'],
    queryFn: async () => listScenes()
  });
};

