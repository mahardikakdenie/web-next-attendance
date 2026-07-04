import { useQuery } from "@tanstack/react-query";
import { getActiveProjects } from "@/service/timesheet";

export function useActiveProjects(enabled: boolean) {
  const { data: projectsResp } = useQuery({
    queryKey: ["active-projects"],
    queryFn: () => getActiveProjects(),
    enabled,
  });

  return {
    projects: projectsResp?.data || [],
  };
}
