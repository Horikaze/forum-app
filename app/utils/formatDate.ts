export function formatDatePost(date: Date): string {
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
}

export function getFormattedDate(): string {
  const now = new Date();

  // Get month, day, and year
  let month: number | string = now.getMonth() + 1; // Months are zero-based
  let day: number | string = now.getDate();
  let year: number | string = now.getFullYear();

  // Format year as last two digits
  year = year % 100;

  // Add leading zeroes if necessary
  month = month < 10 ? `0${month}` : month;
  day = day < 10 ? `0${day}` : day;
  year = year < 10 ? `0${year}` : year;

  // Construct the formatted date string
  return `${day}-${month}-${year}`;
}
