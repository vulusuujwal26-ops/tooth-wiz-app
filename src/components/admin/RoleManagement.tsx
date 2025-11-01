import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, X, Shield, UserCog } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type AppRole = 'admin' | 'dentist' | 'patient' | 'receptionist' | 'nurse' | 'manager';

interface UserWithRoles {
  id: string;
  full_name: string;
  email: string;
  roles: AppRole[];
}

const ROLE_COLORS: Record<AppRole, string> = {
  admin: "bg-red-500",
  dentist: "bg-blue-500",
  patient: "bg-green-500",
  receptionist: "bg-purple-500",
  nurse: "bg-pink-500",
  manager: "bg-orange-500"
};

const ROLE_DESCRIPTIONS: Record<AppRole, string> = {
  admin: "Full system access - All permissions",
  dentist: "Medical professional access",
  patient: "Patient portal access",
  receptionist: "Front desk & scheduling",
  nurse: "Clinical support access",
  manager: "Operational management"
};

export function RoleManagement() {
  const [users, setUsers] = useState<UserWithRoles[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState<Record<string, AppRole>>({});
  const { toast } = useToast();

  useEffect(() => {
    fetchUsersWithRoles();
  }, []);

  const fetchUsersWithRoles = async () => {
    try {
      setLoading(true);

      // Fetch all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, full_name, email")
        .order("full_name");

      if (profilesError) throw profilesError;

      // Fetch all user roles
      const { data: rolesData, error: rolesError } = await supabase
        .from("user_roles")
        .select("user_id, role");

      if (rolesError) throw rolesError;

      // Combine profiles with their roles
      const usersWithRoles: UserWithRoles[] = profiles.map(profile => ({
        id: profile.id,
        full_name: profile.full_name,
        email: profile.email,
        roles: rolesData
          .filter(r => r.user_id === profile.id)
          .map(r => r.role as AppRole)
      }));

      setUsers(usersWithRoles);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({
        title: "Error",
        description: "Failed to fetch users and roles",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addRole = async (userId: string) => {
    const role = selectedRole[userId];
    if (!role) {
      toast({
        title: "Error",
        description: "Please select a role to add",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase.rpc('assign_user_role', {
        _user_id: userId,
        _role: role
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: `Role "${role}" added successfully`,
      });

      // Clear selection
      setSelectedRole(prev => {
        const newState = { ...prev };
        delete newState[userId];
        return newState;
      });

      // Refresh the list
      await fetchUsersWithRoles();
    } catch (error: any) {
      console.error("Error adding role:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to add role",
        variant: "destructive",
      });
    }
  };

  const removeRole = async (userId: string, role: AppRole) => {
    try {
      const { error } = await supabase.rpc('remove_user_role', {
        _user_id: userId,
        _role: role
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: `Role "${role}" removed successfully`,
      });

      // Refresh the list
      await fetchUsersWithRoles();
    } catch (error: any) {
      console.error("Error removing role:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to remove role",
        variant: "destructive",
      });
    }
  };

  const getAvailableRoles = (userRoles: AppRole[]): AppRole[] => {
    const allRoles: AppRole[] = ['admin', 'dentist', 'patient', 'receptionist', 'nurse', 'manager'];
    return allRoles.filter(role => !userRoles.includes(role));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Role Legend */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Role Descriptions
          </CardTitle>
          <CardDescription>
            Admin role includes all permissions (doctor, receptionist, nurse, manager)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {Object.entries(ROLE_DESCRIPTIONS).map(([role, description]) => (
              <div key={role} className="flex items-start gap-2">
                <Badge className={ROLE_COLORS[role as AppRole]}>
                  {role}
                </Badge>
                <span className="text-sm text-muted-foreground">{description}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      <div className="space-y-3">
        {users.map((user) => {
          const availableRoles = getAvailableRoles(user.roles);

          return (
            <Card key={user.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div>
                      <h3 className="font-semibold flex items-center gap-2">
                        <UserCog className="h-4 w-4" />
                        {user.full_name}
                      </h3>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>

                    {/* Current Roles */}
                    <div className="flex flex-wrap gap-2">
                      {user.roles.length === 0 ? (
                        <Badge variant="outline">No roles assigned</Badge>
                      ) : (
                        user.roles.map((role) => (
                          <Badge
                            key={role}
                            className={`${ROLE_COLORS[role]} text-white`}
                          >
                            {role}
                            <button
                              onClick={() => removeRole(user.id, role)}
                              className="ml-2 hover:bg-white/20 rounded-full p-0.5"
                              title="Remove role"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Add Role */}
                  {availableRoles.length > 0 && (
                    <div className="flex items-center gap-2">
                      <Select
                        value={selectedRole[user.id] || ""}
                        onValueChange={(value) =>
                          setSelectedRole({ ...selectedRole, [user.id]: value as AppRole })
                        }
                      >
                        <SelectTrigger className="w-40">
                          <SelectValue placeholder="Add role..." />
                        </SelectTrigger>
                        <SelectContent>
                          {availableRoles.map((role) => (
                            <SelectItem key={role} value={role}>
                              {role}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        size="icon"
                        onClick={() => addRole(user.id)}
                        disabled={!selectedRole[user.id]}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}

        {users.length === 0 && (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No users found
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
