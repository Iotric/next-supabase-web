import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

export const meKeys = {
  all: ["me"] as const,
};

export function useMe() {
  return useQuery({
    queryKey: meKeys.all,
    queryFn: async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      return user;
    },
  });
}
