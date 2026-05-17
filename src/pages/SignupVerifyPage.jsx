import { useState } from "react";
import { useNavigate } from "react-router-dom";

import MobileLayout from "../components/layout/MobileLayout";
import KkirokLogo from "../components/common/KkirokLogo";
import AuthInput from "../components/common/AuthInput";
import BottomButton from "../components/common/BottomButton";
import { requestSchoolEmailVerification } from "../api/authApi";

import MessageIcon from "../assets/icons/Message.svg";

export default function SignupVerifyPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [verifyCode, setVerifyCode] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSending, setIsSending] = useState(false);

  const handleSendCode = async () => {
    if (!email.trim()) return;

    setError("");
    setMessage("");
    setIsSending(true);

    try {
      await requestSchoolEmailVerification(email.trim());
      setMessage("인증번호를 이메일로 보냈습니다.");
    } catch (sendError) {
      setError(sendError.message || "인증번호 발송에 실패했습니다.");
    } finally {
      setIsSending(false);
    }
  };

  const handleNext = () => {
    if (!email.trim() || !verifyCode.trim()) {
      setError("이메일과 인증번호를 입력해주세요.");
      return;
    }

    navigate("/signup/create", {
      state: {
        email: email.trim(),
        verificationCode: verifyCode.trim(),
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
              disabled={isSending}
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
              {isSending ? "발송" : "인증"}
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
              setError("");
            }}
          />
        </div>

        {message && (
          <p className="mt-[9px] text-center text-[12px] font-light text-[#6da60f] tracking-[-0.02em]">
            {message}
          </p>
        )}

        {error && (
          <p className="mt-[9px] text-center text-[12px] font-light text-[#ff5b5b] tracking-[-0.02em]">
            {error}
          </p>
        )}
      </main>

      <BottomButton onClick={handleNext}>다음</BottomButton>
    </MobileLayout>
  );
}
