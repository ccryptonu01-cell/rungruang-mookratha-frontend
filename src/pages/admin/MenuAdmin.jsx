import React, { useState } from "react";
import FormMenu from "../../components/admin/Menu/FormMenu";
import ListMenu from "../../components/admin/Menu/ListMenu";

const MenuAdmin = () => {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefresh = () => setRefreshKey((prev) => prev + 1);

  return (
    <div className="p-6">
      <FormMenu onAddSuccess={handleRefresh} />
      <ListMenu refreshTrigger={refreshKey} onEditSuccess={handleRefresh} />
    </div>
  );
};

export default MenuAdmin;
