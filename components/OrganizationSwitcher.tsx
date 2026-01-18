"use client";

import { useOrganization } from "./OrganizationProvider";

export function OrganizationSwitcher() {
    const { currentOrg, userOrgs, setCurrentOrg, isLoading } = useOrganization();

    if (isLoading) {
        return (
            <div className="animate-pulse h-9 w-40 bg-slate-100 dark:bg-slate-800 rounded-md"></div>
        );
    }

    if (!userOrgs || userOrgs.length === 0) {
        return (
            <div className="text-sm text-slate-500 italic">No organizations</div>
        );
    }

    return (
        <div className="relative group">
            <button className="flex items-center gap-2 px-3 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors text-sm font-medium text-slate-700 dark:text-slate-200">
                <span>{currentOrg?.name ?? "Select Organization"}</span>
                <span className="text-xs text-slate-400">▼</span>
            </button>

            <div className="absolute right-0 top-full mt-1 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-lg rounded-lg overflow-hidden hidden group-hover:block z-50">
                <div className="max-h-64 overflow-y-auto">
                    {userOrgs.map((org) => (
                        <button
                            key={org._id}
                            onClick={() => setCurrentOrg(org)}
                            className={`w-full text-left px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center justify-between group/item ${currentOrg?._id === org._id ? "bg-slate-50 dark:bg-slate-800" : ""
                                }`}
                        >
                            <div className="flex flex-col">
                                <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                                    {org.name}
                                </span>
                                <span className="text-xs text-slate-500">{org.slug}</span>
                            </div>
                            <span
                                className={`text-[10px] px-1.5 py-0.5 rounded font-mono uppercase tracking-wider ${org.role === "admin"
                                        ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
                                        : org.role === "manager"
                                            ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                                            : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400"
                                    }`}
                            >
                                {org.role}
                            </span>
                        </button>
                    ))}
                </div>
                <div className="p-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                    <button className="w-full text-center text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 py-1 transition-colors">
                        + Create Organization
                    </button>
                </div>
            </div>
        </div>
    );
}
