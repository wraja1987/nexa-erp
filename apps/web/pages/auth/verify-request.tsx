import type { NextPage } from "next";
import Head from "next/head";
import ForgotSuccessApproved from "@/components/auth/ForgotSuccessApproved";

export const config = { runtime: "nodejs" };
export const revalidate = 0;

const Page: NextPage = () => (
  <>
    <Head>
      <title>Check your email • Nexa ERP</title>
      <meta name="robots" content="noindex" />
    </Head>
    <ForgotSuccessApproved />
  </>
);
export default Page;


