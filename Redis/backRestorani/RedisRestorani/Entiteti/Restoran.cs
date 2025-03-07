namespace Entiteti;
public class Restoran
{
    public string? IdRestorana { get; set; }
    public required string Naziv { get; set; }
    public required string Adresa { get; set; }
    public required string Telefon { get; set; }
    public required string Opis { get; set; }
    public required string Slika { get; set; }
    public double? ProsecnaOcena { get; set; }
      public List<string>? HranaId { get; set; } 

}