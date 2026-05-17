import { Link, useNavigate } from "react-router-dom";
import { useRef, useState } from "react";

import MobileLayout from "../components/layout/MobileLayout";
import KkirokLogo from "../components/common/KkirokLogo";
import BottomButton from "../components/common/BottomButton";

import MessageIcon from "../assets/icons/Message.svg";
import LockIcon from "../assets/icons/Lock.svg";
import HidePasswordIcon from "../assets/icons/Hide-Password.svg";

function LoginField({
  icon,
  rightIcon,
  placeholder,
  value,
  onChange,
  isPassword = false,
  passwordHidden = false,
  onRightIconClick,
}) {
  const inputRef = useRef(null);
  const [isFocused, setIsFocused] = useState(false);

  const displayValue =
    isPassword && passwordHidden ? "*".repeat(value.length) : value;

  const handleKeyDown = (event) => {
    if (!isPassword || !passwordHidden) return;

    if (event.metaKey || event.ctrlKey || event.altKey) return;

    if (event.key === "Backspace") {
      event.preventDefault();
      onChange(value.slice(0, -1));
      return;
    }

    if (event.key === "Delete") {
      event.preventDefault();
      return;
    }

    if (event.key.length === 1) {
      event.preventDefault();
      onChange(value + event.key);
    }
  };

  const handleChange = (event) => {
    if (isPassword && passwordHidden) return;
    onChange(event.target.value);
  };

  return (
    <div
      role="presentation"
      onClick={() => inputRef.current?.focus()}
      className="h-[40px] rounded-[10px] bg-[#f8f8f8] px-[13px] flex items-center cursor-text"
    >
      <img
        src={icon}
        alt=""
        className="w-[16px] h-[16px] object-contain shrink-0 opacity-75"
      />

      <input
        ref={inputRef}
        type="text"
        value={displayValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={isFocused ? "" : placeholder}
        className="ml-[10px] w-full min-w-0 bg-transparent outline-none text-[12px] font-light text-[#272932] placeholder:text-[12px] placeholder:font-light placeholder:text-[#a0a0a0] caret-[#272932]"
      />

      {rightIcon && (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onRightIconClick?.();
            inputRef.current?.focus();
          }}
          className="ml-[8px] w-[20px] h-[20px] flex items-center justify-center shrink-0"
          aria-label="비밀번호 보기 전환"
        >
          <img
            src={rightIcon}
            alt=""
            className="w-[16px] h-[16px] object-contain opacity-70"
          />
        </button>
      )}
    </div>
  );
}

export default function LoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordHidden, setPasswordHidden] = useState(true);

  const handleSubmit = (event) => {
    event.preventDefault();
    navigate("/home");
  };

  return (
    <MobileLayout>
      <form onSubmit={handleSubmit} className="absolute inset-0">
        <header className="absolute left-0 right-0 top-[96px] flex flex-col items-center">
          <p className="text-[16px] leading-none font-normal text-[#272932] tracking-[-0.02em]">
            Log in
          </p>

          <KkirokLogo className="mt-[5px]" />
        </header>

        <div className="absolute left-[58px] right-[58px] top-[358px]">
          <div className="space-y-[18px]">
            <LoginField
              icon={MessageIcon}
              placeholder="school Email"
              value={email}
              onChange={setEmail}
            />

            <LoginField
              icon={LockIcon}
              rightIcon={HidePasswordIcon}
              placeholder="Parol"
              value={password}
              onChange={setPassword}
              isPassword
              passwordHidden={passwordHidden}
              onRightIconClick={() => setPasswordHidden((prev) => !prev)}
            />
          </div>

          <Link
            to="/signup"
            className="mt-[15px] block text-center text-[12px] font-light text-[#9f9f9f] underline underline-offset-[2px]"
          >
            회원가입
          </Link>
        </div>

        <BottomButton type="submit">로그인</BottomButton>
      </form>
    </MobileLayout>
  );
}