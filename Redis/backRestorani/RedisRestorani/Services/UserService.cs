using System.Security.Claims;

public class UserService : IUserService
    {
        private readonly IHttpContextAccessor _httpContextAccessor;

        public UserService(IHttpContextAccessor httpContextAccessor)
        {
            _httpContextAccessor = httpContextAccessor;
        }

        public string GetUser()
        {
            var result = string.Empty;
            if(_httpContextAccessor.HttpContext is not null)
            {
                result = _httpContextAccessor.HttpContext.User.FindFirstValue(ClaimTypes.Name);
            }
            Console.WriteLine(result);
            return result!;
        }
        public string GetRole()
        {
            var role = string.Empty;
            if(_httpContextAccessor.HttpContext is not null)
            {
                role = _httpContextAccessor.HttpContext.User.FindFirstValue(ClaimTypes.Role);
            }
            return role!;
        }
}