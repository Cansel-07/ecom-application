import { redirect } from "next/navigation";

// /admin currently has a single screen; send visitors straight to it.
export default function AdminIndex() {
  redirect("/admin/products/new");
}
