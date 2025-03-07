namespace Entiteti;
public class Hrana
{

    public string? IdHrane { get; set; } 
    public required string Naziv { get; set; }
    public required double Cena { get; set; } 
    public required string Opis { get; set; } 
    public required string Slika { get; set; }
    public required string Kategorija { get; set; } 

    public required string RestoranId { get; set; } 

    public required int Kolicina { get; set; } 

}