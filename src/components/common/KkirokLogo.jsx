export default function KkirokLogo({ className = "" }) {
    return (
      <div
        className={[
          "flex items-end justify-center leading-none text-[#272932]",
          className,
        ].join(" ")}
      >
        <span className="text-[28px] font-extrabold leading-none tracking-[-0.18em]">
          77
        </span>
        <span className="ml-[-5px] text-[25px] font-extrabold leading-none tracking-[-0.1em]">
          ㅣ록
        </span>
      </div>
    );
  }