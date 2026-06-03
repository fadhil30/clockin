import { useState, useEffect } from 'react';
import { format } from 'date-fns';

export const useCurrentTime = () => {
  const [now, setNow] = useState<Date>(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return { date: format(now, 'EEEE, dd MMMM yyyy'), time: format(now, 'HH:mm:ss') };
};
