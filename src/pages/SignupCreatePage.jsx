import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import MobileLayout from "../components/layout/MobileLayout";
import KkirokLogo from "../components/common/KkirokLogo";
import AuthInput from "../components/common/AuthInput";
import BottomButton from "../components/common/BottomButton";

import ProfileIcon from "../assets/icons/Profile.svg";
import MessageIcon from "../assets/icons/Message.svg";
import LockIcon from "../assets/icons/Lock.svg";

export default function SignupCreatePage() {
  const navigate = useNavigate();
  const location = useLocation();

  const previousState = location.state ?? {};

  const verifiedEmail = previousState.email ?? "";
  const [name, setName] = useState(previousState.name ?? "");
  const [password, setPassword] = useState(previousState.password ?? "");
  const [error, setError] = useState("");

  const canGoNext =
    name.trim().length > 0 &&
    verifiedEmail.trim().length > 0 &&
    password.trim().length >= 8;

  const handleNext = () => {
    if (!name.trim()) {
      setError("성함을 입력해주세요.");
      return;
    }

    if (password.trim().length < 8) {
      setError("비밀번호는 8자리 이상 입력해주세요.");
      return;
    }

    navigate("/signup/profile", {
      state: {
        ...previousState,
        email: verifiedEmail,
        name: name.trim(),
        password: password.trim(),
      },
    });
  };

  return (
    <MobileLayout>
      <header className="absolute left-0 right-0 top-[96px] flex flex-col items-center">
        <p className="text-[16px] leading-none font-normal text-[#272932] tracking-[-0.02em]">
          Create account
        </p>

        <KkirokLogo className="mt-[5px]" />
      </header>

      <main className="absolute left-[58px] right-[58px] top-[336px]">
        <AuthInput
          icon={ProfileIcon}
          placeholder="성함"
          value={name}
          onChange={(value) => {
            setName(value);
            setError("");
          }}
        />

        <div className="mt-[18px]">
          <AuthInput
            icon={MessageIcon}
            placeholder="Email"
            value={verifiedEmail}
            readOnly
          />
        </div>

        <div className="mt-[18px]">
          <AuthInput
            icon={LockIcon}
            placeholder="비밀번호"
            value={password}
            onChange={(value) => {
              setPassword(value);
              setError("");
            }}
            type="password"
          />
        </div>

        {error && (
          <p className="mt-[9px] text-center text-[12px] font-light text-[#ff5b5b] tracking-[-0.02em]">
            {error}
          </p>
        )}
      </main>

      <BottomButton onClick={handleNext} disabled={!canGoNext}>
        다음
      </BottomButton>
    </MobileLayout>
  );
}