export function convertDurationtoTimeString(duration: number) {
  const hours = Math.floor(duration / 3600);
  const minutes = Math.floor((duration % 3600) / 60);
  const seconds = duration % 60;

  const timeString = [hours, minutes, seconds]
    .map(unit => String(unit).padStart(2, '0')) //adiciona o 0 para nao ficar com o horas por exemplo só 1, e sim 01
    .join(':')
  //poderia fazer isso com template string também

  return timeString;
}