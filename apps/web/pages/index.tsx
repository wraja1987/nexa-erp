import type { GetServerSideProps } from "next";
export default function Root(){ return null; }
export const getServerSideProps: GetServerSideProps = async () => ({ redirect: { destination: "/login", permanent: false } });
