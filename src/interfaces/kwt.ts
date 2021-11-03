import Classroom from './classroom';
import Teacher from './teacher';

export interface Kwt {
  Begin: string;
  Einde: string;
  Keuzes: Choise[];
  MagInschrijven: boolean;
}

export interface Choise {
  Id: number;
  Begin: string;
  Einde: string;
  Docenten: Teacher[];
  Lokalen: Classroom[];
  Omschrijving: string;
  Inhoud: string;
  MaxDeelnemers: number;
  AantalDeelnemers: number;
  status: 0;
}
