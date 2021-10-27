export default interface Account {
  UuId: string;
  Persoon: {
    Id: number;
    Roepnaam: string;
    Tussenvoegsel: string;
    Achternaam: string;
    OfficieleVoornamen: string;
    Voorletters: string;
    OfficieleTussenvoegsels: string;
    OfficieleAchternaam: string;
    Geboortedatum: string;
    GeboorteAchternaam: string;
    GeboortenaamTussenvoegsels: string;
    GebruikGeboortenaam: boolean;
  };
}
