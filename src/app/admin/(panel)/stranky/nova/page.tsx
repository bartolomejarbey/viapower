import { redirect } from "next/navigation";
import { createPage } from "../actions";

export const dynamic = "force-dynamic";

export default async function NewPageRoute() {
  const id = await createPage();
  redirect(`/admin/editor/${id}/`);
}
