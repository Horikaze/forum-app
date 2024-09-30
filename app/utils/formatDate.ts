export function formatDatePost(dateInput: string | Date): string {
  try {
    const date = new Date(dateInput);

    if (isNaN(date.getTime())) {
      throw new Error("Invalid date");
    }

    const daysOfWeek = ["ndz", "pon", "wt", "śr", "czw", "pt", "sob"];
    const months = [
      "sty",
      "lut",
      "mar",
      "kwi",
      "maj",
      "cze",
      "lip",
      "sie",
      "wrz",
      "paź",
      "lis",
      "gru",
    ];

    const dayOfWeek = daysOfWeek[date.getDay()];
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, "0");

    return `${dayOfWeek} ${day} ${month} ${year}, ${hours}:${minutes}`;
  } catch (error) {
    return "Brak daty";
  }
}

export function getFormattedDate(): string {
  const now = new Date();

  // Get month, day, and year
  let month: number | string = now.getMonth() + 1;
  let day: number | string = now.getDate();
  let year: number | string = now.getFullYear();

  year = year % 100;

  month = month < 10 ? `0${month}` : month;
  day = day < 10 ? `0${day}` : day;
  year = year < 10 ? `0${year}` : year;

  return `${day}-${month}-${year}`;
}
export function areDatesEqual(
  date1: string | Date,
  date2: string | Date,
): boolean {
  const d1 = new Date(date1);
  const d2 = new Date(date2);

  if (isNaN(d1.getTime()) || isNaN(d2.getTime())) {
    return false;
  }
  return d1.getTime() === d2.getTime();
}
