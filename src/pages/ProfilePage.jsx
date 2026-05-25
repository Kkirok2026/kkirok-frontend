import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import MobileLayout from "../components/layout/MobileLayout";
import Modal from "../components/common/Modal";
import { clearAccessToken } from "../api/client";
import { logout } from "../api/authApi";
import { getMe } from "../api/userApi";

import ProfileImage from "../assets/icons/Vector.svg";
import IconProfile from "../assets/icons/Icon-Profile.svg";
import WorkoutProgressIcon from "../assets/icons/Workout-Progress.svg";

const PROFILE_INFO_ICONS = {
  targetWeight: IconProfile,
  targetPeriod: WorkoutProgressIcon,
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

function numberOrNull(value) {
  if (value === null || value === undefined || value === "") return null;

  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function formatDisplayNumber(value) {
  const number = numberOrNull(value);
  if (number === null) return "-";

  return Number.isInteger(number)
    ? `${number}`
    : `${Number(number.toFixed(1))}`;
}

function clampProgress(value) {
  if (!Number.isFinite(value)) return 0;
  return Math.min(1, Math.max(0, value));
}

function getTargetPeriodTotalDays(profile) {
  const value = numberOrNull(getTargetPeriodValue(profile));
  if (!value) return null;

  const unit = `${getTargetPeriodUnit(profile) ?? "MONTH"}`.toUpperCase();
  if (unit === "WEEK" || unit === "WEEKS") return value * 7;
  if (unit === "DAY" || unit === "DAYS") return value;
  if (unit === "YEAR" || unit === "YEARS") return value * 365;

  return value * 30;
}

function getRemainingDays(profile) {
  const remainingDays = numberOrNull(profile?.targetRemainingDays);
  if (remainingDays !== null) return Math.max(0, Math.round(remainingDays));

  return null;
}

function getPeriodProgress(profile) {
  const totalDays = getTargetPeriodTotalDays(profile);
  const remainingDays = getRemainingDays(profile);

  if (!totalDays || remainingDays === null) return 0;
  return clampProgress((totalDays - remainingDays) / totalDays);
}

function getWeightProgress(profile) {
  const currentWeight = numberOrNull(profile?.weightKg);
  const targetWeight = numberOrNull(profile?.targetWeightKg);

  if (!currentWeight || !targetWeight) return 0;

  if (currentWeight > targetWeight) {
    return clampProgress(targetWeight / currentWeight);
  }

  return clampProgress(currentWeight / targetWeight);
}

function getRemainingWeightLabel(profile) {
  const currentWeight = numberOrNull(profile?.weightKg);
  const targetWeight = numberOrNull(profile?.targetWeightKg);

  if (currentWeight === null || targetWeight === null) return "-";

  const remainingWeight = Math.abs(currentWeight - targetWeight);
  if (remainingWeight === 0) return "목표 달성";

  return `${formatDisplayNumber(remainingWeight)}kg 남음`;
}

function GoalSemiArc({ progress, className, color, strokeWidth, d }) {
  const dash = clampProgress(progress) * 100;

  return (
    <>
      <path
        d={d}
        fill="none"
        pathLength="100"
        stroke="#e8ebf1"
        strokeLinecap="round"
        strokeWidth={strokeWidth}
        className={className}
      />
      <path
        d={d}
        fill="none"
        pathLength="100"
        stroke={color}
        strokeDasharray={`${dash} 100`}
        strokeLinecap="round"
        strokeWidth={strokeWidth}
        className={className}
      />
    </>
  );
}

function GoalProgressOverview({ profile }) {
  const remainingDays = getRemainingDays(profile);
  const remainingWeightLabel = getRemainingWeightLabel(profile);

  return (
    <section className="mt-[45px] flex flex-col items-center">
      <p className="text-[13px] font-bold leading-[19px] text-[#8a8c90]">
        목표기간 현황
      </p>
      <p className="mt-[7px] text-[35px] font-bold leading-[43px] text-[#8f9197]">
        {remainingDays === null ? "-" : `${remainingDays}일 남음`}
      </p>

      <div className="relative mt-[2px] h-[176px] w-[305px]">
        <svg
          aria-hidden="true"
          className="absolute left-1/2 top-0 h-[176px] w-[305px] -translate-x-1/2"
          viewBox="0 0 305 176"
        >
          <GoalSemiArc
            progress={getPeriodProgress(profile)}
            color="#ffad54"
            strokeWidth="22"
            d="M 27 151 A 125 125 0 0 1 278 151"
          />
          <GoalSemiArc
            progress={getWeightProgress(profile)}
            color="#a8d95d"
            strokeWidth="28"
            d="M 74 151 A 78 78 0 0 1 231 151"
          />
        </svg>

        <div className="absolute left-0 right-0 top-[105px] text-center">
          <p className="text-[13px] font-bold leading-[19px] text-[#8a8c90]">
            몸무게 현황
          </p>
          <p className="mt-[4px] text-[26px] font-bold leading-[34px] text-[#8f9197]">
            {remainingWeightLabel}
          </p>
        </div>
      </div>
    </section>
  );
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
  const [error, setError] = useState("");
  const [modal, setModal] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let ignore = false;

    async function loadProfile() {
      setError("");

      try {
        const meResponse = await getMe();

        if (ignore) return;

        setMe(meResponse);
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
              className="ml-auto flex h-[24px] w-[67px] shrink-0 items-center justify-center rounded-full shadow-[0_8px_16px_rgba(39,41,50,0.16)]"
            >
              <span className="block h-[18px] w-[23px] text-center text-[11px] font-normal leading-[18px] text-white">
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

        <GoalProgressOverview profile={profile} />

        <section className="mt-[20px] space-y-[14px]">
          <ProfileInfoCard
            iconSrc={PROFILE_INFO_ICONS.targetWeight}
            iconAlt="목표 몸무게"
            title="목표 몸무게"
            value={valueOrDash(profile?.targetWeightKg, " kg")}
          />

          <ProfileInfoCard
            iconSrc={PROFILE_INFO_ICONS.targetPeriod}
            iconAlt="목표 기간"
            title="목표 기간"
            value={periodLabel(profile)}
          />
        </section>

        <div className="mt-[96px] flex justify-between text-[11px] font-light text-[#8a8c90]">
          <button type="button" onClick={() => setModal("logout")}>
            로그아웃
          </button>

          <button type="button" onClick={() => navigate("/profile/delete")}>
            회원탈퇴
          </button>
        </div>
      </div>

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
