/* eslint-disable */
"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { useOrganization } from "@/components/OrganizationProvider";
import {
    Users,
    Shield,
    Crown,
    UserCog,
    User,
    ChevronRight,
    Check,
    X,
    Settings2,
    Trash2,
    AlertTriangle,
} from "lucide-react";

export default function TeamPage() {
    const { currentOrg } = useOrganization();
    const [selectedMember, setSelectedMember] = useState<string | null>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

    const members = useQuery(
        api.permissions.listMembers,
        currentOrg ? { orgId: currentOrg._id } : "skip"
    );

    const availableData = useQuery(api.permissions.getAvailablePermissions, {});

    if (!currentOrg) {
        return (
            <div className="p-12 text-center text-slate-500">
                Select an organization to manage team.
            </div>
        );
    }

    const currentUserIsAdmin = members?.find(
        (m) => m.isAdmin
    );

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                    <Users className="text-indigo-600" size={32} />
                    Team Management
                </h1>
                <p className="text-slate-500 mt-1">
                    Manage team members and their permissions
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Members List */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="p-4 border-b border-slate-200 bg-slate-50">
                            <h2 className="font-semibold text-slate-900">Team Members</h2>
                            <p className="text-sm text-slate-500">{members?.length || 0} members</p>
                        </div>

                        <div className="divide-y divide-slate-100">
                            {!members ? (
                                <div className="p-8 text-center text-slate-400 animate-pulse">
                                    Loading members...
                                </div>
                            ) : members.length === 0 ? (
                                <div className="p-8 text-center text-slate-500">
                                    No team members
                                </div>
                            ) : (
                                members.map((member) => (
                                    <button
                                        key={member._id}
                                        onClick={() => setSelectedMember(member.userId)}
                                        className={`w-full p-4 text-left hover:bg-slate-50 transition-colors flex items-center justify-between ${selectedMember === member.userId
                                                ? "bg-indigo-50 border-l-4 border-indigo-600"
                                                : ""
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div
                                                className={`w-10 h-10 rounded-full flex items-center justify-center ${member.role === "admin"
                                                        ? "bg-amber-100 text-amber-600"
                                                        : member.role === "manager"
                                                            ? "bg-indigo-100 text-indigo-600"
                                                            : "bg-slate-100 text-slate-600"
                                                    }`}
                                            >
                                                {member.role === "admin" ? (
                                                    <Crown size={18} />
                                                ) : member.role === "manager" ? (
                                                    <UserCog size={18} />
                                                ) : (
                                                    <User size={18} />
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-medium text-slate-900">
                                                    {member.name}
                                                </p>
                                                <p className="text-xs text-slate-500 capitalize">
                                                    {member.role}
                                                </p>
                                            </div>
                                        </div>
                                        <ChevronRight
                                            size={18}
                                            className="text-slate-400"
                                        />
                                    </button>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Permission Editor */}
                <div className="lg:col-span-2">
                    {selectedMember && members && availableData ? (
                        <PermissionEditor
                            orgId={currentOrg._id}
                            member={members.find((m) => m.userId === selectedMember)!}
                            availablePermissions={availableData.permissions}
                            roleTemplates={availableData.roleTemplates}
                            onClose={() => setSelectedMember(null)}
                            onDelete={() => setShowDeleteConfirm(selectedMember)}
                        />
                    ) : (
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
                            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Shield className="text-indigo-600" size={32} />
                            </div>
                            <h2 className="text-xl font-semibold text-slate-700 mb-2">
                                Select a Team Member
                            </h2>
                            <p className="text-slate-500 max-w-md mx-auto">
                                Choose a team member from the list to view and manage their
                                permissions and access levels.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && members && (
                <DeleteMemberModal
                    orgId={currentOrg._id}
                    member={members.find((m) => m.userId === showDeleteConfirm)!}
                    onClose={() => setShowDeleteConfirm(null)}
                    onDeleted={() => {
                        setShowDeleteConfirm(null);
                        setSelectedMember(null);
                    }}
                />
            )}
        </div>
    );
}

function PermissionEditor({
    orgId,
    member,
    availablePermissions,
    roleTemplates,
    onClose,
    onDelete,
}: {
    orgId: Id<"organizations">;
    member: {
        _id: string;
        userId: string;
        name: string;
        email: string;
        role: string;
        permissions: string[];
        isAdmin: boolean;
    };
    availablePermissions: Record<string, string>;
    roleTemplates: Record<string, { name: string; description: string; permissions: string[] }>;
    onClose: () => void;
    onDelete: () => void;
}) {
    const [selectedPermissions, setSelectedPermissions] = useState<Set<string>>(
        new Set(member.permissions)
    );
    const [isSaving, setIsSaving] = useState(false);
    const [selectedRole, setSelectedRole] = useState(member.role);

    const updatePermissions = useMutation(api.permissions.updatePermissions);
    const updateRole = useMutation(api.permissions.updateMemberRole);
    const applyTemplate = useMutation(api.permissions.applyRoleTemplate);

    // Group permissions by module
    const permissionGroups: Record<string, { key: string; label: string }[]> = {};
    Object.entries(availablePermissions).forEach(([key, label]) => {
        const [module] = key.split(":");
        if (!permissionGroups[module]) {
            permissionGroups[module] = [];
        }
        permissionGroups[module].push({ key, label });
    });

    const togglePermission = (permission: string) => {
        const newPermissions = new Set(selectedPermissions);
        if (newPermissions.has(permission)) {
            newPermissions.delete(permission);
        } else {
            newPermissions.add(permission);
        }
        setSelectedPermissions(newPermissions);
    };

    const handleSavePermissions = async () => {
        setIsSaving(true);
        try {
            await updatePermissions({
                orgId,
                targetUserId: member.userId as Id<"users">,
                permissions: Array.from(selectedPermissions),
            });
        } catch (error) {
            console.error("Failed to save permissions:", error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleRoleChange = async (newRole: "admin" | "manager" | "staff") => {
        try {
            await updateRole({
                orgId,
                targetUserId: member.userId as Id<"users">,
                role: newRole,
            });
            setSelectedRole(newRole);
        } catch (error) {
            console.error("Failed to update role:", error);
        }
    };

    const handleApplyTemplate = async (templateKey: string) => {
        try {
            await applyTemplate({
                orgId,
                targetUserId: member.userId as Id<"users">,
                templateKey,
            });
            // Update local state
            const template = roleTemplates[templateKey];
            setSelectedPermissions(new Set(template.permissions));
        } catch (error) {
            console.error("Failed to apply template:", error);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-indigo-50 to-purple-50">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div
                            className={`w-14 h-14 rounded-full flex items-center justify-center ${member.role === "admin"
                                    ? "bg-amber-100 text-amber-600"
                                    : member.role === "manager"
                                        ? "bg-indigo-100 text-indigo-600"
                                        : "bg-slate-100 text-slate-600"
                                }`}
                        >
                            {member.role === "admin" ? (
                                <Crown size={24} />
                            ) : member.role === "manager" ? (
                                <UserCog size={24} />
                            ) : (
                                <User size={24} />
                            )}
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-slate-900">
                                {member.name}
                            </h2>
                            <p className="text-slate-500">{member.email}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {!member.isAdmin && (
                            <button
                                onClick={onDelete}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Remove member"
                            >
                                <Trash2 size={18} />
                            </button>
                        )}
                        <button
                            onClick={onClose}
                            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>
            </div>

            {member.isAdmin ? (
                <div className="p-8 text-center">
                    <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Crown className="text-amber-600" size={32} />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">
                        Organization Admin
                    </h3>
                    <p className="text-slate-500 max-w-sm mx-auto">
                        This user is an admin and has full access to all features.
                        Admin permissions cannot be modified.
                    </p>
                </div>
            ) : (
                <div className="p-6 space-y-6">
                    {/* Role Selection */}
                    <div>
                        <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                            <Settings2 size={16} />
                            Role
                        </h3>
                        <div className="flex gap-2">
                            {["staff", "manager", "admin"].map((role) => (
                                <button
                                    key={role}
                                    onClick={() =>
                                        handleRoleChange(role as "admin" | "manager" | "staff")
                                    }
                                    className={`flex-1 py-2 px-4 rounded-lg border-2 capitalize font-medium transition-colors ${selectedRole === role
                                            ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                                            : "border-slate-200 text-slate-600 hover:border-slate-300"
                                        }`}
                                >
                                    {role}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Quick Templates */}
                    <div>
                        <h3 className="text-sm font-semibold text-slate-700 mb-3">
                            Quick Templates
                        </h3>
                        <div className="grid grid-cols-2 gap-2">
                            {Object.entries(roleTemplates).map(([key, template]) => (
                                <button
                                    key={key}
                                    onClick={() => handleApplyTemplate(key)}
                                    className="p-3 text-left border border-slate-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
                                >
                                    <p className="font-medium text-slate-900 text-sm">
                                        {template.name}
                                    </p>
                                    <p className="text-xs text-slate-500 mt-0.5">
                                        {template.description}
                                    </p>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Granular Permissions */}
                    <div>
                        <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                            <Shield size={16} />
                            Granular Permissions
                        </h3>
                        <div className="space-y-4">
                            {Object.entries(permissionGroups).map(([module, permissions]) => (
                                <div
                                    key={module}
                                    className="border border-slate-200 rounded-lg overflow-hidden"
                                >
                                    <div className="px-4 py-2 bg-slate-50 border-b border-slate-200">
                                        <h4 className="font-medium text-slate-700 capitalize">
                                            {module}
                                        </h4>
                                    </div>
                                    <div className="divide-y divide-slate-100">
                                        {permissions.map(({ key, label }) => (
                                            <label
                                                key={key}
                                                className="flex items-center justify-between p-3 hover:bg-slate-50 cursor-pointer"
                                            >
                                                <span className="text-sm text-slate-700">
                                                    {label}
                                                </span>
                                                <button
                                                    onClick={() => togglePermission(key)}
                                                    className={`w-5 h-5 rounded flex items-center justify-center transition-colors ${selectedPermissions.has(key)
                                                            ? "bg-indigo-600 text-white"
                                                            : "border-2 border-slate-300"
                                                        }`}
                                                >
                                                    {selectedPermissions.has(key) && (
                                                        <Check size={14} />
                                                    )}
                                                </button>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Save Button */}
                    <div className="flex justify-end pt-4 border-t border-slate-200">
                        <button
                            onClick={handleSavePermissions}
                            disabled={isSaving}
                            className="px-6 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                        >
                            {isSaving ? "Saving..." : "Save Permissions"}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

function DeleteMemberModal({
    orgId,
    member,
    onClose,
    onDeleted,
}: {
    orgId: Id<"organizations">;
    member: { userId: string; name: string };
    onClose: () => void;
    onDeleted: () => void;
}) {
    const [isDeleting, setIsDeleting] = useState(false);
    const removeMember = useMutation(api.permissions.removeMember);

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            await removeMember({
                orgId,
                targetUserId: member.userId as Id<"users">,
            });
            onDeleted();
        } catch (error) {
            console.error("Failed to remove member:", error);
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                        <AlertTriangle className="text-red-600" size={24} />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-slate-900">
                            Remove Team Member
                        </h3>
                        <p className="text-slate-500">This action cannot be undone</p>
                    </div>
                </div>

                <p className="text-slate-700 mb-6">
                    Are you sure you want to remove <strong>{member.name}</strong> from
                    this organization? They will lose access to all resources.
                </p>

                <div className="flex gap-3 justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                    >
                        {isDeleting ? "Removing..." : "Remove Member"}
                    </button>
                </div>
            </div>
        </div>
    );
}
