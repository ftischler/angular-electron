export interface Schueler {
  vorname: string;
  nachname: string;
  gebdatum: string;
}

export interface SchuelerMitKlasse extends Schueler {
  klasse: string
}
