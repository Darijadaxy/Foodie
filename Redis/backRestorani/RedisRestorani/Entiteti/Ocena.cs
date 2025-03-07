namespace Entiteti;
public class Ocena
{
    public string? IdOcene { get; set; }
    public required string RestoranId { get; set; } 

    public required string KorisnikId { get; set; } 

    public required double Vrednost { get; set; } // Brojčana vrednost ocene ( 1-5)
}