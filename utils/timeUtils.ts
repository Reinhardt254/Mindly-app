export const timeUtils = {
  getGreeting(name: string): string {
    const hour = new Date().getHours();

    let greeting: string;
    if (hour < 12) {
      greeting = "Good morning";
    } else if (hour < 17) {
      greeting = "Good afternoon";
    } else {
      greeting = "Good evening";
    }

    return `${greeting}, ${name}!`;
  },

  isSameDay(date1: string, date2: string): boolean {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    return d1.toDateString() === d2.toDateString();
  },

  isToday(date: string): boolean {
    const today = new Date().toDateString();
    const checkDate = new Date(date).toDateString();
    return today === checkDate;
  },

  getCurrentDateString(): string {
    return new Date().toISOString();
  },

  formatTime(hours: number, minutes: number): string {
    const period = hours >= 12 ? "PM" : "AM";
    const displayHours = hours % 12 || 12;
    const displayMinutes = minutes.toString().padStart(2, "0");
    return `${displayHours}:${displayMinutes} ${period}`;
  },
};
