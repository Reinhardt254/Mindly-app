import { timeUtils } from "@/utils/timeUtils";
import { useEffect, useState } from "react";

export const useGreeting = (userName: string | null) => {
  const [greeting, setGreeting] = useState<string>("");

  useEffect(() => {
    if (userName) {
      setGreeting(timeUtils.getGreeting(userName));
    }
  }, [userName]);

  // Update greeting every minute to handle time changes
  useEffect(() => {
    if (!userName) return;

    const updateGreeting = () => {
      setGreeting(timeUtils.getGreeting(userName));
    };

    // Update immediately
    updateGreeting();

    // Update every minute
    const interval = setInterval(updateGreeting, 60000);

    return () => clearInterval(interval);
  }, [userName]);

  return greeting;
};
