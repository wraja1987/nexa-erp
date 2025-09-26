import AdminPage from "../_AdminPage";
export const dynamic = "force-dynamic";
export default function Page(){ return <AdminPage jsonPath={"/modules-admin/admin.rbac.json"} /> }


