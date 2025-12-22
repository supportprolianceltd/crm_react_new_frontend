// Shared access helper for app permission checks
export const appAccessMapping = {
  Recruitment: "system_access_recruitment",
  HR: "system_access_hr",
  "Audit & Compliance": "system_access_compliance",
  Rostering: "system_access_rostering",
  Training: "system_access_training",
  "Assets management": "system_access_asset_management",
  Finance: "system_access_finance",
  Admin: "system_access_co_superadmin",
};

export function hasAppAccess(user, appName) {
  if (!user) return false;

  // Workspace is always accessible in the UI
  if (appName === "My Workspace") return true;

  // Root admin and explicit superuser flag have full access
  if (user.role === "root-admin" || user.is_superuser) return true;

  // Admin/co-admin/co-superadmin can access the Admin app
  if (
    user.role === "co-admin" ||
    user.role === "admin" ||
    user.profile?.system_access_co_superadmin
  ) {
    if (appName === "Admin") return true;
  }

  // Check specific app permission fields on the profile
  const accessField = appAccessMapping[appName];
  return accessField ? Boolean(user.profile?.[accessField] === true) : false;
}
