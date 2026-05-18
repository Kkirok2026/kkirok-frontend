import LogoIcon from "../../assets/icons/77I록.svg";

export default function KkirokLogo({ className = "" }) {
  return (
    <img
      src={LogoIcon}
      alt="끼록"
      className={["h-[23px] w-[60px] object-contain", className].join(" ")}
    />
  );
}