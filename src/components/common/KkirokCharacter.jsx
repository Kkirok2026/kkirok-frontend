import duckIntro from "../../assets/images/duck_intro.png";
import duckLoading from "../../assets/images/duck_loading.png";
import duckResult from "../../assets/images/duck_result.png";
import duckNavi from "../../assets/images/duck_navi.png";

const characterImages = {
  intro: duckIntro,
  loading: duckLoading,
  result: duckResult,
  navi: duckNavi,
};

export default function KkirokCharacter({
  variant = "intro",
  alt = "끼록 캐릭터",
  className = "",
}) {
  const src = characterImages[variant] ?? characterImages.intro;

  return (
    <img
      src={src}
      alt={alt}
      className={["object-contain", className].join(" ")}
    />
  );
}