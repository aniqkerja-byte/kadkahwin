export const event = {
  start: new Date('2027-05-22T11:00:00+08:00'),
  end: new Date('2027-05-22T16:30:00+08:00'),
};
export function countdownAt(now = new Date()) {
  if (now >= event.end) return { state: 'ended', message: 'Terima kasih atas doa dan kehadiran anda.' };
  if (now >= event.start) return { state: 'ongoing', message: 'Hari yang dinanti telah tiba. Selamat datang!' };
  const minutes = Math.ceil((event.start - now) / 60000);
  return { state: 'upcoming', days: Math.floor(minutes / 1440), hours: Math.floor(minutes % 1440 / 60), minutes: minutes % 60 };
}
export function calendarFile() {
  return [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//JANJI//Wedding Demo//MS',
    'CALSCALE:GREGORIAN', 'BEGIN:VEVENT', 'UID:hana-danish-20270522@janji.demo',
    'DTSTAMP:20261022T000000Z', 'DTSTART:20270522T030000Z', 'DTEND:20270522T083000Z',
    'SUMMARY:Walimatulurus Hana Sofea & Danish Hakimi',
    'LOCATION:Masjid Negara\\, Kuala Lumpur',
    'DESCRIPTION:Jemputan perkahwinan rekaan untuk demo portfolio.',
    'END:VEVENT', 'END:VCALENDAR', ''
  ].join('\r\n');
}
