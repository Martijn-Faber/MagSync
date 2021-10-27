import Link from './link';
import Subject from './subject';
import Teacher from './teacher';
import Classroom from './classroom';

export interface Appointment {
  Id: number;
  Links: Link[];
  Start: string;
  Einde: string;
  LesuurVan: number;
  LesuurTotMet: number;
  DuurtHeleDag: boolean;
  Omschrijving: string;
  Lokatie: string;
  Status: number;
  Type: string;
  IsOnlineDeelname: boolean;
  WeergaveType: string;
  Inhoud: string;
  InfoType: number;
  Aantekening: string;
  Afgerond: boolean;
  HerhaalStatus: number;
  Vakken: Subject[];
  Docenten: Teacher[];
  Lokalen: Classroom[];
  Groepen: any;
  OpdrachtId: number;
  HeeftBijlagen: boolean;
  Bijlagen: any;
}
