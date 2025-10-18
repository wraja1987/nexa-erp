import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
const prisma=new PrismaClient();
async function ensureCols(){
  try{await prisma.$executeRawUnsafe(`
    DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='User' AND column_name='password_hash') THEN
        ALTER TABLE "User" ADD COLUMN password_hash TEXT;
      END IF;
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='User' AND column_name='role') THEN
        ALTER TABLE "User" ADD COLUMN role TEXT DEFAULT 'admin';
      END IF;
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='User' AND column_name='is_active') THEN
        ALTER TABLE "User" ADD COLUMN is_active BOOLEAN DEFAULT TRUE;
      END IF;
    END $$;`);}catch{}
}
async function setPwd(email:string,pwd:string,role='admin'){
  const hash=await bcrypt.hash(pwd,12);
  const u=await prisma.user.findUnique({where:{email}});
  if(u) await prisma.user.update({where:{email},data:{password_hash:hash,role,is_active:true}});
  else await prisma.user.create({data:{email,password_hash:hash,role,is_active:true}});
  console.log('✓ password set for',email);
}
(async()=>{
  await ensureCols();
  await setPwd('info@nexaai.co.uk','Wolfish123','super_admin');
  await setPwd('wraja1987@gmail.com','Wolfish123','admin');
  await prisma.$disconnect();
})();
