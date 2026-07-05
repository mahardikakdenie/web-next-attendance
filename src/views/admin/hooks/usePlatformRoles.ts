import { useState, useCallback, useMemo, useEffect } from "react";
import { Role } from "@/types/api";
import { 
  getSystemRoles, 
  updateSystemRole, 
  deleteSystemRole, 
  saveSystemRoleHierarchy,
  syncPermissionsCache
} from "@/service/roles";
import { toast } from "sonner";

interface UsePlatformRolesProps {
  fetchPermissions: () => Promise<void>;
}

export function usePlatformRoles({ fetchPermissions }: UsePlatformRolesProps) {
  const [roles, setRoles] = useState<Role[]>([]);
  const [originalRoles, setOriginalRoles] = useState<Role[]>([]); 
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"permissions" | "hierarchy">("permissions");
  const [isCreating, setIsCreating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [roleSearch, setRoleSearch] = useState("");

  // Hierarchy State
  const [childRoleIds, setChildRoleIds] = useState<number[]>([]);
  const [originalChildRoleIds, setOriginalChildRoleIds] = useState<number[]>([]);

  const fetchRoles = useCallback(async () => {
    try {
      setIsLoading(true);
      const resp = await getSystemRoles();
      if (resp.data) {
        setRoles(resp.data);
        setOriginalRoles(JSON.parse(JSON.stringify(resp.data)));
        
        if (resp.data.length > 0 && (selectedRoleId === null || !resp.data.some(r => r.id === selectedRoleId))) {
          setSelectedRoleId(resp.data[0].id);
        }
      }
    } catch {
      toast.error("Failed to load platform system roles");
    } finally {
      setIsLoading(false);
    }
  }, [selectedRoleId]);

  const selectedRole = useMemo(() => 
    roles.find(r => r.id === selectedRoleId) || null
  , [roles, selectedRoleId]);

  const originalSelectedRole = useMemo(() => 
    originalRoles.find(r => r.id === selectedRoleId) || null
  , [originalRoles, selectedRoleId]);

  const filteredRoles = useMemo(() => {
    return roles.filter(r => r.name.toLowerCase().includes(roleSearch.toLowerCase()));
  }, [roles, roleSearch]);

  const isPermissionsDirty = useMemo(() => {
    if (!selectedRole || !originalSelectedRole) return false;
    const currentPerms = selectedRole.permissions?.map(p => p.id).sort() || [];
    const originalPerms = originalSelectedRole.permissions?.map(p => p.id).sort() || [];
    return JSON.stringify(currentPerms) !== JSON.stringify(originalPerms);
  }, [selectedRole, originalSelectedRole]);

  const isHierarchyDirty = useMemo(() => {
    return JSON.stringify([...childRoleIds].sort()) !== JSON.stringify([...originalChildRoleIds].sort());
  }, [childRoleIds, originalChildRoleIds]);

  const isCurrentTabDirty = 
    activeTab === "permissions" ? isPermissionsDirty : isHierarchyDirty;

  const handleTabChange = (tab: "permissions" | "hierarchy") => {
    setActiveTab(tab);
    if (tab === "hierarchy") {
      setChildRoleIds([]);
      setOriginalChildRoleIds([]);
    }
  };

  const handleUpdateRole = useCallback(async () => {
    if (!selectedRole) return;
    try {
      setIsSaving(true);
      const payload = {
        name: selectedRole.name,
        description: selectedRole.description,
        base_role: selectedRole.base_role,
        permissions: selectedRole.permissions?.map(p => p.id) || []
      };
      const resp = await updateSystemRole(selectedRole.id, payload);
      if (resp.success) {
        toast.success("System role updated successfully");
        await fetchRoles();
      }
    } catch {
      toast.error("Failed to update system role");
    } finally {
      setIsSaving(false);
    }
  }, [selectedRole, fetchRoles]);

  const handleDiscardChanges = () => {
    if (activeTab === "permissions") {
      setRoles(JSON.parse(JSON.stringify(originalRoles)));
    } else {
      setChildRoleIds([...originalChildRoleIds]);
    }
    toast.info("Changes discarded");
  };

  const handleDeleteRole = async (id: number) => {
    if (!confirm("Are you sure? This will affect ALL tenants using this role.")) return;
    try {
      setIsSaving(true);
      const resp = await deleteSystemRole(id);
      if (resp.success) {
        toast.success("System role deleted");
        setSelectedRoleId(null);
        await fetchRoles();
      }
    } catch {
      toast.error("Failed to delete role");
    } finally {
      setIsSaving(false);
    }
  };

  const togglePermission = (permissionId: string) => {
    if (!selectedRole) return;
    setRoles(prev => prev.map(role => {
      if (role.id === selectedRoleId) {
        const currentPerms = role.permissions?.map(p => p.id) || [];
        const isAssigned = currentPerms.includes(permissionId);
        return {
          ...role,
          permissions: isAssigned 
            ? role.permissions?.filter(p => p.id !== permissionId)
            : [...(role.permissions || []), { id: permissionId, module: "", action: "" }]
        } as Role;
      }
      return role;
    }));
  };

  const handleSaveHierarchy = useCallback(async () => {
    if (!selectedRoleId) return;
    try {
      setIsSaving(true);
      const resp = await saveSystemRoleHierarchy(selectedRoleId, childRoleIds);
      if (resp.success) {
        toast.success("Global hierarchy updated");
        setOriginalChildRoleIds([...childRoleIds]);
        await fetchRoles();
      }
    } catch {
      toast.error("Failed to save hierarchy");
    } finally {
      setIsSaving(false);
    }
  }, [selectedRoleId, childRoleIds, fetchRoles]);

  const toggleChildRole = (id: number) => {
    setChildRoleIds(prev => prev.includes(id) ? prev.filter(cid => cid !== id) : [...prev, id]);
  };

  const handleSyncCache = async () => {
    try {
      setIsSyncing(true);
      const resp = await syncPermissionsCache();
      if (resp.success) {
        toast.success("Permissions cache synced successfully");
        await fetchPermissions();
      }
    } catch {
      toast.error("Failed to sync permissions cache");
    } finally {
      setIsSyncing(false);
    }
  };

  const onHandleChange = useCallback(() => {
    if (activeTab === "permissions") {
      handleUpdateRole();
    } else {
      handleSaveHierarchy();
    }
  }, [activeTab, handleUpdateRole, handleSaveHierarchy]);

  // Keyboard shortcut Ctrl+S
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        onHandleChange();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onHandleChange]);

  return {
    roles,
    isLoading,
    selectedRoleId,
    setSelectedRoleId,
    activeTab,
    isCreating,
    setIsCreating,
    isSaving,
    isSyncing,
    roleSearch,
    setRoleSearch,
    childRoleIds,
    setChildRoleIds,
    setOriginalChildRoleIds,
    fetchRoles,
    selectedRole,
    filteredRoles,
    isPermissionsDirty,
    isHierarchyDirty,
    isCurrentTabDirty,
    handleTabChange,
    handleDiscardChanges,
    handleDeleteRole,
    togglePermission,
    toggleChildRole,
    handleSyncCache,
    onHandleChange
  };
}
