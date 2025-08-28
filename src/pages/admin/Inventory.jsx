import React, { useState } from "react";
import FormInventory from "../../components/admin/Inventory/FormInventory";
import ListInventory from "../../components/admin/Inventory/ListInventory";

const InventoryPage = () => {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefresh = () => setRefreshKey(prev => prev + 1);

  return (
    <div className="p-6">
      <FormInventory onAddSuccess={handleRefresh} />
      <ListInventory refreshTrigger={refreshKey} />
    </div>
  );
};

export default InventoryPage;
