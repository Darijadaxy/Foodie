using Entiteti;
using Microsoft.AspNetCore.Mvc;
using StackExchange.Redis;
using System.Text.Json;
using KeyHelper;
using Microsoft.AspNetCore.Authorization;

namespace RedisRestorani.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class HranaController : ControllerBase
    {
        private readonly IDatabase _redisDb;
        private readonly GlobalCounter gCounter;

        private readonly string globalCounterKey = "next.food.id";
        public HranaController(IConnectionMultiplexer mux)
        {
            _redisDb = mux.GetDatabase();
            gCounter = new GlobalCounter(mux);
            if (!gCounter.CheckNextGlobalCounterExists(globalCounterKey))
            {
                _redisDb.StringSet(globalCounterKey, "0");
            }
        }

        [HttpPost("dodajHranu"), Authorize(Roles = "admin")]
        public async Task<IActionResult> DodajHranu([FromBody] Hrana hrana)
        {
            if (hrana == null)
            {
                return BadRequest("Objekat hrane nije validan.");
            }

            try
            {
                string generatedId = gCounter.GetNextId(globalCounterKey);
         

                
                bool restoranPostoji = await _redisDb.KeyExistsAsync($"restoran:{hrana.RestoranId}:id");
                if (!restoranPostoji)
                {
                    return BadRequest("Restoran kome zelite da dodelite hranu ne postoji.");
                }
                await _redisDb.HashSetAsync($"hrana:{generatedId}:id",
                [
                    new HashEntry("Id", $"hrana:{generatedId}:id"), 
                    new HashEntry("Naziv", hrana.Naziv ?? string.Empty),
                    new HashEntry("Cena", hrana.Cena.ToString("F2")), 
                    new HashEntry("Opis", hrana.Opis ?? string.Empty),
                    new HashEntry("Slika", hrana.Slika ?? string.Empty),
                    new HashEntry("Kategorija", hrana.Kategorija ?? string.Empty),
                    new HashEntry("RestoranId", hrana.RestoranId ?? string.Empty), 
                    new HashEntry("Kolicina", hrana.Kolicina.ToString()),
                ]);

         
                await _redisDb.SetAddAsync($"restaurant:{hrana.RestoranId}:foods", $"hrana:{generatedId}:id");

     
                await _redisDb.SetAddAsync("all_food_ids", $"hrana:{generatedId}:id");

                return Ok("Hrana restorana je uspešno dodata.");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Došlo je do greške: {ex.Message}");
            }
        }

        [HttpGet("preuzmiHranu/{id}")]
        public async Task<IActionResult> PreuzmiHranu(string id) 
        {
      
            var hashEntries = await _redisDb.HashGetAllAsync($"hrana:{id}:id");
         
            if (hashEntries == null || hashEntries.Length == 0)
            {
                return NotFound("Hrana nije pronađena.");
            }

            var hrana = new Hrana
            {
                IdHrane = hashEntries.FirstOrDefault(e => e.Name == "Id").Value,
                Naziv = hashEntries.FirstOrDefault(e => e.Name == "Naziv").Value.ToString(),
                Cena = Convert.ToDouble(hashEntries.FirstOrDefault(e => e.Name == "Cena").Value),
                Opis = hashEntries.FirstOrDefault(e => e.Name == "Opis").Value.ToString(),
                Slika = hashEntries.FirstOrDefault(e => e.Name == "Slika").Value.ToString(),
                Kategorija = hashEntries.FirstOrDefault(e => e.Name == "Kategorija").Value.ToString(),
                RestoranId = hashEntries.FirstOrDefault(e => e.Name == "RestoranId").Value.ToString(), 
                Kolicina = Convert.ToInt32(hashEntries.FirstOrDefault(e => e.Name == "Kolicina").Value),
            };

          

            return Ok(hrana);
        }

        [HttpDelete("obrisiHranu/{id}"), Authorize(Roles = "admin")]
        public async Task<IActionResult> ObrisiHranu(int id)
        {
            var hashEntries = await _redisDb.HashGetAllAsync($"hrana:{id}:id");
           
            if (hashEntries == null || hashEntries.Length == 0)
            {
                return NotFound("Hrana nije pronađena.");
            }

            string idRestorana = hashEntries.FirstOrDefault(e => e.Name == "RestoranId").Value.ToString();

           
            await _redisDb.SetRemoveAsync($"restaurant:{idRestorana}:foods", $"hrana:{id}:id");

            var deleted = await _redisDb.KeyDeleteAsync($"hrana:{id}:id");
            if (!deleted)
            {
                return NotFound("Hrana nije pronađena za brisanje.");
            }


           
            await _redisDb.SetRemoveAsync("all_food_ids", $"hrana:{id}:id");

            return Ok("Hrana uspešno obrisana.");
        }

        [HttpPut("azurirajHranu/{idHrane}"), Authorize(Roles = "admin")]
        public async Task<IActionResult> AzurirajHranu(string idHrane, [FromBody] HranaDTO hrana)
        {
            if (hrana == null)
            {
                return BadRequest("Podaci za ažuriranje nisu validni.");
            }

            try
            {
                bool hranaPostoji = await _redisDb.KeyExistsAsync($"hrana:{idHrane}:id");
                if (!hranaPostoji)
                {
                    return NotFound("Hrana sa datim ID-jem nije pronađena.");
                }

                var hashEntries = new List<HashEntry>();

                if (!string.IsNullOrEmpty(hrana.Naziv))
                {
                    hashEntries.Add(new HashEntry("Naziv", hrana.Naziv));
                }
                if (!string.IsNullOrEmpty(hrana.Cena.ToString()))
                {
                    hashEntries.Add(new HashEntry("Cena", hrana.Cena.ToString()));
                }
                if (!string.IsNullOrEmpty(hrana.Opis))
                {
                    hashEntries.Add(new HashEntry("Opis", hrana.Opis));
                }
                if (!string.IsNullOrEmpty(hrana.Slika))
                {
                    hashEntries.Add(new HashEntry("Slika", hrana.Slika));
                }
                if (!string.IsNullOrEmpty(hrana.Kategorija))
                {
                    hashEntries.Add(new HashEntry("Kategorija", hrana.Kategorija));
                }
                if (!string.IsNullOrEmpty(hrana.Kolicina.ToString()))
                {
                    hashEntries.Add(new HashEntry("Kolicina", hrana.Kolicina.ToString()));
                }

               
                if (hashEntries.Count > 0)
                {
                    await _redisDb.HashSetAsync($"hrana:{idHrane}:id", [.. hashEntries]);
                    return Ok("Hrana je uspešno ažurirana.");
                }
                else
                {
                    return BadRequest("Nema validnih polja za ažuriranje.");
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Došlo je do greške: {ex.Message}");
            }
        }

        [HttpGet("preuzmiSvuHranu")]
        public async Task<IActionResult> PreuzmiSvuHranu()
        {
            try
            {
                
                var kljuceviHrane = await _redisDb.SetMembersAsync("all_food_ids");

                if (kljuceviHrane == null || kljuceviHrane.Length == 0)
                {
                    return NotFound("Nema hrane u bazi.");
                }

                var sveHrane = new List<Hrana>();

                foreach (var kljuc in kljuceviHrane)
                {
                   
                    var hashEntries = await _redisDb.HashGetAllAsync(kljuc.ToString());

                    var hrana = new Hrana
                    {
                        IdHrane = kljuc.ToString().Split(":")[1],
                        Naziv = hashEntries.FirstOrDefault(e => e.Name == "Naziv").Value.ToString(),
                        Cena = Convert.ToDouble(hashEntries.FirstOrDefault(e => e.Name == "Cena").Value),
                        Opis = hashEntries.FirstOrDefault(e => e.Name == "Opis").Value.ToString(),
                        Slika = hashEntries.FirstOrDefault(e => e.Name == "Slika").Value.ToString(),
                        Kategorija = hashEntries.FirstOrDefault(e => e.Name == "Kategorija").Value.ToString(),
                        RestoranId = hashEntries.FirstOrDefault(e => e.Name == "RestoranId").Value.ToString(),
                        Kolicina = Convert.ToInt32(hashEntries.FirstOrDefault(e => e.Name == "Kolicina").Value),
                    };

                    sveHrane.Add(hrana);
                }

                return Ok(sveHrane);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Došlo je do greške: {ex.Message}");
            }
        }
    }
}