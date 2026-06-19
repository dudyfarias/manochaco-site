import { redirect } from "next/navigation";

export default function AdminLoginCompatibilityPage() {
  redirect("/entrar?next=/admin");
}
