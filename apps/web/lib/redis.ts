import { createClient } from "redis";
const url = process.env.REDIS_URL || "";
let client: ReturnType<typeof createClient> | null = null;
export async function getRedis(){
  if(!url) throw new Error("REDIS_URL missing");
  if(!client){
    client = createClient({ url });
    client.on("error",(e)=>console.error("Redis error",e));
    await client.connect();
  }
  return client;
}
