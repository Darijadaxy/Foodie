using Entiteti;
using Microsoft.AspNetCore.Mvc;
using StackExchange.Redis;
using System.Text.Json;

namespace KeyHelper
{
    public class GlobalCounter
    {
        private readonly IDatabase _redisDb;

        public GlobalCounter(IConnectionMultiplexer mux)
        {
             _redisDb = mux.GetDatabase();
        }

        public bool CheckNextGlobalCounterExists(string globalCounterKey)
        {
            var test = _redisDb.StringGet(globalCounterKey);
            return test.HasValue;
        }

        public string GetNextId(string globalCounterKey)
        {
            long nextCounterKey = _redisDb.StringIncrement(globalCounterKey);
            return nextCounterKey.ToString("x"); // Vraća ID kao heksadecimalnu vrednost

        }




    }

}