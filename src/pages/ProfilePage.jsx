import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import MobileLayout from "../components/layout/MobileLayout";
import PageHeader from "../components/layout/PageHeader";
import BottomNav from "../components/layout/BottomNav";
import { clearAccessToken } from "../api/client";
import { logout } from "../api/authApi";
import { getAllergies, getMe } from "../api/userApi";

function valueOrDash(value, suffix = "") {
  if (value === null || value === undefined || value === "") return "-";
  return `${value}${suffix}`;
}

export default function ProfilePage() {
  const navigate = useNavigate();
  const [me, setMe] = useState(null);
  const [allergies, setAllergies] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    async function loadProfile() {
      setError("");

      try {
        const [meResponse, allergyResponse] = await Promise.all([
          getMe(),
          getAllergies(),
        ]);

        if (ignore) return;

        setMe(meResponse);
        setAllergies(allergyResponse?.items ?? []);
      } catch (loadError) {
        if (ignore) return;

        if (loadError.status === 401) {
          navigate("/login", { replace: true });
          return;
        }

        setError(loadError.message || "프로필을 불러오지 못했습니다.");
      }
    }

    loadProfile();

    return () => {
      ignore = true;
    };
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch {
      // 토큰이 이미 만료된 경우에도 로컬 세션은 정리합니다.
    } finally {
      clearAccessToken();
      navigate("/login", { replace: true });
    }
  };

  const profile = me?.profile;
  const allergyText =
    allergies.length > 0
      ? allergies.map((allergy) => allergy.name).join(", ")
      : "등록된 알레르기 없음";

  return (
    <MobileLayout>
      <div className="absolute inset-0 overflow-y-auto px-8 pb-[126px]">
        <PageHeader title="Profile" />

        {error && <p className="mb-5 text-xs text-[#ff5b5b]">{error}</p>}

        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 rounded-full bg-neutral-200 flex items-center justify-center text-sm font-bold text-neutral-500">
            {me?.name?.slice(0, 1) || "U"}
          </div>

          <div>
            <p className="font-bold">{me?.name || "-"}</p>
            <p className="text-[11px] text-neutral-400">{me?.email || ""}</p>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="ml-auto px-6 h-9 rounded-full bg-neutral-800 text-white text-xs font-bold"
          >
            로그아웃
          </button>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-8">
          {[
            { label: "키", value: valueOrDash(profile?.heightCm, "cm") },
            { label: "몸무게", value: valueOrDash(profile?.weightKg, "kg") },
            { label: "BMI", value: valueOrDash(profile?.bmi) },
          ].map((item) => (
            <div
              key={item.label}
              className="h-16 rounded-2xl border border-neutral-200 flex flex-col items-center justify-center shadow-sm"
            >
              <p className="text-sm font-bold">{item.value}</p>
              <p className="text-[10px] text-neutral-400">{item.label}</p>
            </div>
          ))}
        </div>

        <div className="space-y-5">
          <ProfileBox
            title="목표 몸무게"
            value={valueOrDash(profile?.targetWeightKg, "kg")}
          />
          <ProfileBox
            title="활동 수준"
            value={valueOrDash(profile?.activityLevel)}
          />
          <ProfileBox title="알러지" value={allergyText} />
        </div>
      </div>

      <BottomNav />
    </MobileLayout>
  );
}

function ProfileBox({ title, value }) {
  return (
    <div className="rounded-2xl border border-neutral-200 p-5 shadow-sm">
      <p className="font-bold mb-3">{title}</p>
      <p className="text-neutral-500 text-sm leading-6">{value}</p>
    </div>
  );
}
