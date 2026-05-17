import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import MobileLayout from "../components/layout/MobileLayout";
import BottomNav from "../components/layout/BottomNav";
import Modal from "../components/common/Modal";
import { clearAccessToken } from "../api/client";
import { logout } from "../api/authApi";
import { getAllergies, getMe } from "../api/userApi";
import { targetPeriodLabel } from "../utils/mealData";

function valueOrDash(value, suffix = "") {
  if (value === null || value === undefined || value === "") return "-";
  return `${value}${suffix}`;
}

function StatCard({ label, value }) {
  return (
    <div className="h-[65px] rounded-[16px] border border-[#ada4a5] bg-white shadow-[0_10px_40px_rgba(29,22,23,0.07)] flex flex-col items-center justify-center">
      <p className="text-[14px] leading-[21px] font-medium text-[#272932]">
        {value}
      </p>
      <p className="mt-[2px] text-[12px] leading-[18px] text-[#7b6f72]">
        {label}
      </p>
    </div>
  );
}

function ProfileInfoCard({ title, value, marker }) {
  return (
    <div className="h-[99px] rounded-[16px] border border-[#ada4a5] bg-white px-[20px] pt-[20px] shadow-[0_10px_40px_rgba(29,22,23,0.07)]">
      <div className="flex items-center gap-[10px]">
        <span className="flex h-[20px] w-[20px] items-center justify-center rounded-[6px] border border-[#272932] text-[10px] font-bold text-[#272932]">
          {marker}
        </span>
        <p className="text-[16px] leading-[24px] font-bold text-[#1d1617]">
          {title}
        </p>
      </div>
      <p className="mt-[12px] text-[16px] leading-[18px] text-[#7b6f72] truncate">
        {value}
      </p>
    </div>
  );
}

export default function ProfilePage() {
  const navigate = useNavigate();
  const [me, setMe] = useState(null);
  const [allergies, setAllergies] = useState([]);
  const [error, setError] = useState("");
  const [modal, setModal] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    setIsSubmitting(true);

    try {
      await logout();
    } catch {
    } finally {
      clearAccessToken();
      setIsSubmitting(false);
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
      <div className="absolute inset-0 overflow-y-auto bg-white px-[55px] pb-[136px]">
        <header className="pt-[65px] text-center">
          <h1 className="text-[16px] leading-[24px] font-bold text-[#1d1617]">
            Profile
          </h1>
        </header>

        {error && (
          <p className="mt-[22px] text-center text-[12px] text-[#ff5b5b]">
            {error}
          </p>
        )}

        <section className="mt-[68px]">
          <div className="flex items-center">
            <div className="h-[55px] w-[55px] rounded-full bg-[#d8d8d8] flex items-center justify-center text-[18px] font-bold text-[#7b6f72]">
              {me?.name?.slice(0, 1) || "U"}
            </div>
            <p className="ml-[14px] text-[14px] leading-[21px] font-medium text-[#1d1617]">
              {me?.name || "-"}
            </p>
            <button
              type="button"
              onClick={() => navigate("/profile/edit")}
              className="ml-auto h-[32px] w-[96px] rounded-full bg-[#272932] text-[12px] font-bold text-white shadow-[0_10px_18px_rgba(39,41,50,0.18)]"
            >
              프로필 수정
            </button>
          </div>

          <div className="mt-[15px] grid grid-cols-3 gap-[15px]">
            <StatCard label="키" value={valueOrDash(profile?.heightCm, "cm")} />
            <StatCard
              label="몸무게"
              value={valueOrDash(profile?.weightKg, "kg")}
            />
            <StatCard label="BMI" value={valueOrDash(profile?.bmi)} />
          </div>
        </section>

        <section className="mt-[57px] space-y-[15px]">
          <ProfileInfoCard
            marker="W"
            title="목표 몸무게"
            value={valueOrDash(profile?.targetWeightKg, "kg")}
          />
          <ProfileInfoCard
            marker="B"
            title="목표 기간"
            value={targetPeriodLabel(
              profile?.targetPeriodValue,
              profile?.targetPeriodUnit
            )}
          />
          <ProfileInfoCard
            marker="A"
            title="활동 수준"
            value={valueOrDash(profile?.activityLevel)}
          />
          <ProfileInfoCard marker="C" title="알러지" value={allergyText} />
        </section>

        <div className="mt-[28px] flex justify-between px-[4px] text-[13px] text-[#7b6f72]">
          <button type="button" onClick={() => setModal("logout")}>
            로그아웃
          </button>
          <button type="button" onClick={() => navigate("/profile/delete")}>
            회원탈퇴
          </button>
        </div>
      </div>

      <BottomNav />

      <Modal
        open={modal === "logout"}
        title="로그아웃 하시겠습니까?"
        confirmText={isSubmitting ? "처리 중..." : "로그아웃"}
        cancelText="취소"
        onConfirm={handleLogout}
        onCancel={() => setModal("")}
      />
    </MobileLayout>
  );
}
