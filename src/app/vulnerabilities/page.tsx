import VulnerabilitiesList from "./VulnerabilitiesList";
// import { cookies } from "next/headers";
import React from "react";

export default async function VulnerabilitiesPage() {
  // Get selected namespace/cluster from cookies or default to 'all/all'
  // const cookieStore = await cookies();
  // const nsValue = cookieStore.get("namespace")?.value ?? "all/all";
  // const [cluster, namespace] = nsValue.split("/");

  return (
    <div className="p-10">
      <VulnerabilitiesList
        // cluster={cluster || "all"}
        // namespace={namespace || "all"}
      />
    </div>
  );
}
