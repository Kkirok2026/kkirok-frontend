import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import MobileLayout from "../components/layout/MobileLayout";
import BottomNav from "../components/layout/BottomNav";
import Modal from "../components/common/Modal";
import { clearAccessToken } from "../api/client";
import { logout } from "../api/authApi";
import { getAllergies, getMe } from "../api/userApi";

import ProfileImage from "../assets/icons/Vector.svg";
import IconProfile from "../assets/icons/Icon-Profile.svg";
import WorkoutProgressIcon from "../assets/icons/Workout-Progress.svg";
import CheckIcon from "../assets/icons/Check.svg";

const PROFILE_INFO_ICONS = {
  targetWeight: IconProfile,
  targetPeriod: WorkoutProgressIcon,
  allergy: CheckIcon,
};

function valueOrDash(value, suffix = "") {
  if (value === null || value === undefined || value === "") return "-";
  return `${value}${suffix}`;
}

function firstValue(...values) {
  return values.find(
    (value) => value !== null && value !== undefined && value !== ""
  );
}

function getTargetPeriodValue(profile) {
  return firstValue(
    profile?.targetPeriodValue,
    profile?.targetPeriod?.value,
    profile?.targetDurationValue,
    profile?.targetDuration?.value,
    profile?.goalPeriodValue,
    profile?.goalPeriod?.value,
    profile?.periodValue,
    profile?.durationValue
  );
}

function getTargetPeriodUnit(profile) {
  return firstValue(
    profile?.targetPeriodUnit,
    profile?.targetPeriod?.unit,
    profile?.targetDurationUnit,
    profile?.targetDuration?.unit,
    profile?.goalPeriodUnit,
    profile?.goalPeriod?.unit,
    profile?.periodUnit,
    profile?.durationUnit
  );
}

function periodLabel(profile) {
  const unitFromProfile = getTargetPeriodUnit(profile);
  const valueFromProfile = getTargetPeriodValue(profile);

  if (!unitFromProfile && !valueFromProfile) return "-";

  const value = valueFromProfile ?? 1;
  const unit = `${unitFromProfile ?? "MONTH"}`.toUpperCase();

  if (unit === "WEEK" || unit === "WEEKS") return `${value} week`;
  if (unit === "YEAR" || unit === "YEARS") return `${value} year`;
  if (unit === "DAY" || unit === "DAYS") return `${value} day`;

  if (Number(value) === 12) return "1 year";
  return `${value} month`;
}

function allergyLabel(items) {
  if (!items.length) return "등록된 알레르기 없음";
  return items.map((allergy) => allergy.name).filter(Boolean).join(", ");
}

function StatCard({ label, value }) {
  return (
    <div className="flex h-[58px] flex-col items-center justify-center rounded-[10px] border border-[#d7d0d0] bg-white shadow-[0_10px_30px_rgba(29,22,23,0.06)]">
      <p className="text-[12px] font-medium leading-[18px] text-[#272932]">
        {value}
      </p>
      <p className="mt-[1px] text-[9px] font-light leading-[13px] text-[#7b6f72]">
        {label}
      </p>
    </div>
  );
}

function ProfileInfoCard({ title, value, iconSrc, iconAlt }) {
  return (
    <div className="h-[86px] rounded-[10px] border border-[#d7d0d0] bg-white px-[19px] pt-[17px] shadow-[0_10px_30px_rgba(29,22,23,0.06)]">
      <div className="flex items-center gap-[9px]">
        <img
          src={iconSrc}
          alt={iconAlt}
          className="h-[17px] w-[17px] shrink-0 object-contain"
        />

        <p className="text-[14px] font-bold leading-[20px] text-[#1d1617]">
          {title}
        </p>
      </div>

      <p className="mt-[10px] truncate text-[12px] font-light leading-[16px] text-[#7b6f72]">
        {value}
      </p>
    </div>
  );
}

export default function ProfilePage() {
  const navigate = useNavigate();
  const location = useLocation();

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
  }, [location.key, navigate]);

  const handleLogout = async () => {
    setIsSubmitting(true);

    try {
      await logout();
    } catch {
      // 로그아웃 API가 실패해도 프론트 토큰은 제거한다.
    } finally {
      clearAccessToken();
      setIsSubmitting(false);
      navigate("/login", { replace: true });
    }
  };

  const handleEdit = () => {
    const profile = me?.profile || {};
    const targetPeriodValue = getTargetPeriodValue(profile);
    const targetPeriodUnit = getTargetPeriodUnit(profile);

    navigate("/profile/edit", {
      state: {
        height: `${profile.heightCm ?? ""}`,
        weight: `${profile.weightKg ?? ""}`,
        age: `${me?.age ?? ""}`,
        gender: profile.gender || "FEMALE",
        allergies,
        allergyText: allergyLabel(allergies),
        targetWeight: `${profile.targetWeightKg ?? ""}`,
        periodValue: `${targetPeriodValue ?? ""}`,
        periodUnit:
          `${targetPeriodUnit ?? "MONTH"}`.toUpperCase() === "WEEK"
            ? "week"
            : "month",
        activityLevel: profile.activityLevel || "LOW_ACTIVE",
      },
    });
  };

  const profile = me?.profile;

  return (
    <MobileLayout>
      <div className="absolute inset-0 overflow-y-auto bg-white px-[49px] pb-[136px]">
        <header className="pt-[64px] text-center">
          <h1 className="text-[14px] font-bold leading-[21px] text-[#1d1617]">
            Profile
          </h1>
        </header>

        {error && (
          <p className="mt-[20px] text-center text-[12px] text-[#ff5b5b]">
            {error}
          </p>
        )}

        <section className="mt-[60px]">
          <div className="flex items-center">
            <div className="flex h-[42px] w-[42px] shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#e8e8e8]">
              <img
                src={ProfileImage}
                alt="프로필 이미지"
                className="h-full w-full object-cover"
              />
            </div>

            <p className="ml-[14px] truncate text-[13px] font-medium leading-[20px] text-[#1d1617]">
              {me?.name || "-"}
            </p>

            <button
              type="button"
              onClick={handleEdit}
              style={{ backgroundColor: "#272932", color: "#ffffff" }}
              className="ml-auto flex h-[30px] w-[84px] shrink-0 items-center justify-center rounded-full shadow-[0_8px_16px_rgba(39,41,50,0.16)]"
            >
              <span className="block h-[18px] w-[23px] text-center text-[12px] font-normal leading-[18px] text-white">
                수정
              </span>
            </button>
          </div>

          <div className="mt-[16px] grid grid-cols-3 gap-[10px]">
            <StatCard
              label="Height"
              value={valueOrDash(profile?.heightCm, "cm")}
            />
            <StatCard
              label="Weight"
              value={valueOrDash(profile?.weightKg, "kg")}
            />
            <StatCard label="BMI" value={valueOrDash(profile?.bmi)} />
          </div>
        </section>

        <section className="mt-[41px] space-y-[14px]">
          <ProfileInfoCard
            iconSrc={PROFILE_INFO_ICONS.targetWeight}
            iconAlt="목표 몸무게"
            title="목표 몸무게"
            value={valueOrDash(profile?.targetWeightKg, "kg")}
          />

          <ProfileInfoCard
            iconSrc={PROFILE_INFO_ICONS.targetPeriod}
            iconAlt="목표 기간"
            title="목표 기간"
            value={periodLabel(profile)}
          />

          <ProfileInfoCard
            iconSrc={PROFILE_INFO_ICONS.allergy}
            iconAlt="알러지"
            title="알러지"
            value={allergyLabel(allergies)}
          />
        </section>

        <div className="mt-[64px] flex justify-between px-[2px] text-[10px] font-light text-[#8a8c90]">
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
  onConfirm={handleLogout}
  onCancel={() => setModal("")}
  overlayClassName="bg-black/90"
  confirmVariant="black"
  confirmClassName="!w-[255px] !h-[42.63px] !rounded-[10px] !bg-black !text-white"
  confirmTextClassName="block w-[49px] h-[16px] text-[13px] leading-[16px] font-bold text-white"
/>

    </MobileLayout>
  );
}