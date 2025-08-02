"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import EditUserInfoDialog from "@/components/modals/AccountEdit";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface UserInfo {
  first_name: string;
  last_name: string;
  email: string;
}



export default function AccountPage() {
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
  });

  useEffect(() => {
    const fetchUserInfo = async () => {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (!user) {
        console.error(userError);
        return;
      }

      const { data } = await supabase
        .from("user_info")
        .select("*")
        .eq("id", user.id)
        .single();

      if (data) {
        setUserInfo({ ...data, email: user.email });
        setForm({
          first_name: data.first_name || "",
          last_name: data.last_name || "",
          email: user.email || "",
        });
      } else {
        setForm({
          first_name: "",
          last_name: "",
          email: user.email || "",
        });
      }

      setLoading(false);
    };

    fetchUserInfo();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from("user_info").upsert({
      id: user.id,
      first_name: form.first_name,
      last_name: form.last_name,
    });

    if (!error) {
      toast("User info saved!");
      setUserInfo({
        first_name: form.first_name,
        last_name: form.last_name,
        email: form.email,
      });
    } else {
      console.error("Error saving user info:", error);
    }
  };

  if (loading) return <p className="text-gray-600">Loading...</p>;

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-gray-800">Account Settings</h1>

      {/* Profile card */}
      <div className="bg-white rounded-xl shadow-sm border p-6 flex gap-6 items-center">
        <picture>
          <img
            src="/avatar-placeholder.png"
            alt="avatar"
            className="w-24 h-24 rounded-full border object-cover"
          />
        </picture>
        <div className="flex-1">
          <h2 className="text-xl font-semibold text-gray-800">
            {userInfo?.first_name} {userInfo?.last_name}
          </h2>
          <p className="text-gray-500">{userInfo?.email}</p>
        </div>
        <EditUserInfoDialog
          form={form}
          onChange={handleChange}
          onSave={handleSave}
          trigger={<Button variant="outline">Edit</Button>}
        />
      </div>

      {/* Info table */}
      {userInfo?.first_name && userInfo?.last_name && (
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            User Information
          </h3>
          <table className="w-full text-sm text-left text-gray-600">
            <tbody>
              <tr className="border-b">
                <th className="py-2 pr-4 font-medium text-gray-700">
                  First Name
                </th>
                <td className="py-2">{userInfo.first_name}</td>
              </tr>
              <tr className="border-b">
                <th className="py-2 pr-4 font-medium text-gray-700">
                  Last Name
                </th>
                <td className="py-2">{userInfo.last_name}</td>
              </tr>
              <tr className="border-b">
                <th className="py-2 pr-4 font-medium text-gray-700">Email</th>
                <td className="py-2">{userInfo.email}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
