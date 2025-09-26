// Redirect the home page to /properties
import { redirect } from "next/navigation";

export default function Home() {
  redirect("/properties");
}
