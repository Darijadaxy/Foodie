using Entiteti;
using Microsoft.AspNetCore.Mvc;
using StackExchange.Redis;
using System.Text.Json;
using KeyHelper;
using BCrypt.Net;
using System.Security.Claims;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Text;
using Microsoft.AspNetCore.Authorization;

namespace RedisRestorani.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class KorisnikController : ControllerBase
    {
        private readonly IDatabase _redisDb;
        private readonly GlobalCounter gCounter;
        private readonly IConfiguration _configuration;
        private readonly IUserService _userService;
        private readonly string globalCounterKey = "next.user.id"; // Globalni ključ

        private static readonly List<string> administratori = ["anastasija.simic@gmail.com", "darija.denic@gmail.com", "sanja.simic@gmail.com"];
        public KorisnikController(IConnectionMultiplexer mux, IConfiguration configuration, IUserService userService)
        {
            _redisDb = mux.GetDatabase();
            gCounter = new GlobalCounter(mux);
            this._configuration = configuration;
            this._userService = userService;
            if (!gCounter.CheckNextGlobalCounterExists(globalCounterKey))
            {
                _redisDb.StringSet(globalCounterKey, "0");
            }
        }

        [HttpPost("dodajKorisnika")]
        public async Task<IActionResult> DodajKorisnika([FromBody] Korisnik korisnik) 
        {
            if (korisnik == null)
            {
                return BadRequest("Korisnik nije validan.");
            }

            try
            {
                string generatedId = gCounter.GetNextId(globalCounterKey);
                // Kreiranje Redis hash zapisa
                await _redisDb.HashSetAsync($"korisnik:{generatedId}:id", new HashEntry[]
                {
                    new HashEntry("Id", $"korisnik:{generatedId}:id"),
                    new HashEntry("Ime", korisnik.Ime ?? string.Empty),
                    new HashEntry("Email", korisnik.Email ?? string.Empty),
                    new HashEntry("Sifra", korisnik.Sifra ?? string.Empty),
                    new HashEntry("Telefon", korisnik.Telefon ?? string.Empty),
                    new HashEntry("Adresa", korisnik.Adresa ?? string.Empty),

                });

                return Ok("Korisnik uspešno dodat.");
            }
            catch (Exception ex)
            {
              
                return StatusCode(500, $"Došlo je do greške: {ex.Message}");
            }
        }
       
        [HttpPut("azurirajKorisnika"), Authorize(Roles = "user")]
        public async Task<IActionResult> AzurirajKorisnika( [FromBody] KorisnikDTO korisnikDto)
        {
            
            
            if (korisnikDto == null)
            {
                return BadRequest("Podaci za ažuriranje nisu validni.");
            }

            try
            {
                var emailKorisnika = _userService.GetUser(); 
                if(emailKorisnika == null)
                {
                    return StatusCode(401, $"Došlo je do greške prilikom preuzimanja informacija iz tokena");
                }
                
                string? idKorisnik = await _redisDb.HashGetAsync($"users.email.addresses", emailKorisnika);


                string korisnikKey = $"korisnik:{idKorisnik}:id";
                bool postoji = await _redisDb.KeyExistsAsync(korisnikKey);
                if (!postoji)
                {
                    return NotFound("Korisnik nije pronađen.");
                }

                var hashEntries = await _redisDb.HashGetAllAsync(korisnikKey);
                if (hashEntries.Length == 0)
                {
                    return NotFound("Korisnik nije pronađen.");
                }


                var hashUpdates = new List<HashEntry>();
                if (!string.IsNullOrEmpty(korisnikDto.Ime))
                {
                    hashUpdates.Add(new HashEntry("Ime", korisnikDto.Ime));
                }
                if (!string.IsNullOrEmpty(korisnikDto.Email))
                {
                    hashUpdates.Add(new HashEntry("Email", korisnikDto.Email));
                }
                if (!string.IsNullOrEmpty(korisnikDto.Sifra))
                {
                    hashUpdates.Add(new HashEntry("Sifra", korisnikDto.Sifra));
                }
                if (!string.IsNullOrEmpty(korisnikDto.Telefon))
                {
                    hashUpdates.Add(new HashEntry("Telefon", korisnikDto.Telefon));
                }
                if (!string.IsNullOrEmpty(korisnikDto.Adresa))
                {
                    hashUpdates.Add(new HashEntry("Adresa", korisnikDto.Adresa));
                }

                if (hashUpdates.Count > 0)
                {
                    await _redisDb.HashSetAsync(korisnikKey, hashUpdates.ToArray());
                }

                return Ok("Korisnik uspešno ažuriran.");
            }
            catch (Exception ex)
            {

                return StatusCode(500, $"Došlo je do greške: {ex.Message}");
            }
        }
       
        [HttpDelete("obrisiKorisnika/{idKorisnik}"), Authorize(Roles = "admin" )]
        public async Task<IActionResult> ObrisiKorisnika(string idKorisnik)
        {
            
            string? email = await _redisDb.HashGetAsync($"korisnik:{idKorisnik}:id", "Email");
        
            
            var deleted = await _redisDb.KeyDeleteAsync($"korisnik:{idKorisnik}:id");
            if (!deleted)
            {
                return NotFound("Korisnik nije pronađen za brisanje.");
            }

            await _redisDb.HashDeleteAsync("users.email.addresses", email);

            return Ok("Korisnik uspešno obrisan.");
        }

        [HttpPost("registrujKorisnika")]
        public async Task<IActionResult> RegistrujKorisnika([FromBody] Korisnik korisnik)
        {
            if (korisnik == null)
            {
                return BadRequest("Podaci korisnika nisu validni.");
            }

            try
            {
                
                string? existingUserId = await _redisDb.HashGetAsync("users.email.addresses", korisnik.Email);
                if (!string.IsNullOrEmpty(existingUserId))
                {
                    return Conflict("Korisnik sa datim email-om već postoji.");
                }

                string generatedId = gCounter.GetNextId(globalCounterKey);

                string hashedPassword = BCrypt.Net.BCrypt.HashPassword(korisnik.Sifra);

                await _redisDb.HashSetAsync($"korisnik:{generatedId}:id",
                [
                    new HashEntry("Id", $"user:{generatedId}:id"),
                    new HashEntry("Ime", korisnik.Ime ?? string.Empty), 
                    new HashEntry("Email", korisnik.Email),
                    new HashEntry("Sifra", hashedPassword),
                    new HashEntry("Telefon", korisnik.Telefon ?? string.Empty),
                    new HashEntry("Adresa", korisnik.Adresa ?? string.Empty),
                ]);

               
                await _redisDb.HashSetAsync("users.email.addresses",
                [
                    new HashEntry(korisnik.Email, generatedId)
                ]);              

                return Ok("Korisnik uspešno registrovan.");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Došlo je do greške: {ex.Message}");
            }
        }


        [HttpPost("logujKorisnika/{email}/{sifra}")] 
        public async Task<IActionResult> LogujKorisnika(string email, string sifra)
        {
            if (string.IsNullOrEmpty(email) || string.IsNullOrEmpty(sifra))
            {
                return BadRequest("Email ili lozinka nisu uneti.");
            }

            try
            {

                string? existingUserId = await _redisDb.HashGetAsync("users.email.addresses", email);
                if (string.IsNullOrEmpty(existingUserId))
                {
                    return Unauthorized("Korisnik sa datim email-om ne postoji.");
                }

                var userHash = await _redisDb.HashGetAllAsync($"korisnik:{existingUserId}:id");
                if (userHash.Length == 0)
                {
                    return Unauthorized("Greška u učitavanju podataka korisnika.");
                }

                
                string? storedHashedPassword = userHash.FirstOrDefault(x => x.Name == "Sifra").Value;

                if (string.IsNullOrEmpty(storedHashedPassword))
                {
                    return Unauthorized("Greška u pristupu šifri korisnika.");
                }

         
                bool isPasswordValid = BCrypt.Net.BCrypt.Verify(sifra, storedHashedPassword);
                if (!isPasswordValid)
                {
                    return Unauthorized("Pogrešna šifra.");
                }
                

                string jwt = CreateToken(email, sifra);
                Response.ContentType = "text/plain";

                Response.Cookies.Append("jwt", jwt, new CookieOptions
                {
                    HttpOnly = true,
                    Expires = DateTime.UtcNow.AddHours(1) 
                });
                return Ok(jwt);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Došlo je do greške: {ex.Message}");
            }
        }
        private string CreateToken(string email, string sifra)
        {
        
            List<Claim> claims = new List<Claim> {
                    new Claim(ClaimTypes.Name, email),
                    new Claim(ClaimTypes.Role, "user"),
                };

            if(administratori.Contains(email))
            {
                claims.Add(new Claim(ClaimTypes.Role, "admin"));
                Console.WriteLine("admin");
            }

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(
                _configuration.GetSection("AppSettings:Token").Value!));

            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256Signature);

            var token = new JwtSecurityToken(
                    claims: claims,
                    expires: DateTime.Now.AddDays(1),
                    signingCredentials: creds
                );

            var jwt = new JwtSecurityTokenHandler().WriteToken(token);

            return jwt;
        }

        [HttpPost("izlogujKorisnika"), Authorize(Roles = "user")]
        public IActionResult IzlogujKorisnika()
        {
            Response.Cookies.Delete("jwt"); 

            return Ok(new
            {
                message = "success"
            });
        }

       

        [HttpGet("PreuzmiKorisnika"), Authorize(Roles = "user")] 
        public async Task<IActionResult> PreuzmiKorisnika() 
        {
            var emailKorisnika = _userService.GetUser(); 
            if(emailKorisnika == null)
            {
                return StatusCode(401, $"Došlo je do greške prilikom preuzimanja informacija iz tokena");
            }
                
            string? IdKorisnika = await _redisDb.HashGetAsync($"users.email.addresses", emailKorisnika);

            var hashEntries = await _redisDb.HashGetAllAsync($"korisnik:{IdKorisnika}:id");  
            if (hashEntries == null || hashEntries.Length == 0)
            {
                return NotFound("Korisnik nije pronađena.");
            }
            var korisnik = new 
            {
                IdKorisnika = hashEntries.FirstOrDefault(e => e.Name == "Id").Value.ToString(), 
                Ime = hashEntries.FirstOrDefault(e => e.Name == "Ime").Value.ToString(),
                Email = hashEntries.FirstOrDefault(e => e.Name == "Email").Value.ToString(),
                Sifra = hashEntries.FirstOrDefault(e => e.Name == "Sifra").Value.ToString(),
                Telefon = hashEntries.FirstOrDefault(e => e.Name == "Telefon").Value.ToString(),
                Adresa = hashEntries.FirstOrDefault(e => e.Name == "Adresa").Value.ToString(),
                JeAdmin = administratori.Contains(emailKorisnika),
            };

            return Ok(korisnik);
        }

          [HttpDelete("obrisiProfil"), Authorize(Roles = "user" )]
        public async Task<IActionResult> ObrisiProfil()
        {
            try
            {
                var emailKorisnika = _userService.GetUser(); 
                if(emailKorisnika == null)
                {
                    return StatusCode(401, $"Došlo je do greške prilikom preuzimanja informacija iz tokena");
                }
                
                string? IdKorisnika = await _redisDb.HashGetAsync($"users.email.addresses", emailKorisnika);
                
                var deleted = await _redisDb.KeyDeleteAsync($"korisnik:{IdKorisnika}:id");
                if (!deleted)
                {
                    return NotFound("Korisnik nije pronađen za brisanje.");
                }

                await _redisDb.HashDeleteAsync("users.email.addresses", emailKorisnika);

                return Ok("Korisnik uspešno obrisan.");
            }
            catch(Exception ex)
            {
                return StatusCode(500, $"Došlo je do greške: {ex.Message}");
            }
        }   
    }
}