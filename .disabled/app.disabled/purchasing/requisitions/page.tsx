"use client";
import { useEffect, useState } from "react";
import NexaLayout from "components/NexaLayout";
export const dynamic = "force-dynamic";

export default function Page(){
  const [data,setData]=useState<any>(null);
  useEffect(()=>{fetch("/modules/purchasing.requisitions.json").then(r=>r.json()).then(setData)},[]);
  if(!data) return <div>Loading...</div>;
  return <NexaLayout data={data}/>;
}
