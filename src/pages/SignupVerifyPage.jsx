import { useState } from "react";
import { useNavigate } from "react-router-dom";

import MobileLayout from "../components/layout/MobileLayout";
import KkirokLogo from "../components/common/KkirokLogo";
import AuthInput from "../components/common/AuthInput";
import BottomButton from "../components/common/BottomButton";

import MessageIcon from "../assets/icons/Message.svg";

const MOCK_VERIFY_CODE = "123456";

export default function SignupVerifyPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [verifyCode, setVerifyCode] = useState("");
  const [hasError, setHasError] = useState(false);

  const handleSendCode = () => {
    if (!email.trim()) return;

    setHasError(false);
    console.log("프론트 테스트용 인증번호:", MOCK_VERIFY_CODE);
  };

  const handleNext = () => {
    if (verifyCode.trim() !== MOCK_VERIFY_CODE) {
      setHasError(true);
      return;
    }

    navigate("/signup/create", {
      state: {
        email,
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

      <main className="absolute left-[58px] right-[58px] top-[358px]">
        <AuthInput
          icon={MessageIcon}
          placeholder="Email"
          value={email}
          onChange={setEmail}
          rightElement={
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                handleSendCode();
              }}
              style={{
                width: "58px",
                height: "26px",
                borderRadius: "999px",
                backgroundColor: "#f1f0e9",
                color: "#272932",
                fontSize: "11px",
                fontWeight: 300,
                lineHeight: "26px",
              }}
            >
              인증
            </button>
          }
        />

        <div className="mt-[18px]">
          <AuthInput
            icon={MessageIcon}
            placeholder="인증번호"
            value={verifyCode}
            onChange={(value) => {
              setVerifyCode(value);
              setHasError(false);
            }}
          />
        </div>

        {hasError && (
          <p className="mt-[9px] text-center text-[12px] font-light text-[#ff5b5b] tracking-[-0.02em]">
            인증번호가 틀립니다. 다시 입력해주세요
          </p>
        )}
      </main>

      <BottomButton onClick={handleNext}>다음</BottomButton>
    </MobileLayout>
  );
}