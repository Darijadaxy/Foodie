using Microsoft.AspNetCore.Mvc;
using StackExchange.Redis;
using System.Text.Json;
using RedisRestorani.Entiteti;
using Microsoft.AspNetCore.Authorization;

namespace RedisRestorani.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class StavkaUKorpiController : ControllerBase
    {
        private readonly IDatabase _redisDb;
        private readonly IUserService _userService;

        public StavkaUKorpiController(IConnectionMultiplexer mux, IUserService userService)
        {
            _redisDb = mux.GetDatabase();
             this._userService = userService;
        }

        [HttpPost("DodajStavkuUKorpu"), Authorize(Roles = "user")]
        public async Task<IActionResult> DodajStavkuUKorpu( [FromBody] StavkaUKorpiDTO cartItem) //ova funkcija bi na svaki klik na neku hranu, uz podesenu kolicinu dodala hranu
        {
            try{

            
                var emailKorisnika = _userService.GetUser(); //preuzimam iz tokena
                if(emailKorisnika == null)
                {
                    return StatusCode(401, $"Došlo je do greške prilikom preuzimanja informacija iz tokena");
                }
                    
                string? korisnikId = await _redisDb.HashGetAsync($"users.email.addresses", emailKorisnika);


                bool korisnikPostoji =  await _redisDb.KeyExistsAsync($"korisnik:{korisnikId}:id");
                if (!korisnikPostoji)
                {
                    return BadRequest("Korsnik ne postoji.");
                }

                string cartKey = $"korpa:{korisnikId}:hrana";

                bool hranaPostoji = await _redisDb.KeyExistsAsync($"hrana:{cartItem.HranaId}:id");
                if (!hranaPostoji)
                {
                    return NotFound("Hrana nije pronađena.");
                }

               
                var hranaKolicinaStr = await _redisDb.HashGetAsync($"hrana:{cartItem.HranaId}:id", "Kolicina");
                if (string.IsNullOrEmpty(hranaKolicinaStr))
                {
                    return StatusCode(500, "Greška pri preuzimanju dostupne količine hrane.");
                }

                int dostupnaKolicina = int.Parse(hranaKolicinaStr!);
                if (cartItem.Kolicina > dostupnaKolicina)
                {
                    return BadRequest($"Nema dovoljno količine hrane. Dostupno: {dostupnaKolicina}.");
                }


                
                if (cartItem.Kolicina > 0)
                {
                  
                    await _redisDb.HashSetAsync(cartKey, cartItem.HranaId, cartItem.Kolicina);
                }
                else
                {   
                    await _redisDb.HashDeleteAsync(cartKey, cartItem.HranaId);
                }

                return Ok("Hrana je uspesno dodata u korpu.");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Došlo je do greške: {ex.Message}");
            }
        }

       
        [HttpPost("DodajStavkeUKorpu/{korisnikId}"), Authorize(Roles = "user")]
        public async Task<IActionResult> DodajStavkeUKorpu(string korisnikId, [FromBody] List<StavkaUKorpiDTO> cartItems)
        {
            try{
                bool korisnikPostoji = await _redisDb.KeyExistsAsync($"korisnik:{korisnikId}:id"); 
                if (!korisnikPostoji)
                {
                    return BadRequest("Korisnik ne postoji.");
                }


                string cartKey = $"cart:{korisnikId}:items";

                foreach (var cartItem in cartItems)
                {

                    var hranaKolicinaStr = await _redisDb.HashGetAsync($"hrana:{cartItem.HranaId}:id", "Kolicina");
                    if (string.IsNullOrEmpty(hranaKolicinaStr))
                    {
                        return StatusCode(500, "Greška pri preuzimanju dostupne količine hrane.");
                    }

                    int dostupnaKolicina = int.Parse(hranaKolicinaStr!);
                    if (cartItem.Kolicina > dostupnaKolicina)
                    {
                        return BadRequest($"Nema dovoljno količine hrane. Dostupno: {dostupnaKolicina}.");
                    }
                    
                    if (cartItem.Kolicina > 0)
                    {
                        await _redisDb.HashSetAsync(cartKey, cartItem.HranaId, cartItem.Kolicina);

                    }
                    else
                    {
                        await _redisDb.HashDeleteAsync(cartKey, cartItem.HranaId);
                    }
                }

                return Ok("Sve stavke su uspešno dodate u korpu.");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Došlo je do greške: {ex.Message}");
            }
        }

        [HttpDelete("izbaciStavkuIzKorpe/{hranaId}"), Authorize(Roles = "user")]
        public async Task<IActionResult> IzbaciStavkuIzKorpe( string hranaId)  
        {
            try{

            
                var emailKorisnika = _userService.GetUser(); 
                if(emailKorisnika == null)
                {
                    return StatusCode(401, $"Došlo je do greške prilikom preuzimanja informacija iz tokena");
                }
                    
                string? korisnikId = await _redisDb.HashGetAsync($"users.email.addresses", emailKorisnika);

                string cartKey = $"korpa:{korisnikId}:hrana"; 

                
                bool itemExists = await _redisDb.HashExistsAsync(cartKey, hranaId);
                if (!itemExists)
                {
                    return NotFound("Hrana sa tim ID-jem nije u korpi.");
                }

                
                await _redisDb.HashDeleteAsync(cartKey, hranaId);

                return Ok($"Stavka/Hrana je uspesno izbacena iz korpe!");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Došlo je do greške: {ex.Message}");
            }
        }

        [HttpGet("preuzmiKorpuSaCenom"), Authorize(Roles = "user")]
        public async Task<IActionResult> PreuzmiKorpuSaCenom()
        {
            try{

                var emailKorisnika = _userService.GetUser(); 
                if(emailKorisnika == null)
                {
                    return StatusCode(401, $"Došlo je do greške prilikom preuzimanja informacija iz tokena");
                }
                    
                string? korisnikId = await _redisDb.HashGetAsync($"users.email.addresses", emailKorisnika);

                string cartKey = $"korpa:{korisnikId}:hrana";
                var cartItems = await _redisDb.HashGetAllAsync(cartKey);

                var cartWithDetails = new List<object>();

                if (cartItems.Length == 0)
                {
                    return Ok(new
                    {
                        Stavke = cartWithDetails,
                        UkupnaCena = 0.0
                    });
                }

                decimal ukupnaCena = 0;

                foreach (var item in cartItems)
                {
                    string hranaId = item.Name!;
                    int kolicina = (int)item.Value;

                    string kljucHrana = $"hrana:{hranaId}:id";
                    var naziv = await _redisDb.HashGetAsync(kljucHrana, "Naziv");
                    var cenaValue = await _redisDb.HashGetAsync(kljucHrana, "Cena");

                    if (!naziv.HasValue || !cenaValue.HasValue)
                    {
                        return NotFound($"Hrana sa ID-jem {hranaId} ne postoji.");
                    }

                    decimal cena = decimal.Parse(cenaValue!);
                    decimal ukupnoZaHranu = cena * kolicina;
                    ukupnaCena += ukupnoZaHranu;

                    cartWithDetails.Add(new
                    {
                        HranaId = hranaId,
                        Naziv = naziv.ToString(),
                        Cena = cena,
                        Kolicina = kolicina,
                        Ukupno = ukupnoZaHranu
                    });
                }

                return Ok(new
                {
                    Stavke = cartWithDetails,
                    UkupnaCena = ukupnaCena
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Došlo je do greške: {ex.Message}");
            }
        }

        [HttpDelete("poruciHranu"), Authorize(Roles = "user")]
        public async Task<IActionResult> PoruciHranu()
        {
            try{

                var emailKorisnika = _userService.GetUser(); 
                if(emailKorisnika == null)
                {
                    return StatusCode(401, $"Došlo je do greške prilikom preuzimanja informacija iz tokena");
                }
                    
                string? korisnikId = await _redisDb.HashGetAsync($"users.email.addresses", emailKorisnika);


                string cartKey = $"korpa:{korisnikId}:hrana";

                
                var cartItems = await _redisDb.HashGetAllAsync(cartKey);
                if (cartItems.Length == 0)
                {
                    return BadRequest("Korpa je prazna!");
                }
              
                foreach (var item in cartItems)
                {
                    string hranaId = item.Name!;
                    int kolicinaPorucena = int.Parse(item.Value!);

                    
                    string hranaKey = $"hrana:{hranaId}:id";


                    
                    var dostupnaKolicinaStr = await _redisDb.HashGetAsync(hranaKey, "Kolicina");
                    if (!dostupnaKolicinaStr.HasValue)
                    {
                        return NotFound($"Hrana sa ID-jem {hranaId} nije pronađena.");
                    }

                    int dostupnaKolicina = int.Parse(dostupnaKolicinaStr!);

                    
                    if (dostupnaKolicina < kolicinaPorucena)
                    {
                        return BadRequest($"Nema dovoljno proizvoda sa ID-jem {hranaId}. Dostupno: {dostupnaKolicina}.");
                    }

                    
                    int novaKolicina = dostupnaKolicina - kolicinaPorucena;
                    await _redisDb.HashSetAsync(hranaKey, "Kolicina", novaKolicina);

                }

               
                await _redisDb.KeyDeleteAsync(cartKey);

                return Ok("Uspesna kupovina");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Došlo je do greške: {ex.Message}");
            }
        }

        [HttpDelete("IzbrisiSveIzKorpe"), Authorize(Roles = "user")] 
        public async Task<IActionResult> IzbrisiSveIzKorpe()
        {
            try{
                var emailKorisnika = _userService.GetUser(); 
                if(emailKorisnika == null)
                {
                    return StatusCode(401, $"Došlo je do greške prilikom preuzimanja informacija iz tokena");
                }
                    
                string? korisnikId = await _redisDb.HashGetAsync($"users.email.addresses", emailKorisnika);

                string cartKey = $"korpa:{korisnikId}:hrana";

                
                var cartItems = await _redisDb.HashGetAllAsync(cartKey);
                if (cartItems.Length == 0)
                {
                    return BadRequest("Korpa je prazna!");
                }

                await _redisDb.KeyDeleteAsync(cartKey);

                return Ok("Sva hrana iz korpe je uklonjena");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Došlo je do greške: {ex.Message}");
            }
        }

    }

}