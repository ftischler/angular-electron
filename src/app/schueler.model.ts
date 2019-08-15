export interface Schueler {
  id: string;
  vorname: string;
  nachname: string;
  gebdatum: Date;
  geschlecht: 'M' | 'W';
}
