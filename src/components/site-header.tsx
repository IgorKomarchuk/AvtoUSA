import { getSiteContacts } from "@/lib/site-contacts";
import { SiteHeaderClient } from "./site-header-client";

export async function SiteHeader() {
  return <SiteHeaderClient contacts={await getSiteContacts()}/>;
}
